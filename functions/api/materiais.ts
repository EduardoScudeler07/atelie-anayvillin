interface Env {
  DB: D1Database
}

type Material = {
  nome: string
  slug: string
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
      `SELECT nome, slug
       FROM materiais
       WHERE ativo = 1
       ORDER BY nome`,
    ).all<Material>()

    return Response.json(
      { materiais: results },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('Falha ao consultar materiais:', error)

    return Response.json(
      { erro: 'Não foi possível carregar os materiais.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}