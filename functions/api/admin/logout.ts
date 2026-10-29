import { validateAdminRequest } from '../../../server/auth/adminRequest.ts'
import {
  clearSessionCookie,
  readSessionCookie,
} from '../../../server/auth/sessionCookie.ts'
import { revokeSession } from '../../../server/auth/sessions.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
}

export const onRequest: PagesFunction<Env> = async ({
  request,
  env,
}) => {
  try {
    if (!env.DB || !env.ADMIN_ORIGIN) {
      return Response.json(
        { erro: 'Logout temporariamente indisponível.' },
        {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }

    const rejected = validateAdminRequest(request, env.ADMIN_ORIGIN)
    if (rejected) return rejected

    const token = readSessionCookie(request.headers.get('Cookie'))
        

    await revokeSession(env.DB, token)

    return Response.json(
      { encerrado: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': clearSessionCookie(),
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    )
  } catch {
    return Response.json(
      { erro: 'Logout temporariamente indisponível.' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}