import {
  MAX_IMAGE_BYTES,
  type ProductImageInput,
} from '../admin/imageInput.ts'

export type CloudinaryConfiguration = {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
  folder: string
}

export type UploadedImage = {
  publicId: string
  url: string
  format: 'jpg' | 'png' | 'webp'
  bytes: number
  width: number
  height: number
}

export class CloudinaryUploadError extends Error {
  constructor(
    readonly reason:
      | 'configuration'
      | 'rejected'
      | 'unavailable'
      | 'unexpected-response',
  ) {
    super('Não foi possível confirmar o envio da foto.')
    this.name = 'CloudinaryUploadError'
  }
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function createSignature(
  parameters: Record<string, string>,
  secret: string,
): Promise<string> {
  const serialized = Object.keys(parameters)
    .sort()
    .map((name) => `${name}=${parameters[name]}`)
    .join('&')

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(serialized + secret),
  )

  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function uploadProductImage(
  configuration: CloudinaryConfiguration,
  input: ProductImageInput,
  publicId: string,
): Promise<UploadedImage> {
  const cloudName = configuration.cloudName.trim()
  const apiKey = configuration.apiKey.trim()
  const apiSecret = configuration.apiSecret.trim()
  const preset = configuration.uploadPreset.trim()
  const folder = configuration.folder.trim()

  if (
    !/^[a-z0-9_-]+$/.test(cloudName) ||
    !/^\d+$/.test(apiKey) ||
    !apiSecret ||
    !/^[A-Za-z0-9_-]+$/.test(preset) ||
    !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(folder)
  ) {
    throw new CloudinaryUploadError('configuration')
  }

  if (
    !publicId.startsWith(`${folder}/`) ||
    !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(publicId) ||
    publicId.length > 240 ||
    input.file.size === 0 ||
    input.file.size > MAX_IMAGE_BYTES
  ) {
    throw new CloudinaryUploadError('rejected')
  }

  const parameters: Record<string, string> = {
    allowed_formats: 'jpg,png,webp',
    asset_folder: folder,
    overwrite: 'false',
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
    type: 'upload',
    upload_preset: preset,
    use_asset_folder_as_public_id_prefix: 'false',
  }

  const signature = await createSignature(parameters, apiSecret)

  const form = new FormData()

  for (const [name, value] of Object.entries(parameters)) {
    form.set(name, value)
  }

  form.set('api_key', apiKey)
  form.set('signature', signature)
  form.set('file', input.file, input.file.name)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: form,
        signal: controller.signal,
        redirect: 'manual',
      },
    )

    if (response.status === 401 || response.status === 403) {
      throw new CloudinaryUploadError('configuration')
    }

    if (
      response.status === 400 ||
      response.status === 415 ||
      response.status === 422
    ) {
      throw new CloudinaryUploadError('rejected')
    }

    if (!response.ok) {
      throw new CloudinaryUploadError('unavailable')
    }

    const data: unknown = await response.json()

    if (
      !isObject(data) ||
      data.public_id !== publicId ||
      data.resource_type !== 'image' ||
      data.type !== 'upload' ||
      data.format !== input.format ||
      typeof data.bytes !== 'number' ||
      !Number.isSafeInteger(data.bytes) ||
      data.bytes !== input.file.size ||
      typeof data.width !== 'number' ||
      !Number.isSafeInteger(data.width) ||
      data.width <= 0 ||
      typeof data.height !== 'number' ||
      !Number.isSafeInteger(data.height) ||
      data.height <= 0 ||
      typeof data.version !== 'number' ||
      !Number.isSafeInteger(data.version) ||
      data.version <= 0
    ) {
      throw new CloudinaryUploadError('unexpected-response')
    }

    const expectedUrl =
      `https://res.cloudinary.com/${cloudName}/image/upload/` +
      `v${data.version}/${publicId}.${input.format}`

    if (data.secure_url !== expectedUrl) {
      throw new CloudinaryUploadError('unexpected-response')
    }

    return {
      publicId,
      url: expectedUrl,
      format: input.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    }
  } catch (error) {
    if (error instanceof CloudinaryUploadError) {
      throw error
    }

    throw new CloudinaryUploadError('unavailable')
  } finally {
    clearTimeout(timeout)
  }
}