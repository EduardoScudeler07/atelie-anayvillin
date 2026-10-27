import assert from 'node:assert/strict'
import { createSessionToken } from '../../server/auth/sessionToken.ts'
import {
  createSessionCookie,
  clearSessionCookie,
  readSessionCookie,
} from '../../server/auth/sessionCookie.ts'

const name = '__Host-atelie_admin'
const token = createSessionToken()

const cookie = createSessionCookie(token)
const attributes = cookie.split(';').map((part) => part.trim())

assert.equal(attributes[0], `${name}=${token}`)

for (const attribute of [
  'Path=/',
  'Max-Age=86400',
  'HttpOnly',
  'Secure',
  'SameSite=Strict',
]) {
  assert.ok(attributes.includes(attribute))
}

assert.equal(attributes.some((item) => /^Domain=/i.test(item)), false)
console.log('PASSOU: cookie criado com os atributos esperados.')

assert.equal(readSessionCookie(`${name}=${token}`), token)
assert.equal(
  readSessionCookie(`outro=valor; ${name}=${token}; preferencia=clara`),
  token,
)
console.log('PASSOU: token lido corretamente entre outros cookies.')

for (const header of [
  null,
  '',
  'outro=valor',
  `${name}=`,
  `${name}=invalido`,
  `${name}=${token}; ${name}=${token}`,
  `${name}=invalido; ${name}=${token}`,
  `${name}=${token}; ${name}=invalido`,
]) {
  assert.equal(readSessionCookie(header), null)
}

assert.throws(() => createSessionCookie('invalido'))
console.log('PASSOU: cookies ausentes, inválidos e duplicados recusados.')

const cleared = clearSessionCookie()
const clearedAttributes = cleared.split(';').map((part) => part.trim())

assert.equal(clearedAttributes[0], `${name}=`)
assert.ok(clearedAttributes.includes('Max-Age=0'))
assert.ok(
  clearedAttributes.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'),
)

for (const attribute of [
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Strict',
]) {
  assert.ok(clearedAttributes.includes(attribute))
}

console.log('PASSOU: remoção usa o mesmo nome, caminho e proteção.')