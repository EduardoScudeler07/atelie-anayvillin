import fixture from '../../tests/auth/pbkdf2-fixture.json'

interface Env {
  AUTH_PROBE_SECRET?: string
}

function reply(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const onRequest: PagesFunction<Env> = async ({
  request,
  env,
}) => {
  // Sem o segredo configurado, o teste fica indisponível.
  if (!env.AUTH_PROBE_SECRET) {
    return reply({ erro: 'Não encontrado.' }, 404)
  }

  if (request.method !== 'POST') {
    return new Response(null, {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    })
  }

  const encoder = new TextEncoder()
  const authorization = request.headers.get('Authorization') ?? ''
  const expected = `Bearer ${env.AUTH_PROBE_SECRET}`

  // Compara valores de tamanho fixo sem comparar o segredo diretamente.
  const receivedDigest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(authorization),
  )
  const expectedDigest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(expected),
  )

  if (!crypto.subtle.timingSafeEqual(receivedDigest, expectedDigest)) {
    return reply({ erro: 'Não autorizado.' }, 401)
  }

  const testCase = request.headers.get('X-Probe-Case')

  if (testCase !== 'correct' && testCase !== 'incorrect') {
    return reply({ erro: 'Caso de teste inválido.' }, 400)
  }

  try {
    const password = testCase === 'correct'
      ? 'Senha fictícia de teste! 2026'
      : 'Outra senha fictícia! 2026'

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )

    const start = performance.now()

    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: new Uint8Array(fixture.salt),
        iterations: fixture.iterations,
      },
      key,
      256,
    )

    const elapsed = performance.now() - start

    const matches = crypto.subtle.timingSafeEqual(
      derived,
      new Uint8Array(fixture.hash),
    )

    return reply({
      caso: testCase,
      corresponde: matches,
      passou: matches === (testCase === 'correct'),
      tempoDecorridoMs: elapsed,
      observacao: 'Tempo decorrido não equivale ao consumo de CPU.',
    })
  } catch {
    return reply({ erro: 'Falha na verificação de teste.' }, 500)
  }
}