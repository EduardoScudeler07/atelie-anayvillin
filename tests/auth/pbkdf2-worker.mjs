const encoder = new TextEncoder()

async function derive(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: 600_000,
    },
    key,
    256,
  )

  return new Uint8Array(bits)
}

function equalForTest(first, second) {
  return first.length === second.length &&
    first.every((value, index) => value === second[index])
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return new Response('Método não permitido.', { status: 405 })
    }

    try {
      const password = 'Senha fictícia de teste! 2026'
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const anotherSalt = crypto.getRandomValues(new Uint8Array(16))

      const start = performance.now()
      const reference = await derive(password, salt)
      const elapsed = performance.now() - start

      const correctAttempt = await derive(password, salt)
      const wrongAttempt = await derive('Outra senha fictícia!', salt)
      const differentSalt = await derive(password, anotherSalt)

      const results = {
        senhaCorreta: equalForTest(reference, correctAttempt),
        senhaIncorretaRejeitada:
          !equalForTest(reference, wrongAttempt),
        saltIndividual:
          !equalForTest(reference, differentSalt),
      }

      const passed = Object.values(results).every(Boolean)

      return Response.json(
        {
          passou: passed,
          resultados: results,
          primeiraDerivacaoMs: elapsed,
          observacao:
            'Tempo local decorrido; não comprova o limite de CPU remoto.',
        },
        { status: passed ? 200 : 500 },
      )
    } catch (error) {
      return Response.json(
        {
          passou: false,
          erro: error instanceof Error
            ? error.message
            : 'Falha desconhecida.',
        },
        { status: 500 },
      )
    }
  },
}