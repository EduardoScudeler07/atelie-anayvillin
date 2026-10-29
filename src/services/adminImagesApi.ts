import { AdminSessionExpiredError } from './adminProductsApi'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export type AdminProductImage = {
  id: string
  url: string
  alt: string
  order: number
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function imagePath(productId: string): string {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(productId)) {
    throw new Error('Identificador de peça inválido.')
  }

  return `/api/admin/produtos/${encodeURIComponent(productId)}/imagens`
}

function parseImage(value: unknown): AdminProductImage {
  if (
    !isObject(value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    typeof value.url !== 'string' ||
    typeof value.texto_alternativo !== 'string' ||
    !value.texto_alternativo.trim() ||
    typeof value.ordem !== 'number' ||
    !Number.isSafeInteger(value.ordem) ||
    value.ordem < 0
  ) {
    throw new Error('Dados de imagem inesperados.')
  }

  const address = new URL(value.url)

  if (address.protocol !== 'https:') {
    throw new Error('Endereço de imagem inválido.')
  }

  return {
    id: value.id,
    url: value.url,
    alt: value.texto_alternativo,
    order: value.ordem,
  }
}

export async function getAdminImages(
  productId: string,
  signal?: AbortSignal,
): Promise<AdminProductImage[]> {
  const response = await fetch(imagePath(productId), {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    throw new AdminSessionExpiredError()
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar as fotos.')
  }

  const payload: unknown = await response.json()

  if (!isObject(payload) || !Array.isArray(payload.imagens)) {
    throw new Error('Resposta de imagens inesperada.')
  }

  const images = payload.imagens.map(parseImage)

  if (
    new Set(images.map((image) => image.id)).size !== images.length ||
    new Set(images.map((image) => image.order)).size !== images.length
  ) {
    throw new Error('Imagens ou posições duplicadas na resposta.')
  }

  return images.sort((first, second) => first.order - second.order)
}

export async function uploadAdminImage(
  productId: string,
  file: File,
  alt: string,
): Promise<AdminProductImage> {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Selecione uma foto com conteúdo e até 5 MiB.')
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Selecione uma foto JPG, PNG ou WebP.')
  }

  const description = alt.trim()

  if (!description || description.length > 240) {
    throw new Error('Descreva a foto usando até 240 caracteres.')
  }

  const form = new FormData()
  form.set('foto', file, file.name)
  form.set('texto_alternativo', description)

  const response = await fetch(imagePath(productId), {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'X-Atelie-Admin': '1',
    },
    body: form,
  })

  if (response.status === 401) {
    throw new AdminSessionExpiredError()
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (
      isObject(payload) &&
      typeof payload.erro === 'string' &&
      payload.erro.length <= 240
    ) {
      throw new Error(payload.erro)
    }

    throw new Error(
      'Não foi possível confirmar o envio. Confira as fotos antes de tentar novamente.',
    )
  }

  if (
    response.status !== 201 ||
    !isObject(payload) ||
    !isObject(payload.imagem)
  ) {
    throw new Error(
      'Não foi possível confirmar o envio. Confira as fotos.',
    )
  }

  return parseImage(payload.imagem)
}