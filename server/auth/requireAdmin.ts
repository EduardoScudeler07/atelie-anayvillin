import { readSessionCookie } from './sessionCookie.ts'
import {
  verifySession,
  type AuthenticatedAdministrator,
} from './sessions.ts'

type AdminEnvironment = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

type AdminAuthorization =
  | {
      ok: true
      administrator: AuthenticatedAdministrator
    }
  | {
      ok: false
      response: Response
    }

function denied(status: number, message: string): AdminAuthorization {
  return {
    ok: false,
    response: Response.json(
      { erro: message },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    ),
  }
}

export async function requireAdmin(
  request: Request,
  env: AdminEnvironment,
): Promise<AdminAuthorization> {
  if (!env.DB || !env.ADMIN_ORIGIN) {
    return denied(503, 'Serviço temporariamente indisponível.')
  }

  if (new URL(request.url).origin !== env.ADMIN_ORIGIN) {
    return denied(403, 'Requisição não permitida.')
  }

  const token = readSessionCookie(request.headers.get('Cookie'))
  const administrator = await verifySession(env.DB, token)

  if (!administrator) {
    return denied(401, 'Entre novamente para continuar.')
  }

  return {
    ok: true,
    administrator,
  }
}