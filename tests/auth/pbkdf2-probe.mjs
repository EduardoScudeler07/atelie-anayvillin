import { webcrypto } from 'node:crypto'
import { performance } from 'node:perf_hooks'

const { subtle } = webcrypto
const encoder = new TextEncoder()

const iterations = 600_000

// Dados fictícios, exclusivos deste teste.
const testPassword = 'Senha fictícia de teste! 2026'
const wrongPassword = 'Outra senha fictícia! 2026'

async function derive(password, salt) {
  const key = await subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    key,
    256,
  )

  return new Uint8Array(bits)
}

function equalForTest(first, second) {
  // Comparação apenas para asserções deste teste.
  // Não será usada na implementação do login.
  return first.length === second.length &&
    first.every((value, index) => value === second[index])
}

async function run() {
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const anotherSalt = webcrypto.getRandomValues(new Uint8Array(16))

  const start = performance.now()
  const reference = await derive(testPassword, salt)
  const elapsed = performance.now() - start

  const correctAttempt = await derive(testPassword, salt)
  const wrongAttempt = await derive(wrongPassword, salt)
  const differentSalt = await derive(testPassword, anotherSalt)

  if (!equalForTest(reference, correctAttempt)) {
    throw new Error('Falha: a senha correta não correspondeu.')
  }

  if (equalForTest(reference, wrongAttempt)) {
    throw new Error('Falha: a senha incorreta foi aceita.')
  }

  if (equalForTest(reference, differentSalt)) {
    throw new Error('Falha: salts diferentes produziram o mesmo resultado.')
  }

  console.log('PASSOU: senha correta corresponde.')
  console.log('PASSOU: senha incorreta não corresponde.')
  console.log('PASSOU: salts diferentes geram resultados diferentes.')
  console.log(`Primeira derivação no Node: ${elapsed.toFixed(1)} ms.`)
  console.log('Este tempo não mede o consumo de CPU no Cloudflare.')
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})