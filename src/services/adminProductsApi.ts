export type AdminProductStatus =
  | 'rascunho'
  | 'publicado'
  | 'arquivado'

export type AdminProduct = {
  id: string
  name: string
  collection: string
  material: string
  status: AdminProductStatus
  image: string | null
  imageAlt: string | null
}

export type AdminProductPage = {
  products: AdminProduct[]
  page: number
  pageSize: number
  total: number
}

export class AdminSessionExpiredError extends Error {
  constructor() {
    super('Entre novamente para continuar.')
    this.name = 'AdminSessionExpiredError'
  }
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseProduct(value: unknown): AdminProduct {
  if (
    !isObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.nome !== 'string' ||
    typeof value.colecao !== 'string' ||
    typeof value.material !== 'string' ||
    (
      value.status !== 'rascunho' &&
      value.status !== 'publicado' &&
      value.status !== 'arquivado'
    ) ||
    (
      value.imagem_url !== null &&
      typeof value.imagem_url !== 'string'
    ) ||
    (
      value.imagem_alt !== null &&
      typeof value.imagem_alt !== 'string'
    )
  ) {
    throw new Error('Dados de peça inesperados.')
  }

  if (
    !value.id.trim() ||
    !value.nome.trim() ||
    !value.colecao.trim() ||
    !value.material.trim()
  ) {
    throw new Error('Dados de peça incompletos.')
  }

  if (
    value.imagem_url !== null &&
    new URL(value.imagem_url).protocol !== 'https:'
  ) {
    throw new Error('Endereço de imagem inválido.')
  }

  return {
    id: value.id,
    name: value.nome,
    collection: value.colecao,
    material: value.material,
    status: value.status,
    image: value.imagem_url,
    imageAlt: value.imagem_alt,
  }
}

export async function getAdminProducts(
  page: number,
  signal?: AbortSignal,
): Promise<AdminProductPage> {
  if (!Number.isInteger(page) || page < 1 || page > 10000) {
    throw new Error('Página inválida.')
  }

  const response = await fetch(
    `/api/admin/produtos?pagina=${page}`,
    {
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
    },
  )

  if (response.status === 401) {
    throw new AdminSessionExpiredError()
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar as peças.')
  }

  const payload: unknown = await response.json()

  if (
    !isObject(payload) ||
    !Array.isArray(payload.produtos) ||
    !isObject(payload.paginacao)
  ) {
    throw new Error('Resposta de listagem inesperada.')
  }

  const pagination = payload.paginacao

  if (
    pagination.pagina !== page ||
    pagination.por_pagina !== 20 ||
    typeof pagination.total !== 'number' ||
    !Number.isSafeInteger(pagination.total) ||
    pagination.total < 0 ||
    payload.produtos.length > 20
  ) {
    throw new Error('Paginação inesperada.')
  }

  const products = payload.produtos.map(parseProduct)

  if (new Set(products.map((product) => product.id)).size !== products.length) {
    throw new Error('Peças duplicadas na resposta.')
  }

  return {
    products,
    page,
    pageSize: 20,
    total: pagination.total,
  }
}

export type DraftProductFields = {
  name: string
  collectionSlug: string
  materialSlug: string
  description: string
}

export type CreatedDraftProduct = {
  id: string
  name: string
  slug: string
}

export async function saveDraftProduct(
  fields: DraftProductFields,
): Promise<CreatedDraftProduct> {
  const response = await fetch('/api/admin/produtos', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Atelie-Admin': '1',
    },
    body: JSON.stringify({
      nome: fields.name,
      colecao_slug: fields.collectionSlug,
      material_slug: fields.materialSlug,
      descricao: fields.description,
    }),
  })

  if (response.status === 401) {
    throw new AdminSessionExpiredError()
  }

  const payload: unknown = await response.json()

  if (!response.ok) {
    if (
      response.status === 400 &&
      isObject(payload) &&
      typeof payload.erro === 'string' &&
      payload.erro.length <= 200
    ) {
      throw new Error(payload.erro)
    }

    throw new Error(
      'Não foi possível confirmar o cadastro. Confira a listagem antes de tentar novamente.',
    )
  }

  if (
    response.status !== 201 ||
    !isObject(payload) ||
    !isObject(payload.produto) ||
    typeof payload.produto.id !== 'string' ||
    typeof payload.produto.nome !== 'string' ||
    typeof payload.produto.slug !== 'string' ||
    payload.produto.status !== 'rascunho'
  ) {
    throw new Error(
      'Não foi possível confirmar o cadastro. Confira a listagem.',
    )
  }

  return {
    id: payload.produto.id,
    name: payload.produto.nome,
    slug: payload.produto.slug,
  }
}

export type ProductOption = {
  name: string
  slug: string
}

async function readProductOptions(
  path: '/api/colecoes' | '/api/materiais',
  field: 'colecoes' | 'materiais',
  signal?: AbortSignal,
): Promise<ProductOption[]> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar as opções.')
  }

  const payload: unknown = await response.json()

  if (!isObject(payload) || !Array.isArray(payload[field])) {
    throw new Error('Opções inesperadas.')
  }

  const options = payload[field].map((value: unknown) => {
    if (
      !isObject(value) ||
      typeof value.nome !== 'string' ||
      typeof value.slug !== 'string' ||
      !value.nome.trim() ||
      !value.slug.trim()
    ) {
      throw new Error('Opção inválida.')
    }

    return {
      name: value.nome,
      slug: value.slug,
    }
  })

  if (new Set(options.map((option) => option.slug)).size !== options.length) {
    throw new Error('Opções duplicadas.')
  }

  return options
}

export async function getDraftProductOptions(
  signal?: AbortSignal,
): Promise<{
  collections: ProductOption[]
  materials: ProductOption[]
}> {
  const [collections, materials] = await Promise.all([
    readProductOptions('/api/colecoes', 'colecoes', signal),
    readProductOptions('/api/materiais', 'materiais', signal),
  ])

  return { collections, materials }
}