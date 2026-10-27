interface Env {
    DB: D1Database
}

type Colecao = {
    nome: string
    slug: string
    descricao: string
    ordem: number
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
            `SELECT nome, slug, descricao, ordem
       FROM colecoes
       WHERE ativo = 1
       ORDER BY ordem, nome`,
        ).all<Colecao>()

        return Response.json(
            { colecoes: results },
            {
                headers: { 'Cache-Control': 'no-store' },
            },
        )
    } catch (error) {
        console.error('Falha ao consultar coleções:', error)
        return Response.json(
            { erro: 'Não foi possível carregar as coleções.' },
            {
                status: 500,
                headers: { 'Cache-Control': 'no-store' },
            },
        )
    }
}