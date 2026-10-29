
import { readSessionCookie } from '../../../server/auth/sessionCookie.ts'
import { verifySession } from '../../../server/auth/sessions.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

function json(
  payload: Record<string, unknown>,
  status: number,
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
  if (request.method !== 'GET') {
    return json(
      { erro: 'Método não permitido.' },
      405,
      { Allow: 'GET' },
    )
  }

  try {
    if (!env.DB || !env.ADMIN_ORIGIN) {
      return json({ erro: 'Serviço temporariamente indisponível.' }, 503)
    }

    if (new URL(request.url).origin !== env.ADMIN_ORIGIN) {
      return json({ erro: 'Requisição não permitida.' }, 403)
    }

    const token = readSessionCookie(request.headers.get('Cookie'))
    const administrator = await verifySession(env.DB, token)

    if (!administrator) {
      return json({ autenticado: false }, 401)
    }

    return json(
      {
        autenticado: true,
        administrador: {
          nome: administrator.name,
          usuario: administrator.username,
        },
      },
      200,
    )
  } catch {
    return json({ erro: 'Serviço temporariamente indisponível.' }, 503)
  }
}