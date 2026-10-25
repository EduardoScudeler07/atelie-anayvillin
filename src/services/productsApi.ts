import type {
  Collection,
  Material,
  Product,
  ProductDetails,
  ProductImage,
} from '../types/product'

const collections: readonly string[] = [
  'essencia',
  'promessa',
  'luz',
  'graca',
  'raizes',
  'infantil',
]

const materials: readonly string[] = [
  'perolas',
  'cristais',
  'madeira',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCollection(value: unknown): value is Collection {
  return typeof value === 'string' && collections.includes(value)
}

function isMaterial(value: unknown): value is Material {
  return typeof value === 'string' && materials.includes(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function parseProduct(value: unknown): Product {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.nome) ||
    !isNonEmptyString(value.slug) ||
    !isCollection(value.colecao_slug) ||
    !isMaterial(value.material_slug) ||
    !isHttpsUrl(value.imagem_url) ||
    !isNonEmptyString(value.imagem_alt)
  ) {
    throw new Error('A resposta do catálogo contém dados inválidos.')
  }

  return {
    id: value.slug,
    slug: value.slug,
    name: value.nome,
    collection: value.colecao_slug,
    materials: [value.material_slug],
    image: value.imagem_url,
    imageAlt: value.imagem_alt,
  }
}

export async function getProducts(
  signal?: AbortSignal,
): Promise<Product[]> {
  const response = await fetch('/api/produtos', { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar o catálogo.')
  }

  const data: unknown = await response.json()

  if (!isRecord(data) || !Array.isArray(data.produtos)) {
    throw new Error('A resposta do catálogo está em um formato inválido.')
  }

  const products = data.produtos.map(parseProduct)
  const slugs = new Set(products.map((product) => product.slug))

  if (slugs.size !== products.length) {
    throw new Error('A resposta do catálogo contém produtos duplicados.')
  }

  return products
}

function parseImage(value: unknown): ProductImage {
  if (
    !isRecord(value) ||
    !isHttpsUrl(value.url) ||
    !isNonEmptyString(value.texto_alternativo) ||
    typeof value.ordem !== 'number' ||
    !Number.isInteger(value.ordem) ||
    value.ordem < 0
  ) {
    throw new Error('A resposta do produto contém uma imagem inválida.')
  }

  return {
    url: value.url,
    alt: value.texto_alternativo,
    order: value.ordem,
  }
}

function parseProductDetails(value: unknown): ProductDetails {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.descricao) ||
    !Array.isArray(value.imagens) ||
    value.imagens.length === 0
  ) {
    throw new Error('A resposta do produto contém dados inválidos.')
  }

  const images = value.imagens
    .map(parseImage)
    .sort((first, second) => first.order - second.order)

  const orders = new Set(images.map((image) => image.order))

  if (orders.size !== images.length) {
    throw new Error('A resposta contém posições de imagens duplicadas.')
  }

  const cover = images[0]

  const product = parseProduct({
    ...value,
    imagem_url: cover.url,
    imagem_alt: cover.alt,
  })

  return {
    ...product,
    description: value.descricao,
    images,
  }
}

export async function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetails | null> {
  if (!slug.trim()) {
    throw new Error('Informe o endereço do produto.')
  }

  const response = await fetch(
    `/api/produtos/${encodeURIComponent(slug)}`,
    { signal },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar o produto.')
  }

  const data: unknown = await response.json()

  if (!isRecord(data)) {
    throw new Error('A resposta do produto está em um formato inválido.')
  }

  const product = parseProductDetails(data.produto)

  if (product.slug !== slug) {
    throw new Error('O produto recebido não corresponde ao solicitado.')
  }

  return product
}