import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import {
  createLoginKeys,
  normalizeLoginUsername,
} from '../../server/auth/loginKeys.ts'

// Valores públicos e fictícios, exclusivos deste teste.
const secret = 'A'.repeat(43)

const input = {
  secret,
  username: 'teste.eduardo',
  trustedIp: '192.0.2.10',
}

assert.equal(
  normalizeLoginUsername('  TESTE.Eduardo  '),
  'teste.eduardo',
)

for (const username of [
  '',
  'ab',
  'a'.repeat(41),
  'nome com espaço',
  'nome@exemplo',
  "usuario';--",
]) {
  assert.throws(() => normalizeLoginUsername(username))
}
console.log('PASSOU: normalização e formato do usuário.')

const first = await createLoginKeys(input)
const repeated = await createLoginKeys(input)

assert.deepEqual(first, repeated)
assert.match(first.usernameHash, /^[0-9a-f]{64}$/)
assert.match(first.ipHash, /^[0-9a-f]{64}$/)
console.log('PASSOU: chaves consistentes e no formato esperado.')

const expectedUsername = createHmac('sha256', secret)
  .update(JSON.stringify([
    'atelie-login-v1',
    'usuario',
    input.username,
  ]))
  .digest('hex')

const expectedIp = createHmac('sha256', secret)
  .update(JSON.stringify([
    'atelie-login-v1',
    'ip',
    input.trustedIp,
  ]))
  .digest('hex')

assert.equal(first.usernameHash, expectedUsername)
assert.equal(first.ipHash, expectedIp)
console.log('PASSOU: HMAC confere com a implementação do Node.')

const normalized = await createLoginKeys({
  ...input,
  username: '  TESTE.EDUARDO  ',
})

assert.deepEqual(first, normalized)
console.log('PASSOU: variações de maiúsculas não contornam a chave do usuário.')

const otherUser = await createLoginKeys({
  ...input,
  username: 'outro.usuario',
})

assert.notEqual(first.usernameHash, otherUser.usernameHash)
assert.equal(first.ipHash, otherUser.ipHash)

const otherIp = await createLoginKeys({
  ...input,
  trustedIp: '192.0.2.11',
})

assert.equal(first.usernameHash, otherIp.usernameHash)
assert.notEqual(first.ipHash, otherIp.ipHash)
console.log('PASSOU: usuário e IP possuem controles independentes.')

const sameValue = await createLoginKeys({
  ...input,
  username: '192.0.2.10',
})

assert.notEqual(sameValue.usernameHash, sameValue.ipHash)
console.log('PASSOU: escopos separados mesmo com valores iguais.')

const otherSecret = await createLoginKeys({
  ...input,
  secret: 'B'.repeat(43),
})

assert.notEqual(first.usernameHash, otherSecret.usernameHash)
assert.notEqual(first.ipHash, otherSecret.ipHash)
console.log('PASSOU: alterar o segredo altera as duas chaves.')

for (const invalidSecret of ['', 'curto', '!'.repeat(43)]) {
  await assert.rejects(() => createLoginKeys({
    ...input,
    secret: invalidSecret,
  }))
}

for (const invalidIp of ['', 'texto', '192.0.2.10,192.0.2.11']) {
  await assert.rejects(() => createLoginKeys({
    ...input,
    trustedIp: invalidIp,
  }))
}
console.log('PASSOU: segredo inválido e IP fora do formato básico recusados.')