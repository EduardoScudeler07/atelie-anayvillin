import {
  readLoginBody,
  validateAdminRequest,
} from '../../../server/auth/adminRequest.ts'
import { login } from '../../../server/auth/login.ts'
import { createSessionCookie } from '../../../server/auth/sessionCookie.ts'

type Env = {
  DB: D1Database
  ADMIN_ORIGIN: string
  FIREBASE_WEB_API_KEY: string
  AUTH_RATE_LIMIT_SECRET: string
  ADMIN_LOCAL_TEST_IP?: string
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
  try {
    if (
      !env.DB ||
      !env.ADMIN_ORIGIN ||
      !env.FIREBASE_WEB_API_KEY ||
      !env.AUTH_RATE_LIMIT_SECRET
    ) {
      return json({ erro: 'Login temporariamente indisponível.' }, 503)
    }

    const rejected = validateAdminRequest(request, env.ADMIN_ORIGIN)
    if (rejected) return rejected

    const body = await readLoginBody(request)
    if (!body.ok) return body.response

    const address = new URL(request.url)

    const isLocalHttp =
      address.protocol === 'http:' &&
      (
        address.hostname === '127.0.0.1' ||
        address.hostname === 'localhost'
      )

    // A substituição explícita só funciona no servidor HTTP local.
    const trustedIp = isLocalHttp
      ? env.ADMIN_LOCAL_TEST_IP
      : request.headers.get('CF-Connecting-IP')

    if (!trustedIp) {
      return json({ erro: 'Login temporariamente indisponível.' }, 503)
    }

    const result = await login(
      env.DB,
      {
        firebaseWebApiKey: env.FIREBASE_WEB_API_KEY,
        rateLimitSecret: env.AUTH_RATE_LIMIT_SECRET,
      },
      {
        ...body.credentials,
        trustedIp,
      },
    )

    switch (result.status) {
      case 'authenticated':
        return json(
          { autenticado: true },
          200,
          {
            'Set-Cookie': createSessionCookie(result.session.token),
          },
        )

      case 'rejected':
        return json({ erro: 'Usuário ou senha inválidos.' }, 401)

      case 'retry':
        return json(
          { erro: 'Aguarde antes de tentar novamente.' },
          429,
          { 'Retry-After': '15' },
        )

      case 'unavailable':
        return json({ erro: 'Login temporariamente indisponível.' }, 503)
    }
  } catch {
    return json({ erro: 'Login temporariamente indisponível.' }, 503)
  }
}