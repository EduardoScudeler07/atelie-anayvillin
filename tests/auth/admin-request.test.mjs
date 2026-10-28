import assert from 'node:assert/strict'
import {
  MAX_ADMIN_BODY_BYTES,
  validateAdminRequest,
  readLoginBody,
} from '../../server/auth/adminRequest.ts'

const origin = 'https://atelie.example'
const url = `${origin}/api/admin/login`

const credentials = {
  username: '  TESTE.Eduardo  ',
  password: ' senha ficticia de teste ',
}

const validBody = JSON.stringify(credentials)

function makeRequest(body = validBody, headerChanges = {}) {
  const headers = new Headers({
    Origin: origin,
    'Sec-Fetch-Site': 'same-origin',
    'X-Atelie-Admin': '1',
    'Content-Type': 'application/json',
  })

  for (const [name, value] of Object.entries(headerChanges)) {
    if (value === null) {
      headers.delete(name)
    } else {
      headers.set(name, value)
    }
  }

  return new Request(url, {
    method: 'POST',
    headers,
    body,
  })
}

function expectGuardStatus(request, status) {
  const response = validateAdminRequest(request, origin)

  assert.ok(response instanceof Response)
  assert.equal(response.status, status)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')

  return response
}

async function expectBodyStatus(request, status) {
  const result = await readLoginBody(request)

  assert.equal(result.ok, false)
  assert.equal(result.response.status, status)
  assert.equal(
    result.response.headers.get('Cache-Control'),
    'no-store',
  )
}

// 1. Requisição válida.
assert.equal(validateAdminRequest(makeRequest(), origin), null)

const valid = await readLoginBody(makeRequest())

assert.equal(valid.ok, true)
assert.deepEqual(valid.credentials, {
  username: 'teste.eduardo',
  password: credentials.password,
})

console.log('PASSOU: requisição válida e senha preservada sem alterações.')

// 2. Métodos que não podem executar o login.
for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS']) {
  const response = expectGuardStatus(
    new Request(url, { method }),
    405,
  )

  assert.equal(response.headers.get('Allow'), 'POST')
}

console.log('PASSOU: métodos diferentes de POST recusados.')

// 3. Origem ausente, externa ou inconsistente.
for (const source of [null, 'null', 'https://outro.example']) {
  expectGuardStatus(makeRequest(validBody, { Origin: source }), 403)
}

expectGuardStatus(
  new Request('https://outro.example/api/admin/login', {
    method: 'POST',
    headers: {
      Origin: origin,
      'X-Atelie-Admin': '1',
      'Content-Type': 'application/json',
    },
    body: validBody,
  }),
  403,
)

console.log('PASSOU: origem ausente, externa ou inconsistente recusada.')

// 4. Cabeçalhos de proteção.
expectGuardStatus(
  makeRequest(validBody, { 'Sec-Fetch-Site': 'cross-site' }),
  403,
)
expectGuardStatus(
  makeRequest(validBody, { 'Sec-Fetch-Site': 'same-site' }),
  403,
)
expectGuardStatus(
  makeRequest(validBody, { 'X-Atelie-Admin': null }),
  403,
)

assert.equal(
  validateAdminRequest(
    makeRequest(validBody, { 'Sec-Fetch-Site': null }),
    origin,
  ),
  null,
)

console.log('PASSOU: cabeçalhos de proteção conferidos.')

// 5. Formato e tamanho declarados.
expectGuardStatus(
  makeRequest(validBody, { 'Content-Type': 'text/plain' }),
  415,
)
expectGuardStatus(
  makeRequest(validBody, { 'Content-Length': 'invalido' }),
  400,
)
expectGuardStatus(
  makeRequest(validBody, {
    'Content-Length': String(MAX_ADMIN_BODY_BYTES + 1),
  }),
  413,
)

console.log('PASSOU: conteúdo e tamanho declarados inválidos recusados.')

// 6. Estrutura e campos do JSON.
for (const body of [
  '',
  '{',
  'null',
  '[]',
  JSON.stringify({ username: 'teste.eduardo' }),
  JSON.stringify({ username: 'teste.eduardo', password: 123 }),
  JSON.stringify({ username: 'ab', password: 'senha' }),
  JSON.stringify({ username: 'teste.eduardo', password: '' }),
  JSON.stringify({
    username: 'teste.eduardo',
    password: 'a'.repeat(129),
  }),
  JSON.stringify({
    ...credentials,
    firebase_uid: 'uid-enviado-pelo-cliente',
  }),
]) {
  await expectBodyStatus(makeRequest(body), 400)
}

console.log('PASSOU: JSON, campos extras e dados inválidos recusados.')

// 7. Limite efetivo, mesmo sem tamanho declarado ou com valor falso.
const oversized = ' '.repeat(MAX_ADMIN_BODY_BYTES + 1)

await expectBodyStatus(makeRequest(oversized), 413)
await expectBodyStatus(
  makeRequest(oversized, { 'Content-Length': '1' }),
  413,
)

// Caracteres acentuados ocupam mais de um byte em UTF-8.
await expectBodyStatus(makeRequest('é'.repeat(1100)), 413)

const exactBody = validBody.padEnd(MAX_ADMIN_BODY_BYTES, ' ')
const exact = await readLoginBody(makeRequest(exactBody))

assert.equal(exact.ok, true)

console.log('PASSOU: limite real de bytes aplicado, incluindo UTF-8.')

// 8. Corpo recebido em partes.
const encoder = new TextEncoder()
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(encoder.encode(' '.repeat(1500)))
    controller.enqueue(encoder.encode(' '.repeat(600)))
    controller.close()
  },
})

const streamed = new Request(url, {
  method: 'POST',
  body: stream,
  duplex: 'half',
})

await expectBodyStatus(streamed, 413)

console.log('PASSOU: limite aplicado também ao corpo recebido em partes.')

// 9. Codificação inválida.
await expectBodyStatus(
  makeRequest(new Uint8Array([0xff])),
  400,
)

console.log('PASSOU: UTF-8 inválido recusado.')