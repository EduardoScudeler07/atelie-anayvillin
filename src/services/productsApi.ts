import type {
  Collection,
  Material,
  Product,
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