import { login } from '../../server/auth/login.ts'
import { createLoginKeys } from '../../server/auth/loginKeys.ts'
import type { LoginKeys } from '../../server/auth/loginAttempts.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

function check(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message)
}

export async function runLoginRejectionTests(
  db: D1Database,
): Promise<string[]> {
  const suffix = (
    await hashSessionToken(createSessionToken())
  ).slice(0, 16)

  const administratorId = `admin-rejection-${suffix}`
  const uid = `firebase-rejection-${suffix}`
  const username = `recusa.${suffix}`
  const email = `${suffix}@example.invalid`

  const configuration = {
    firebaseWebApiKey: 'chave-ficticia',
    rateLimitSecret: 'A'.repeat(43),
  }

  const input = {
    username,
    password: 'senha ficticia de teste',
    trustedIp: `2001:db8::${suffix.slice(0, 4)}`,
  }

  const keys = await createLoginKeys({
    secret: configuration.rateLimitSecret,
    username,
    trustedIp: input.trustedIp,
  })

  const keysToClean: LoginKeys[] = [keys]
  const results: string[] = []

  try {
    await db.prepare(`
      INSERT INTO administradores (
        id, nome, usuario, email_firebase, firebase_uid, ativo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `).bind(
      administratorId,
      'Administrador fictício',
      username,
      email,
      uid,
    ).run()

    // 1. O provedor confirma um UID que não pertence ao administrador.
    const wrongUid = await login(
      db,
      configuration,
      input,
      async () => ({ status: 'verified', uid: 'outro-uid' }),
    )

    check(
      wrongUid.status === 'rejected',
      'UID diferente foi aceito.',
    )
    results.push('UID diferente do administrador é recusado.')

    // 2. Administrador desativado enquanto o provedor responde.
    const deactivatedDuring = await login(
      db,
      configuration,
      input,
      async () => {
        await db.prepare(`
          UPDATE administradores SET ativo = 0 WHERE id = ?
        `).bind(administratorId).run()

        return { status: 'verified', uid }
      },
    )

    check(
      deactivatedDuring.status === 'retry',
      'Desativação durante a autenticação não impediu a sessão.',
    )
    results.push('Desativação durante a autenticação impede a sessão.')

    // 3. Administrador já desativado não usa seu email real.
    const inactive = await login(
      db,
      configuration,
      input,
      async (credentials) => {
        check(
          credentials.email === 'login-inexistente@example.invalid',
          'Conta desativada encaminhou o email cadastrado.',
        )
        return { status: 'rejected' }
      },
    )

    check(
      inactive.status === 'rejected',
      'Conta desativada não teve recusa genérica.',
    )
    results.push('Conta desativada recebe recusa genérica.')

    // 4. Usuário sem cadastro não ganha acesso mesmo com UID confirmado.
    const unknownInput = {
      ...input,
      username: `ausente.${suffix}`,
      trustedIp: '192.0.2.77',
    }

    keysToClean.push(await createLoginKeys({
      secret: configuration.rateLimitSecret,
      username: unknownInput.username,
      trustedIp: unknownInput.trustedIp,
    }))

    const unknown = await login(
      db,
      configuration,
      unknownInput,
      async (credentials) => {
        check(
          credentials.email === 'login-inexistente@example.invalid',
          'Usuário inexistente não utilizou a consulta fictícia.',
        )
        return { status: 'verified', uid }
      },
    )

    check(
      unknown.status === 'rejected',
      'Usuário sem cadastro ganhou acesso.',
    )
    results.push('Usuário inexistente não cria acesso administrativo.')

    // Prepara um cenário independente para testar cinco falhas.
    await db.prepare(`
      UPDATE administradores SET ativo = 1 WHERE id = ?
    `).bind(administratorId).run()

    await db.prepare(`
      DELETE FROM tentativas_login
      WHERE (escopo = 'usuario' AND chave_hash = ?)
         OR (escopo = 'ip' AND chave_hash = ?)
    `).bind(keys.usernameHash, keys.ipHash).run()

    let providerCalls = 0

    for (let attempt = 1; attempt <= 5; attempt++) {
      const result = await login(
        db,
        configuration,
        input,
        async () => {
          providerCalls++
          return { status: 'rejected' }
        },
      )

      check(
        result.status === 'rejected',
        `Tentativa ${attempt} não foi recusada como esperado.`,
      )
    }

    const blocked = await login(
      db,
      configuration,
      input,
      async () => {
        providerCalls++
        return { status: 'verified', uid }
      },
    )

    check(
      blocked.status === 'retry' && providerCalls === 5,
      'O bloqueio não impediu uma nova consulta ao provedor.',
    )

    results.push(
      'Após cinco falhas, nova tentativa não consulta o Firebase.',
    )

    const sessions = await db.prepare(`
      SELECT COUNT(*) AS total
      FROM sessoes_administrativas
      WHERE administrador_id = ?
    `).bind(administratorId).first<{ total: number }>()

    check(
      sessions?.total === 0,
      'Um cenário de recusa criou sessão.',
    )
    results.push('Nenhum cenário de recusa criou sessão.')

    for (const testKeys of keysToClean) {
      const remaining = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE (escopo = 'usuario' AND chave_hash = ?)
           OR (escopo = 'ip' AND chave_hash = ?)
      `).bind(testKeys.usernameHash, testKeys.ipHash)
        .first<{ total: number }>()

      check(
        remaining?.total === 0,
        'Um cenário de recusa deixou reservas pendentes.',
      )
    }
    results.push('Cenários de recusa não deixam reservas pendentes.')

    return results
  } finally {
    await db.prepare(`
      DELETE FROM sessoes_administrativas
      WHERE administrador_id = ?
    `).bind(administratorId).run()

    await db.prepare(`
      DELETE FROM administradores WHERE id = ?
    `).bind(administratorId).run()

    for (const testKeys of keysToClean) {
      await db.batch([
        db.prepare(`
          DELETE FROM reservas_login
          WHERE (escopo = 'usuario' AND chave_hash = ?)
             OR (escopo = 'ip' AND chave_hash = ?)
        `).bind(testKeys.usernameHash, testKeys.ipHash),

        db.prepare(`
          DELETE FROM tentativas_login
          WHERE (escopo = 'usuario' AND chave_hash = ?)
             OR (escopo = 'ip' AND chave_hash = ?)
        `).bind(testKeys.usernameHash, testKeys.ipHash),
      ])
    }
  }
}