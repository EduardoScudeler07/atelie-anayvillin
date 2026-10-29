import type { ProductStatusAction } from './changeProductStatus.ts'

const MAX_BODY_BYTES = 2048

type StatusInputResult =
  | { ok: true; action: ProductStatusAction }
  | { ok: false; response: Response }

function rejected(
  status: number,
  message: string,
): StatusInputResult {
  return {
    ok: false,
    response: Response.json(
      { erro: message },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    ),
  }
}

export async function readProductStatusInput(
  request: Request,
): Promise<StatusInputResult> {
  if (!request.body) {
    return rejected(400, 'Informe a ação desejada.')
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      total += value.byteLength

      if (total > MAX_BODY_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // O conteúdo continuará sendo recusado.
        }

        return rejected(413, 'Conteúdo muito grande.')
      }

      chunks.push(value)
    }

    const bytes = new Uint8Array(total)
    let offset = 0

    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }

    const text = new TextDecoder('utf-8', {
      fatal: true,
      ignoreBOM: false,
    }).decode(bytes)

    const payload: unknown = JSON.parse(text)

    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return rejected(400, 'Ação inválida.')
    }

    const data = payload as Record<string, unknown>

    if (
      Object.keys(data).length !== 1 ||
      !Object.hasOwn(data, 'acao')
    ) {
      return rejected(400, 'Envie somente a ação desejada.')
    }

    const action = data.acao

    if (
      action !== 'publicar' &&
      action !== 'arquivar' &&
      action !== 'voltar-rascunho'
    ) {
      return rejected(400, 'Ação inválida.')
    }

    return { ok: true, action }
  } catch {
    return rejected(400, 'Não foi possível ler a ação desejada.')
  } finally {
    reader.releaseLock()
  }
}