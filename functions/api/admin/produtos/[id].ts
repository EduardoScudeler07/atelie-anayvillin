import { requireAdmin } from '../../../../server/auth/requireAdmin.ts'
import { validateAdminRequest } from '../../../../server/auth/adminRequest.ts'
import {
  MAX_PRODUCT_BODY_BYTES,
  readDraftProductInput,
} from '../../../../server/admin/productInput.ts'
import { updateDraftProduct } from '../../../../server/admin/updateDraftProduct.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

type DraftDetails = {
  id: string
  nome: string
  slug: string
  descricao: string
  status: 'rascunho' | 'publicado' | 'arquivado'
  colecao_slug: string
  material_slug: string
  atualizado_em: string
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

  try {
    if (request.method === 'POST') {
      const rejected = validateAdminRequest(
        request,
        env.ADMIN_ORIGIN,
        MAX_PRODUCT_BODY_BYTES,
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
      SELECT
        p.id,
        p.nome,
        p.slug,
        p.descricao,
        p.status,
        c.slug AS colecao_slug,
        m.slug AS material_slug,
        p.atualizado_em
      FROM produtos p
      JOIN colecoes c ON c.id = p.colecao_id
      JOIN materiais m ON m.id = p.material_id
      WHERE p.id = ?
    `).bind(id).first<DraftDetails>()

    if (!product) {
      return json({ erro: 'Peça não encontrada.' }, 404)
    }

    if (product.status !== 'rascunho') {
      return json(
        { erro: 'Esta edição está disponível somente para rascunhos.' },
        409,
      )
    }

    if (request.method === 'GET') {
      return json({ produto: product })
    }

    const version = request.headers.get('If-Match')

    if (!version) {
      return json(
        { erro: 'Reabra a peça antes de salvar.' },
        428,
      )
    }

    if (
      !/^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"$/.test(version)
    ) {
      return json({ erro: 'Versão da peça inválida.' }, 400)
    }

    const body = await readDraftProductInput(request)
    if (!body.ok) return body.response

    const updated = await updateDraftProduct(
      env.DB,
      id,
      version.slice(1, -1),
      body.input,
    )

    if (!updated) {
      return json(
        {
          erro: 'A peça mudou ou uma opção ficou indisponível. Reabra a peça e confira os dados.',
        },
        409,
      )
    }

    return json({ produto: updated })
  } catch {
    return json(
      { erro: 'Não foi possível concluir a edição da peça.' },
      503,
    )
  }
}