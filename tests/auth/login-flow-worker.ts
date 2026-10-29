import { login } from '../../server/auth/login.ts'
import { runLoginRejectionTests } from './login-rejection-tests.ts'
import { createLoginKeys } from '../../server/auth/loginKeys.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'
import { verifySession } from '../../server/auth/sessions.ts'

type Env = {
  DB: D1Database
}

function check(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Use POST.', {
        status: 405,
        headers: { Allow: 'POST' },
      })
    }

    const db = env.DB
    const suffix = (
      await hashSessionToken(createSessionToken())
    ).slice(0, 16)

    const administratorId = `admin-flow-${suffix}`
    const uid = `firebase-flow-${suffix}`
    const username = `fluxo.${suffix}`
    const email = `${suffix}@example.invalid`

    // Configuração fictícia, exclusiva deste teste.
    const configuration = {
      firebaseWebApiKey: 'chave-ficticia',
      rateLimitSecret: 'A'.repeat(43),
    }

    const input = {
      username,
      password: 'senha ficticia de teste',
      trustedIp: '192.0.2.20',
    }

    const keys = await createLoginKeys({
      secret: configuration.rateLimitSecret,
      username,
      trustedIp: input.trustedIp,
    })

    const results: string[] = []

    async function checkCounters(expected: number): Promise<void> {
      const response = await db.prepare(`
        SELECT falhas, bloqueado_ate
        FROM tentativas_login
        WHERE (escopo = 'usuario' AND chave_hash = ?)
           OR (escopo = 'ip' AND chave_hash = ?)
      `).bind(keys.usernameHash, keys.ipHash).all<{
        falhas: number
        bloqueado_ate: number | null
      }>()

      check(
        response.results.length === 2 &&
          response.results.every(
            (row) =>
              row.falhas === expected &&
              row.bloqueado_ate === null,
          ),
        'Contadores inesperados no fluxo integrado.',
      )
    }

    async function checkNoReservations(): Promise<void> {
      const row = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE (escopo = 'usuario' AND chave_hash = ?)
           OR (escopo = 'ip' AND chave_hash = ?)
      `).bind(keys.usernameHash, keys.ipHash)
        .first<{ total: number }>()

      check(row?.total === 0, 'O fluxo deixou reservas pendentes.')
    }

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

      // 1. Credenciais confirmadas pelo provedor simulado.
      const success = await login(
        db,
        configuration,
        input,
        async (credentials) => {
          check(
            credentials.email === email &&
              credentials.password === input.password,
            'Credenciais internas encaminhadas incorretamente.',
          )

          return { status: 'verified', uid }
        },
      )

      check(
        success.status === 'authenticated',
        'Login válido não foi concluído.',
      )

      const authenticated = await verifySession(
        db,
        success.session.token,
      )

      check(
        authenticated?.id === administratorId,
        'A sessão retornada não foi reconhecida.',
      )

      await checkNoReservations()
      results.push('Login válido cria uma sessão reconhecida pelo servidor.')

      // 2. Credenciais recusadas.
      const rejected = await login(
        db,
        configuration,
        input,
        async () => ({ status: 'rejected' }),
      )

      check(rejected.status === 'rejected', 'Recusa não foi propagada.')
      await checkCounters(1)
      await checkNoReservations()

      results.push('Credenciais recusadas registram uma falha e liberam reservas.')

      // 3. Provedor indisponível.
      const unavailable = await login(
        db,
        configuration,
        input,
        async () => ({ status: 'unavailable' }),
      )

      check(
        unavailable.status === 'unavailable',
        'Indisponibilidade foi classificada incorretamente.',
      )
      await checkCounters(1)
      await checkNoReservations()

      results.push('Indisponibilidade não aumenta falhas e libera reservas.')

      // 4. Provedor limitando requisições.
      const limited = await login(
        db,
        configuration,
        input,
        async () => ({ status: 'limited' }),
      )

      check(
        limited.status === 'retry',
        'Limitação do provedor foi classificada incorretamente.',
      )
      await checkCounters(1)
      await checkNoReservations()

      results.push('Limitação do provedor não aumenta falhas e libera reservas.')

      const sessions = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM sessoes_administrativas
        WHERE administrador_id = ?
      `).bind(administratorId).first<{ total: number }>()

      check(
        sessions?.total === 1,
        'Um fluxo sem autorização criou outra sessão.',
      )

      results.push('Somente o login confirmado criou sessão.')
            results.push(...await runLoginRejectionTests(db))
      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local do fluxo de login:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
      await db.prepare(`
        DELETE FROM sessoes_administrativas
        WHERE administrador_id = ?
      `).bind(administratorId).run()

      await db.prepare(`
        DELETE FROM administradores WHERE id = ?
      `).bind(administratorId).run()

      await db.batch([
        db.prepare(`
          DELETE FROM reservas_login
          WHERE (escopo = 'usuario' AND chave_hash = ?)
             OR (escopo = 'ip' AND chave_hash = ?)
        `).bind(keys.usernameHash, keys.ipHash),

        db.prepare(`
          DELETE FROM tentativas_login
          WHERE (escopo = 'usuario' AND chave_hash = ?)
             OR (escopo = 'ip' AND chave_hash = ?)
        `).bind(keys.usernameHash, keys.ipHash),
      ])
    }
  },
}