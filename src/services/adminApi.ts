export type AdminIdentity = {
  name: string
  username: string
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requestError(status: number): Error {
  switch (status) {
    case 401:
      return new Error('Usuário ou senha inválidos.')

    case 429:
      return new Error('Aguarde antes de tentar novamente.')

    case 400:
      return new Error('Confira o usuário e a senha informados.')

    default:
      return new Error(
        'Não foi possível concluir a operação. Tente novamente.',
      )
  }
}

export async function getAdminSession(
  signal?: AbortSignal,
): Promise<AdminIdentity | null> {
  const response = await fetch('/api/admin/session', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw requestError(response.status)
  }

  const payload: unknown = await response.json()

  if (
    !isObject(payload) ||
    payload.autenticado !== true ||
    !isObject(payload.administrador) ||
    typeof payload.administrador.nome !== 'string' ||
    typeof payload.administrador.usuario !== 'string'
  ) {
    throw new Error('Resposta de sessão inesperada.')
  }

  return {
    name: payload.administrador.nome,
    username: payload.administrador.usuario,
  }
}

async function postAdmin(
  path: '/api/admin/login' | '/api/admin/logout',
  body?: { username: string; password: string },
): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Atelie-Admin': '1',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw requestError(response.status)
  }

  const payload: unknown = await response.json()
  const expectedField = path === '/api/admin/login'
    ? 'autenticado'
    : 'encerrado'

  if (!isObject(payload) || payload[expectedField] !== true) {
    throw new Error('Resposta de autenticação inesperada.')
  }
}

export function loginAdmin(
  username: string,
  password: string,
): Promise<void> {
  return postAdmin('/api/admin/login', { username, password })
}

export function logoutAdmin(): Promise<void> {
  return postAdmin('/api/admin/logout')
}