import assert from 'node:assert/strict'
import { signInWithFirebase } from '../../server/auth/firebaseAuth.ts'

const originalFetch = globalThis.fetch

const input = {
  webApiKey: 'chave-ficticia',
  email: 'teste@example.invalid',
  password: ' senha ficticia de teste ',
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function expectStatus(response, expected) {
  globalThis.fetch = async () => response

  const result = await signInWithFirebase(input)

  assert.deepEqual(result, { status: expected })
}

try {
  // Confere a requisição e os dados retornados pelo módulo.
  globalThis.fetch = async (url, options) => {
    const address = new URL(url)

    assert.equal(address.protocol, 'https:')
    assert.equal(address.hostname, 'identitytoolkit.googleapis.com')
    assert.equal(
      address.pathname,
      '/v1/accounts:signInWithPassword',
    )
    assert.equal(address.searchParams.get('key'), input.webApiKey)

    assert.equal(options.method, 'POST')
    assert.equal(options.redirect, 'manual')
    assert.ok(options.signal instanceof AbortSignal)

    assert.deepEqual(JSON.parse(options.body), {
      email: input.email,
      password: input.password,
      returnSecureToken: true,
    })

    return jsonResponse({
      localId: 'uid-ficticio',
      email: input.email,
      idToken: 'token-ficticio-nao-deve-ser-retornado',
      refreshToken: 'refresh-ficticio-nao-deve-ser-retornado',
    })
  }

  assert.deepEqual(await signInWithFirebase(input), {
    status: 'verified',
    uid: 'uid-ficticio',
  })
  console.log('PASSOU: requisição correta e retorno limitado ao UID.')

  // Redirecionamentos não podem ser seguidos.
  for (const status of [301, 302, 303, 307, 308]) {
    await expectStatus(
      new Response('', {
        status,
        headers: {
          Location: 'https://outro.example',
        },
      }),
      'unavailable',
    )
  }
  console.log('PASSOU: respostas de redirecionamento recusadas.')

  for (const code of [
    'INVALID_LOGIN_CREDENTIALS',
    'INVALID_PASSWORD',
    'EMAIL_NOT_FOUND',
    'USER_DISABLED',
  ]) {
    await expectStatus(
      jsonResponse({ error: { message: code } }, 400),
      'rejected',
    )
  }
  console.log('PASSOU: recusas de autenticação tratadas sem detalhes públicos.')

  await expectStatus(
    jsonResponse({
      error: { message: 'TOO_MANY_ATTEMPTS_TRY_LATER' },
    }, 400),
    'limited',
  )
  await expectStatus(new Response('', { status: 429 }), 'limited')
  console.log('PASSOU: limitações do provedor identificadas.')

  await expectStatus(
    new Response('', { status: 503 }),
    'unavailable',
  )
  await expectStatus(
    jsonResponse({
      error: { message: 'API_KEY_INVALID' },
    }, 400),
    'unavailable',
  )
  console.log('PASSOU: falhas de serviço ou configuração não são senha incorreta.')

  await expectStatus(
    new Response('resposta inválida', { status: 200 }),
    'unavailable',
  )
  await expectStatus(
    jsonResponse({ email: input.email }),
    'unavailable',
  )
  await expectStatus(
    jsonResponse({
      localId: 'uid-ficticio',
      email: 'outro@example.invalid',
    }),
    'unavailable',
  )
  console.log('PASSOU: respostas inválidas ou inconsistentes recusadas.')

  globalThis.fetch = async () => {
    throw new Error('Falha de rede simulada')
  }

  assert.deepEqual(await signInWithFirebase(input), {
    status: 'unavailable',
  })
  console.log('PASSOU: falha de rede não é tratada como senha incorreta.')

  globalThis.fetch = async () => {
    throw new DOMException('Cancelamento simulado', 'AbortError')
  }

  assert.deepEqual(await signInWithFirebase(input), {
    status: 'unavailable',
  })
  console.log('PASSOU: cancelamento tratado como indisponibilidade.')

  let calls = 0

  globalThis.fetch = async () => {
    calls++
    throw new Error('Esta chamada não deveria acontecer')
  }

  assert.deepEqual(
    await signInWithFirebase({ ...input, webApiKey: '' }),
    { status: 'unavailable' },
  )
  assert.deepEqual(
    await signInWithFirebase({ ...input, password: '' }),
    { status: 'rejected' },
  )
  assert.equal(calls, 0)
  console.log('PASSOU: entradas inválidas não enviam requisições.')
} finally {
  globalThis.fetch = originalFetch
}