export const MAX_PRODUCT_BODY_BYTES = 16 * 1024

export type DraftProductInput = {
  name: string
  collectionSlug: string
  materialSlug: string
  description: string
}

type DraftInputResult =
  | { ok: true; input: DraftProductInput }
  | { ok: false; response: Response }

const collectionMaterials: Record<string, readonly string[]> = {
  essencia: ['perolas'],
  promessa: ['perolas'],
  luz: ['cristais'],
  graca: ['cristais'],
  raizes: ['madeira'],
  infantil: ['perolas', 'cristais'],
}

class ProductInputError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message)
    this.name = 'ProductInputError'
  }
}

export async function readDraftProductInput(
  request: Request,
): Promise<DraftInputResult> {
  if (!request.body) {
    return {
      ok: false,
      response: Response.json(
        { erro: 'Informe os dados da peça.' },
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

      if (total > MAX_PRODUCT_BODY_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // O conteúdo continuará sendo recusado.
        }

        throw new ProductInputError('Conteúdo muito grande.', 413)
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
      throw new ProductInputError('Dados de peça inválidos.')
    }

    const data = payload as Record<string, unknown>
    const expectedFields = [
      'nome',
      'colecao_slug',
      'material_slug',
      'descricao',
    ]

    const fields = Object.keys(data)

    if (
      fields.length !== expectedFields.length ||
      !expectedFields.every((field) => fields.includes(field)) ||
      typeof data.nome !== 'string' ||
      typeof data.colecao_slug !== 'string' ||
      typeof data.material_slug !== 'string' ||
      typeof data.descricao !== 'string'
    ) {
      throw new ProductInputError('Campos de cadastro inválidos.')
    }

    const name = data.nome.trim()
    const description = data.descricao.trim()

    if (name.length < 3 || name.length > 120) {
      throw new ProductInputError(
        'O nome deve ter entre 3 e 120 caracteres.',
      )
    }

    if (description.length > 3000) {
      throw new ProductInputError(
        'A descrição deve ter até 3.000 caracteres.',
      )
    }

    const materials = Object.hasOwn(
      collectionMaterials,
      data.colecao_slug,
    )
      ? collectionMaterials[data.colecao_slug]
      : undefined

    if (!materials?.includes(data.material_slug)) {
      throw new ProductInputError(
        'Escolha uma coleção e um material compatíveis.',
      )
    }

    return {
      ok: true,
      input: {
        name,
        description,
        collectionSlug: data.colecao_slug,
        materialSlug: data.material_slug,
      },
    }
  } catch (error) {
    const knownError = error instanceof ProductInputError

    return {
      ok: false,
      response: Response.json(
        {
          erro: knownError
            ? error.message
            : 'Não foi possível ler os dados da peça.',
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