import { webcrypto } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const password = 'Senha fictícia de teste! 2026'
const salt = webcrypto.getRandomValues(new Uint8Array(16))
const iterations = 600_000

const key = await webcrypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(password),
  'PBKDF2',
  false,
  ['deriveBits'],
)

const hash = await webcrypto.subtle.deriveBits(
  {
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt,
    iterations,
  },
  key,
  256,
)

const fixture = {
  iterations,
  salt: Array.from(salt),
  hash: Array.from(new Uint8Array(hash)),
}

await writeFile(
  new URL('./pbkdf2-fixture.json', import.meta.url),
  JSON.stringify(fixture, null, 2),
)

console.log('Referência fictícia criada em pbkdf2-fixture.json.')