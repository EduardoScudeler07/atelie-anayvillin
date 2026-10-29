export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Margem para os campos e separadores do formulário.
export const MAX_IMAGE_REQUEST_BYTES =
  MAX_IMAGE_BYTES + 64 * 1024

export type ProductImageInput = {
  file: File
  alt: string
  format: 'jpg' | 'png' | 'webp'
}

type ImageInputResult =
  | { ok: true; input: ProductImageInput }
  | { ok: false; response: Response }

class ImageInputError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message)
    this.name = 'ImageInputError'
  }
}

function detectFormat(
  bytes: Uint8Array,
): ProductImageInput['format'] | null {
  const png = [137, 80, 78, 71, 13, 10, 26, 10]

  if (
    bytes.length >= 8 &&
    png.every((value, index) => bytes[index] === value)
  ) {
    return 'png'
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  ) {
    return 'jpg'
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 82 &&
    bytes[1] === 73 &&
    bytes[2] === 70 &&
    bytes[3] === 70 &&
    bytes[8] === 87 &&
    bytes[9] === 69 &&
    bytes[10] === 66 &&
    bytes[11] === 80
  ) {
    return 'webp'
  }

  return null
}

export async function readProductImage(
  request: Request,
): Promise<ImageInputResult> {
  if (!request.body) {
    return {
      ok: false,
      response: Response.json(
        { erro: 'Selecione uma foto.' },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store' },
        },
      ),
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

      if (total > MAX_IMAGE_REQUEST_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // O envio continuará sendo recusado.
        }

        throw new ImageInputError('A foto deve ter até 5 MiB.', 413)
      }

      chunks.push(value)
    }

    const bytes = new Uint8Array(total)
    let offset = 0

    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }

    const parsedRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') ?? '',
      },
      body: bytes,
    })

    const form = await parsedRequest.formData()
    const entries = Array.from(form.entries())

    if (
      entries.length !== 2 ||
      form.getAll('foto').length !== 1 ||
      form.getAll('texto_alternativo').length !== 1
    ) {
      throw new ImageInputError('Campos de envio inválidos.')
    }

    const file = form.get('foto')
    const altValue = form.get('texto_alternativo')

    if (!(file instanceof File) || typeof altValue !== 'string') {
      throw new ImageInputError('Selecione uma foto e descreva a imagem.')
    }

    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      throw new ImageInputError(
        'A foto deve ter conteúdo e no máximo 5 MiB.',
        file.size > MAX_IMAGE_BYTES ? 413 : 400,
      )
    }

    const alt = altValue.trim()

    if (!alt || alt.length > 240) {
      throw new ImageInputError(
        'Descreva a imagem usando até 240 caracteres.',
      )
    }

    const header = new Uint8Array(
      await file.slice(0, 12).arrayBuffer(),
    )
    const format = detectFormat(header)

    const expectedType = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }

    if (!format || file.type.toLowerCase() !== expectedType[format]) {
      throw new ImageInputError(
        'Envie uma foto JPG, PNG ou WebP válida.',
        415,
      )
    }

    return {
      ok: true,
      input: { file, alt, format },
    }
  } catch (error) {
    const knownError = error instanceof ImageInputError

    return {
      ok: false,
      response: Response.json(
        {
          erro: knownError
            ? error.message
            : 'Não foi possível ler o arquivo enviado.',
        },
        {
          status: knownError ? error.status : 400,
          headers: { 'Cache-Control': 'no-store' },
        },
      ),
    }
  } finally {
    reader.releaseLock()
  }
}