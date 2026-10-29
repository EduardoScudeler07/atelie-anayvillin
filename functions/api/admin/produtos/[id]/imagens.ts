import { requireAdmin } from '../../../../../server/auth/requireAdmin.ts'
import { validateAdminRequest } from '../../../../../server/auth/adminRequest.ts'
import {
  MAX_IMAGE_REQUEST_BYTES,
  readProductImage,
} from '../../../../../server/admin/imageInput.ts'
import {
  createImageUpload,
  completeImageUpload,
  failImageUpload,
  type ImageUploadJob,
} from '../../../../../server/admin/imageUploads.ts'
import {
  uploadProductImage,
  CloudinaryUploadError,
  type CloudinaryConfiguration,
} from '../../../../../server/media/cloudinaryUpload.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_API_KEY?: string
  CLOUDINARY_API_SECRET?: string
  CLOUDINARY_UPLOAD_PRESET?: string
  CLOUDINARY_UPLOAD_FOLDER?: string
}

type ProductRow = {
  id: string
  status: 'rascunho' | 'publicado' | 'arquivado'
}

type ImageRow = {
  id: string
  url: string
  texto_alternativo: string
  ordem: number
}

function json(
  payload: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

export const onRequest: PagesFunction<Env> = async ({
  request,
  env,
  params,
}) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json(
      { erro: 'Método não permitido.' },
      405,
      { Allow: 'GET, POST' },
    )
  }

  let job: ImageUploadJob | null = null

  try {
    if (request.method === 'POST') {
      const rejected = validateAdminRequest(
        request,
        env.ADMIN_ORIGIN,
        MAX_IMAGE_REQUEST_BYTES,
        'multipart/form-data',
      )

      if (rejected) return rejected
    }

    const authorization = await requireAdmin(request, env)
    if (!authorization.ok) return authorization.response

    const id = params.id

    if (
      typeof id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,100}$/.test(id)
    ) {
      return json({ erro: 'Identificador inválido.' }, 400)
    }

    const product = await env.DB.prepare(`
      SELECT id, status FROM produtos WHERE id = ?
    `).bind(id).first<ProductRow>()

    if (!product) {
      return json({ erro: 'Peça não encontrada.' }, 404)
    }

    if (request.method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT id, url, texto_alternativo, ordem
        FROM produto_imagens
        WHERE produto_id = ?
        ORDER BY ordem, id
      `).bind(id).all<ImageRow>()

      return json({ imagens: results })
    }

    if (product.status !== 'rascunho') {
      return json(
        { erro: 'Novas fotos estão disponíveis somente para rascunhos.' },
        409,
      )
    }

    const configuration: CloudinaryConfiguration = {
      cloudName: env.CLOUDINARY_CLOUD_NAME?.trim() ?? '',
      apiKey: env.CLOUDINARY_API_KEY?.trim() ?? '',
      apiSecret: env.CLOUDINARY_API_SECRET?.trim() ?? '',
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET?.trim() ?? '',
      folder: env.CLOUDINARY_UPLOAD_FOLDER?.trim() ?? '',
    }

    if (
      !Object.values(configuration).every((value) => value.length > 0) ||
      !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(configuration.folder) ||
      configuration.folder.length > 80
    ) {
      return json(
        { erro: 'Envio de fotos temporariamente indisponível.' },
        503,
      )
    }

    const body = await readProductImage(request)
    if (!body.ok) return body.response

    job = await createImageUpload(env.DB, {
      productId: id,
      administratorId: authorization.administrator.id,
      folder: configuration.folder,
      alt: body.input.alt,
    })

    if (!job) {
      return json(
        { erro: 'A peça ou seu acesso mudou. Atualize a página.' },
        409,
      )
    }

    const uploaded = await uploadProductImage(
      configuration,
      body.input,
      job.publicId,
    )

    const confirmation = await requireAdmin(request, env)

    if (
      !confirmation.ok ||
      confirmation.administrator.id !== job.administratorId
    ) {
      await failImageUpload(env.DB, job, 'session-expired')

      return confirmation.ok
        ? json({ erro: 'Entre novamente para continuar.' }, 401)
        : confirmation.response
    }

    const image = await completeImageUpload(env.DB, job, uploaded)

    if (!image) {
      await failImageUpload(env.DB, job, 'product-changed')

      return json(
        {
          erro: 'A foto foi enviada, mas a peça mudou. Confira as imagens antes de tentar novamente.',
        },
        409,
      )
    }

    return json({ imagem: image }, 201)
  } catch (error) {
    const code = error instanceof CloudinaryUploadError
      ? error.reason
      : 'database'

    if (job) {
      try {
        await failImageUpload(env.DB, job, code)
      } catch {
        console.warn(
          'Registro de envio precisa de revisão:',
          job.id,
        )
      }
    }

    if (error instanceof CloudinaryUploadError) {
      console.warn('Falha no upload Cloudinary:', error.reason)

      return json(
        {
          erro: error.reason === 'rejected'
            ? 'O Cloudinary não aceitou a foto. Confira o arquivo.'
            : 'Não foi possível confirmar o envio. Confira as imagens antes de tentar novamente.',
        },
        error.reason === 'rejected' ? 422 : 503,
      )
    }

    return json(
      {
        erro: 'Não foi possível confirmar a associação da foto. Confira as imagens antes de tentar novamente.',
      },
      503,
    )
  }
}