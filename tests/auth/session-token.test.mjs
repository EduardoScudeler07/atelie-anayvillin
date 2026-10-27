import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  createSessionToken,
  isSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

const tokens = Array.from({ length: 100 }, () => createSessionToken())

assert.ok(tokens.every(isSessionToken))
assert.equal(new Set(tokens).size, tokens.length)
console.log('PASSOU: tokens com formato válido e sem repetição na amostra.')

const token = tokens[0]
const hash = await hashSessionToken(token)
const expected = createHash('sha256').update(token).digest('hex')

assert.match(hash, /^[0-9a-f]{64}$/)
assert.equal(hash, expected)
assert.equal(await hashSessionToken(token), hash)
console.log('PASSOU: hash SHA-256 correto e consistente.')

for (const invalid of [null, undefined, 123, '', 'curto', '!'.repeat(43)]) {
  assert.equal(isSessionToken(invalid), false)
  await assert.rejects(() => hashSessionToken(invalid))
}

console.log('PASSOU: valores inválidos rejeitados.')