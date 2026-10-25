interface Env {
  DB: D1Database
}

type ProdutoRow = {
  id: string
  nome: string
  slug: string
  descricao: string
  colecao: string
  colecao_slug: string
  material: string
  material_slug: string
}

type Imagem = {
  url: string
  texto_alternativo: string
  ordem: number
}

function notFound() {
  return Response.json(
    { erro: 'Produto não encontrado.' },
    {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export const onRequest: PagesFunction<Env> = async ({
  request,
  env,
  params,
}) => {
  if (request.method !== 'GET') {
    return Response.json(
      { erro: 'Método não permitido.' },
      {
        status: 405,
        headers: { Allow: 'GET' },
      },
    )
  }

  const slug = params.slug

  if (typeof slug !== 'string' || !slug) {
    return notFound()
  }

  try {
    const produto = await env.DB.prepare(
      `SELECT
         p.id,
         p.nome,
         p.slug,
         p.descricao,
         c.nome AS colecao,
         c.slug AS colecao_slug,
         m.nome AS material,
         m.slug AS material_slug
       FROM produtos p
       JOIN colecoes c ON c.id = p.colecao_id
       JOIN materiais m ON m.id = p.material_id
       WHERE p.slug = ?
         AND p.status = 'publicado'
         AND c.ativo = 1
         AND m.ativo = 1`,
    )
      .bind(slug)
      .first<ProdutoRow>()

    if (!produto) {
      return notFound()
    }

    const { results: imagens } = await env.DB.prepare(
      `SELECT url, texto_alternativo, ordem
       FROM produto_imagens
       WHERE produto_id = ?
       ORDER BY ordem`,
    )
      .bind(produto.id)
      .all<Imagem>()

    if (imagens.length === 0) {
      return notFound()
    }

    return Response.json(
      {
        produto: {
          nome: produto.nome,
          slug: produto.slug,
          descricao: produto.descricao,
          colecao: produto.colecao,
          colecao_slug: produto.colecao_slug,
          material: produto.material,
          material_slug: produto.material_slug,
          imagens,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('Falha ao consultar produto:', error)

    return Response.json(
      { erro: 'Não foi possível carregar o produto.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}