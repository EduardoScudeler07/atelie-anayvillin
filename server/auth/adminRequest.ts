import { normalizeLoginUsername } from './loginKeys.ts'

export const MAX_ADMIN_BODY_BYTES = 2048

function reject(
  status: number,
  message: string,
  extraHeaders: Record<string, string> = {},
): Response {
  return Response.json(
    { erro: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...extraHeaders,
      },
    },
  )
}

export function validateAdminRequest(
  request: Request,
  allowedOrigin: string,
  maxBodyBytes: number = MAX_ADMIN_BODY_BYTES,
): Response | null {
  if (request.method !== 'POST') {
    return reject(405, 'Método não permitido.', {
      Allow: 'POST',
    })
  }

  const expected = new URL(allowedOrigin)

  if (
    expected.origin !== allowedOrigin ||
    expected.username ||
    expected.password
  ) {
    throw new Error('Configuração de origem inválida.')
  }

  const requestOrigin = new URL(request.url).origin
  const sourceOrigin = request.headers.get('Origin')

  if (
    requestOrigin !== allowedOrigin ||
    sourceOrigin !== allowedOrigin
  ) {
    return reject(403, 'Requisição não permitida.')
  }

  const fetchSite = request.headers.get('Sec-Fetch-Site')

  if (fetchSite !== null && fetchSite !== 'same-origin') {
    return reject(403, 'Requisição não permitida.')
  }

  if (request.headers.get('X-Atelie-Admin') !== '1') {
    return reject(403, 'Requisição não permitida.')
  }

  const contentType = request.headers
    .get('Content-Type')
    ?.split(';')[0]
    .trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    return reject(415, 'Formato de conteúdo não permitido.')
  }

  const contentLength = request.headers.get('Content-Length')

  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return reject(400, 'Requisição inválida.')
    }

    if (Number(contentLength) > maxBodyBytes) {
      return reject(413, 'Conteúdo muito grande.')
    }
  }

  return null
}

export type ReadLoginBodyResult =
  | {
      ok: true
      credentials: {
        username: string
        password: string
      }
    }
  | {
      ok: false
      response: Response
    }

export async function readLoginBody(
  request: Request,
): Promise<ReadLoginBodyResult> {
  if (!request.body) {
    return {
      ok: false,
      response: reject(400, 'Dados de login inválidos.'),
    }
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      total += value.byteLength

      if (total > MAX_ADMIN_BODY_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // A requisição continuará sendo recusada.
        }

        return {
          ok: false,
          response: reject(413, 'Conteúdo muito grande.'),
        }
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
      throw new Error('Estrutura inválida.')
    }

    const data = payload as Record<string, unknown>
    const fields = Object.keys(data)

    if (
      fields.length !== 2 ||
      !fields.includes('username') ||
      !fields.includes('password') ||
      typeof data.username !== 'string' ||
      data.username.length > 80 ||
      typeof data.password !== 'string' ||
      data.password.length === 0 ||
      data.password.length > 128
    ) {
      throw new Error('Campos inválidos.')
    }

    const username = normalizeLoginUsername(data.username)

    return {
      ok: true,
      credentials: {
        username,
        password: data.password,
      },
    }
  } catch {
    return {
      ok: false,
      response: reject(400, 'Dados de login inválidos.'),
    }
  } finally {
    reader.releaseLock()
  }
}