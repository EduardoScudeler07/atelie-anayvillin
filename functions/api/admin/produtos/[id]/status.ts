import { requireAdmin } from '../../../../../server/auth/requireAdmin.ts'
import { validateAdminRequest } from '../../../../../server/auth/adminRequest.ts'
import {
  changeProductStatus,
  type ProductStatus,
} from '../../../../../server/admin/changeProductStatus.ts'
import { readProductStatusInput } from '../../../../../server/admin/productStatusInput.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

type ProductReview = {
  id: string
  nome: string
  slug: string
  descricao: string
  status: ProductStatus
  atualizado_em: string
  colecao: string
  colecao_slug: string
  material: string
  material_slug: string
  imagem_url: string | null
  imagem_alt: string | null
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
    if (!env.DB || !env.ADMIN_ORIGIN) {
      return json(
        { erro: 'Serviço temporariamente indisponível.' },
        503,
      )
    }

    if (request.method === 'POST') {
      const rejected = validateAdminRequest(
        request,
        env.ADMIN_ORIGIN,
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
        p.atualizado_em,
        c.nome AS colecao,
        c.slug AS colecao_slug,
        m.nome AS material,
        m.slug AS material_slug,
        i.url AS imagem_url,
        i.texto_alternativo AS imagem_alt
      FROM produtos p
      JOIN colecoes c ON c.id = p.colecao_id
      JOIN materiais m ON m.id = p.material_id
      LEFT JOIN produto_imagens i ON i.id = (
        SELECT id
        FROM produto_imagens
        WHERE produto_id = p.id
        ORDER BY ordem, id
        LIMIT 1
      )
      WHERE p.id = ?
    `).bind(id).first<ProductReview>()

    if (!product) {
      return json({ erro: 'Peça não encontrada.' }, 404)
    }

    if (request.method === 'GET') {
      return json({ produto: product })
    }

    const version = request.headers.get('If-Match')

    if (!version) {
      return json(
        { erro: 'Reabra a revisão antes de confirmar.' },
        428,
      )
    }

    if (
      !/^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"$/.test(
        version,
      )
    ) {
      return json({ erro: 'Versão da peça inválida.' }, 400)
    }

    const body = await readProductStatusInput(request)
    if (!body.ok) return body.response

    const updated = await changeProductStatus(env.DB, {
      productId: id,
      administratorId: authorization.administrator.id,
      expectedUpdatedAt: version.slice(1, -1),
      action: body.action,
    })

    if (!updated) {
      return json(
        {
          erro: 'A ação não pôde ser concluída. Reabra a revisão: a peça pode ter mudado ou ter informações pendentes. Para publicar, confira nome, descrição, foto, coleção e material.',
        },
        409,
      )
    }

    return json({ produto: updated })
  } catch {
    return json(
      {
        erro: 'Não foi possível confirmar a alteração. Confira a situação da peça antes de tentar novamente.',
      },
      503,
    )
  }
}