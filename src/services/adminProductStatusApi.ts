import { AdminSessionExpiredError } from './adminProductsApi'

export type ProductStatus =
  | 'rascunho'
  | 'publicado'
  | 'arquivado'

export type ProductStatusAction =
  | 'publicar'
  | 'arquivar'
  | 'voltar-rascunho'

export type ProductReview = {
  id: string
  name: string
  slug: string
  description: string
  status: ProductStatus
  updatedAt: string
  collection: string
  collectionSlug: string
  material: string
  materialSlug: string
  image: string | null
  imageAlt: string | null
}

function endpoint(id: string): string {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    throw new Error('Identificador inválido.')
  }

  return `/api/admin/produtos/${encodeURIComponent(id)}/status`
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isStatus(value: unknown): value is ProductStatus {
  return (
    value === 'rascunho' ||
    value === 'publicado' ||
    value === 'arquivado'
  )
}

function isVersion(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
}

async function readResponse(
  response: Response,
): Promise<Record<string, unknown>> {
  if (response.status === 401) {
    throw new AdminSessionExpiredError()
  }

  const payload: unknown = await response.json()

  if (!response.ok) {
    const message =
      isRecord(payload) &&
      typeof payload.erro === 'string' &&
      payload.erro.length <= 400
        ? payload.erro
        : 'Não foi possível concluir a operação.'

    throw new Error(message)
  }

  if (!isRecord(payload) || !isRecord(payload.produto)) {
    throw new Error('O servidor retornou dados inválidos.')
  }

  return payload.produto
}

export async function getProductReview(
  id: string,
  signal?: AbortSignal,
): Promise<ProductReview> {
  const response = await fetch(endpoint(id), {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  const product = await readResponse(response)

  if (
    product.id !== id ||
    typeof product.nome !== 'string' ||
    typeof product.slug !== 'string' ||
    typeof product.descricao !== 'string' ||
    !isStatus(product.status) ||
    !isVersion(product.atualizado_em) ||
    typeof product.colecao !== 'string' ||
    typeof product.colecao_slug !== 'string' ||
    typeof product.material !== 'string' ||
    typeof product.material_slug !== 'string' ||
    (
      product.imagem_url !== null &&
      typeof product.imagem_url !== 'string'
    ) ||
    (
      product.imagem_alt !== null &&
      typeof product.imagem_alt !== 'string'
    )
  ) {
    throw new Error('Os dados da revisão estão inválidos.')
  }

  if (
    product.imagem_url !== null &&
    new URL(product.imagem_url).protocol !== 'https:'
  ) {
    throw new Error('O endereço da foto está inválido.')
  }

  return {
    id,
    name: product.nome,
    slug: product.slug,
    description: product.descricao,
    status: product.status,
    updatedAt: product.atualizado_em,
    collection: product.colecao,
    collectionSlug: product.colecao_slug,
    material: product.material,
    materialSlug: product.material_slug,
    image: product.imagem_url,
    imageAlt: product.imagem_alt,
  }
}

export async function changeAdminProductStatus(
  product: ProductReview,
  action: ProductStatusAction,
): Promise<ProductStatus> {
  const response = await fetch(endpoint(product.id), {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Atelie-Admin': '1',
      'If-Match': JSON.stringify(product.updatedAt),
    },
    body: JSON.stringify({ acao: action }),
  })

  const updated = await readResponse(response)

  const expectedStatus: ProductStatus =
    action === 'publicar'
      ? 'publicado'
      : action === 'arquivar'
        ? 'arquivado'
        : 'rascunho'

  if (
    updated.id !== product.id ||
    updated.slug !== product.slug ||
    updated.status !== expectedStatus ||
    !isVersion(updated.atualizado_em)
  ) {
    throw new Error(
      'Não foi possível confirmar o resultado. Confira a situação da peça antes de tentar novamente.',
    )
  }

  return expectedStatus
}