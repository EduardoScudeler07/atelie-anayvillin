import { createAdminSession } from '../../server/auth/createAdminSession.ts'
import { runSessionCompletionTests } from './session-completion-tests.ts'
import {
  acquireLoginReservation,
  type LoginKeys,
} from '../../server/auth/loginAttempts.ts'
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

    const administratorId = `admin-test-${suffix}`
    const firebaseUid = `firebase-test-${suffix}`
    const keysToClean: LoginKeys[] = []
    const results: string[] = []

    async function newReservation() {
      const keys = {
        usernameHash: await hashSessionToken(createSessionToken()),
        ipHash: await hashSessionToken(createSessionToken()),
      }

      keysToClean.push(keys)

      const reservation = await acquireLoginReservation(db, keys)
      check(reservation !== null, 'Reserva de teste não foi criada.')

      return reservation
    }

    try {
      await db.prepare(`
        INSERT INTO administradores (
          id, nome, usuario, email_firebase, firebase_uid, ativo
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).bind(
        administratorId,
        'Administrador fictício',
        `teste.${suffix}`,
        `${suffix}@example.invalid`,
        firebaseUid,
      ).run()

      // 1. Sessão válida.
      const reservation = await newReservation()

      const created = await createAdminSession(db, {
        administratorId,
        verifiedFirebaseUid: firebaseUid,
        reservation,
      })

      check(created !== null, 'Sessão válida não foi criada.')

      const tokenHash = await hashSessionToken(created.token)

      const stored = await db.prepare(`
        SELECT token_hash, criado_em, ultima_atividade_em, expira_em
        FROM sessoes_administrativas
        WHERE token_hash = ? AND administrador_id = ?
      `).bind(tokenHash, administratorId).first<{
        token_hash: string
        criado_em: number
        ultima_atividade_em: number
        expira_em: number
      }>()

      check(stored !== null, 'Sessão não foi encontrada no banco.')
      check(
        stored.token_hash !== created.token &&
          stored.token_hash === tokenHash,
        'Armazenamento do hash incorreto.',
      )
      check(
        stored.expira_em - stored.criado_em === 86400 &&
          stored.ultima_atividade_em === stored.criado_em &&
          created.expiresAt === stored.expira_em,
        'Prazos da sessão incorretos.',
      )

      const authenticated = await verifySession(db, created.token)

      check(
        authenticated?.id === administratorId,
        'Sessão criada não foi aceita pela verificação.',
      )

      const remaining = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE reserva_hash = ?
      `).bind(reservation.reservationHash)
        .first<{ total: number }>()

      check(
        remaining?.total === 0,
        'Reservas não foram liberadas após criar a sessão.',
      )

      results.push('Sessão criada com hash e prazo de 24 horas.')
      results.push('Sessão criada aceita pela verificação.')
      results.push('Reservas liberadas após a criação.')

      // 2. A mesma reserva não pode criar outra sessão.
      check(
        await createAdminSession(db, {
          administratorId,
          verifiedFirebaseUid: firebaseUid,
          reservation,
        }) === null,
        'Reserva já utilizada criou outra sessão.',
      )

      results.push('Reserva já utilizada não cria outra sessão.')

      // 3. UID diferente não autoriza o administrador.
      check(
        await createAdminSession(db, {
          administratorId,
          verifiedFirebaseUid: 'uid-incorreto',
          reservation: await newReservation(),
        }) === null,
        'UID incorreto criou uma sessão.',
      )

      results.push('UID incorreto recusado.')

      // 4. Administrador desativado.
      await db.prepare(`
        UPDATE administradores SET ativo = 0 WHERE id = ?
      `).bind(administratorId).run()

      check(
        await createAdminSession(db, {
          administratorId,
          verifiedFirebaseUid: firebaseUid,
          reservation: await newReservation(),
        }) === null,
        'Administrador desativado criou uma sessão.',
      )

      await db.prepare(`
        UPDATE administradores SET ativo = 1 WHERE id = ?
      `).bind(administratorId).run()

      results.push('Administrador desativado recusado.')

      // 5. Reserva vencida.
      const expired = await newReservation()
      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        UPDATE reservas_login
        SET criado_em = ?, expira_em = ?
        WHERE reserva_hash = ?
      `).bind(
        now - 61,
        now - 1,
        expired.reservationHash,
      ).run()

      check(
        await createAdminSession(db, {
          administratorId,
          verifiedFirebaseUid: firebaseUid,
          reservation: expired,
        }) === null,
        'Reserva vencida criou uma sessão.',
      )

      results.push('Reserva vencida recusada.')
            results.push(
        ...await runSessionCompletionTests(
          db,
          administratorId,
          firebaseUid,
        ),
      )
      const total = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM sessoes_administrativas
        WHERE administrador_id = ?
      `).bind(administratorId).first<{ total: number }>()

      check(
        total?.total === 1,
        'Uma tentativa recusada deixou uma sessão no banco.',
      )

      results.push('Tentativas recusadas não criaram sessões.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de criação de sessão:', error)

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

      for (const keys of keysToClean) {
        await db.prepare(`
          DELETE FROM reservas_login
          WHERE (escopo = 'usuario' AND chave_hash = ?)
             OR (escopo = 'ip' AND chave_hash = ?)
        `).bind(keys.usernameHash, keys.ipHash).run()
      }
    }
  },
}