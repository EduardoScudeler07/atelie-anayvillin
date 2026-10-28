import type { LoginKeys } from './loginAttempts.ts'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/
const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/
const IP_CHARACTERS = /^[0-9a-f:.]+$/i

type LoginKeysInput = {
  secret: string
  username: string
  trustedIp: string
}

export function normalizeLoginUsername(username: string): string {
  const normalized = username.trim().toLowerCase()

  if (!USERNAME_PATTERN.test(normalized)) {
    throw new Error('Formato de usuário inválido.')
  }

  return normalized
}

export async function createLoginKeys(
  input: LoginKeysInput,
): Promise<LoginKeys> {
  if (!SECRET_PATTERN.test(input.secret)) {
    throw new Error('Configuração das chaves de login inválida.')
  }

  const username = normalizeLoginUsername(input.username)
  const ip = input.trustedIp.trim().toLowerCase()

  // Verificação básica; a origem confiável do IP será validada na rota.
  if (
    !ip ||
    ip.length > 64 ||
    !IP_CHARACTERS.test(ip)
  ) {
    throw new Error('IP de controle inválido.')
  }

  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(input.secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )

  async function sign(
    scope: 'usuario' | 'ip',
    value: string,
  ): Promise<string> {
    const message = JSON.stringify([
      'atelie-login-v1',
      scope,
      value,
    ])

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message),
    )

    return Array.from(
      new Uint8Array(signature),
      (byte) => byte.toString(16).padStart(2, '0'),
    ).join('')
  }

  const [usernameHash, ipHash] = await Promise.all([
    sign('usuario', username),
    sign('ip', ip),
  ])

  return {
    usernameHash,
    ipHash,
  }
}