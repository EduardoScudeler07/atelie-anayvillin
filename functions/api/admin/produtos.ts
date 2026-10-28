import { requireAdmin } from '../../../server/auth/requireAdmin.ts'
import { validateAdminRequest } from '../../../server/auth/adminRequest.ts'
import {
  MAX_PRODUCT_BODY_BYTES,
  readDraftProductInput,
} from '../../../server/admin/productInput.ts'
import { createDraftProduct } from '../../../server/admin/createDraftProduct.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

type AdminProduct = {
  id: string
  nome: string
  slug: string
  status: 'rascunho' | 'publicado' | 'arquivado'
  colecao: string
  material: string
  imagem_url: string | null
  imagem_alt: string | null
  atualizado_em: string
}

const PAGE_SIZE = 20

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

    if (request.method === 'POST') {
      const body = await readDraftProductInput(request)
      if (!body.ok) return body.response

      const result = await createDraftProduct(env.DB, body.input)

      if (!result.ok) {
        return json(
          { erro: 'A coleção ou o material não está disponível.' },
          400,
        )
      }

      return json(
        { produto: result.product },
        201,
      )
    }

    const address = new URL(request.url)
    const pageValue = address.searchParams.get('pagina') ?? '1'

    if (
      !/^[1-9]\d{0,4}$/.test(pageValue) ||
      Number(pageValue) > 10000
    ) {
      return json({ erro: 'Página inválida.' }, 400)
    }

    const page = Number(pageValue)
    const offset = (page - 1) * PAGE_SIZE

    const count = await env.DB.prepare(`
      SELECT COUNT(*) AS total FROM produtos
    `).first<{ total: number }>()

    if (!count) {
      throw new Error('Contagem de produtos indisponível.')
    }

    const { results } = await env.DB.prepare(`
      SELECT
        p.id,
        p.nome,
        p.slug,
        p.status,
        c.nome AS colecao,
        m.nome AS material,
        i.url AS imagem_url,
        i.texto_alternativo AS imagem_alt,
        p.atualizado_em
      FROM produtos p
      JOIN colecoes c ON c.id = p.colecao_id
      JOIN materiais m ON m.id = p.material_id
      LEFT JOIN produto_imagens i ON i.id = (
        SELECT capa.id
        FROM produto_imagens capa
        WHERE capa.produto_id = p.id
        ORDER BY capa.ordem
        LIMIT 1
      )
      ORDER BY p.criado_em DESC, p.id
      LIMIT ? OFFSET ?
    `).bind(PAGE_SIZE, offset).all<AdminProduct>()

    return json({
      produtos: results,
      paginacao: {
        pagina: page,
        por_pagina: PAGE_SIZE,
        total: count.total,
      },
    })
  } catch {
    return json(
      { erro: 'Não foi possível concluir a operação com as peças.' },
      503,
    )
  }
}