interface Env {
  DB: D1Database
}

type Produto = {
  nome: string
  slug: string
  descricao: string
  colecao: string
  colecao_slug: string
  material: string
  material_slug: string
  imagem_url: string
  imagem_alt: string
}

export const onRequest: PagesFunction<Env> = async ({
  request,
  env,
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

  try {
    const { results } = await env.DB.prepare(
      `SELECT
         p.nome,
         p.slug,
         p.descricao,
         c.nome AS colecao,
         c.slug AS colecao_slug,
         m.nome AS material,
         m.slug AS material_slug,
         i.url AS imagem_url,
         i.texto_alternativo AS imagem_alt
       FROM produtos p
       JOIN colecoes c ON c.id = p.colecao_id
       JOIN materiais m ON m.id = p.material_id
       JOIN produto_imagens i ON i.id = (
         SELECT capa.id
         FROM produto_imagens capa
         WHERE capa.produto_id = p.id
         ORDER BY capa.ordem
         LIMIT 1
       )
       WHERE p.status = 'publicado'
         AND c.ativo = 1
         AND m.ativo = 1
       ORDER BY p.nome, p.slug`,
    ).all<Produto>()

    return Response.json(
      { produtos: results },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('Falha ao consultar produtos:', error)

    return Response.json(
      { erro: 'Não foi possível carregar os produtos.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}