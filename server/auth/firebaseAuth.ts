const TIMEOUT_MS = 15_000

export type FirebaseSignInResult =
  | { status: 'verified'; uid: string }
  | { status: 'rejected' }
  | { status: 'limited' }
  | { status: 'unavailable' }

type SignInInput = {
  webApiKey: string
  email: string
  password: string
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readErrorCode(payload: unknown): string | null {
  if (
    !isObject(payload) ||
    !isObject(payload.error) ||
    typeof payload.error.message !== 'string'
  ) {
    return null
  }

  return payload.error.message.split(' : ')[0]
}

export async function signInWithFirebase(
  input: SignInInput,
): Promise<FirebaseSignInResult> {
  const apiKey = input.webApiKey.trim()
  const email = input.email.trim()

  if (!apiKey) {
    return { status: 'unavailable' }
  }

  if (!email || !input.password || input.password.length > 128) {
    return { status: 'rejected' }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url = new URL(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
    )
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: input.password,
        returnSecureToken: true,
      }),
      signal: controller.signal,
            redirect: 'manual',
    })
        console.info('Firebase: resposta HTTP', response.status)
        if (response.status >= 300 && response.status < 400) {
      return { status: 'unavailable' }
    }
    if (response.status === 429) {
      return { status: 'limited' }
    }

    if (response.status >= 500) {
      return { status: 'unavailable' }
    }

    const payload: unknown = await response.json()

    if (!response.ok) {
      const code = readErrorCode(payload)

            const diagnosticCodes = new Set([
        'INVALID_EMAIL',
        'API_KEY_INVALID',
        'API_KEY_SERVICE_BLOCKED',
        'OPERATION_NOT_ALLOWED',
        'CONFIGURATION_NOT_FOUND',
        'PROJECT_NOT_FOUND',
        'INVALID_LOGIN_CREDENTIALS',
        'INVALID_PASSWORD',
        'EMAIL_NOT_FOUND',
        'USER_DISABLED',
        'TOO_MANY_ATTEMPTS_TRY_LATER',
      ])

      console.warn(
        'Firebase: codigo',
        code && diagnosticCodes.has(code) ? code : 'nao listado',
      )

      if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        return { status: 'limited' }
      }

      if (
        response.status === 400 &&
        (
          code === 'INVALID_LOGIN_CREDENTIALS' ||
          code === 'INVALID_PASSWORD' ||
          code === 'EMAIL_NOT_FOUND' ||
          code === 'USER_DISABLED'
        )
      ) {
        return { status: 'rejected' }
      }

      return { status: 'unavailable' }
    }

    if (
      response.status !== 200 ||
      !isObject(payload) ||
      typeof payload.localId !== 'string' ||
      payload.localId.length === 0 ||
      payload.localId.length > 128 ||
      typeof payload.email !== 'string' ||
      payload.email.toLowerCase() !== email.toLowerCase()
    ) {
      return { status: 'unavailable' }
    }

    return {
      status: 'verified',
      uid: payload.localId,
    }
    } catch (error) {
    const name = error instanceof Error ? error.name : ''

    const knownNames = new Set([
      'AbortError',
      'TimeoutError',
      'TypeError',
      'SyntaxError',
      'NotSupportedError',
    ])

    console.warn(
      'Firebase: falha de comunicacao ou leitura',
      knownNames.has(name) ? name : 'nao classificada',
    )

    return { status: 'unavailable' }
  
  } finally {
    clearTimeout(timeout)
  }
}