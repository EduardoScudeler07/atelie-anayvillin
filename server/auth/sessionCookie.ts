import { isSessionToken } from './sessionToken.ts'

const COOKIE_NAME = '__Host-atelie_admin'
const MAX_AGE_SECONDS = 24 * 60 * 60

const COOKIE_ATTRIBUTES =
  'Path=/; HttpOnly; Secure; SameSite=Strict'

export function createSessionCookie(token: string): string {
  if (!isSessionToken(token)) {
    throw new Error('Formato de token inválido.')
  }

  return (
    `${COOKIE_NAME}=${token}; ` +
    `Max-Age=${MAX_AGE_SECONDS}; ${COOKIE_ATTRIBUTES}`
  )
}

export function clearSessionCookie(): string {
  return (
    `${COOKIE_NAME}=; Max-Age=0; ` +
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' +
    COOKIE_ATTRIBUTES
  )
}

export function readSessionCookie(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) {
    return null
  }

  let token: string | null = null

  for (const part of cookieHeader.split(';')) {
    const cookie = part.trim()
    const separator = cookie.indexOf('=')

    if (separator === -1) {
      continue
    }

    const name = cookie.slice(0, separator)

    if (name !== COOKIE_NAME) {
      continue
    }

    const value = cookie.slice(separator + 1)

    // Recusa valores inválidos e cookies duplicados.
    if (token !== null || !isSessionToken(value)) {
      return null
    }

    token = value
  }

  return token
}