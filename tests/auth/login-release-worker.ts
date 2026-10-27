import {
  acquireLoginReservation,
  recordLoginFailure,
  releaseLoginReservation,
} from '../../server/auth/loginAttempts.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

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
    const results: string[] = []

    const keys = {
      usernameHash: await hashSessionToken(createSessionToken()),
      ipHash: await hashSessionToken(createSessionToken()),
    }

    async function countOwned(hash: string): Promise<number> {
      const row = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE reserva_hash = ?
      `).bind(hash).first<{ total: number }>()

      return row?.total ?? 0
    }

    async function checkCounters(): Promise<void> {
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
            (row) => row.falhas === 1 && row.bloqueado_ate === null,
          ),
        'A liberação alterou os contadores ou bloqueios.',
      )
    }

    try {
      // Prepara uma falha para verificar sua preservação.
      const initial = await acquireLoginReservation(db, keys)
      check(initial !== null, 'Reserva inicial não foi criada.')

      check(
        await recordLoginFailure(db, initial),
        'Não foi possível preparar os contadores.',
      )

      const reservation = await acquireLoginReservation(db, keys)
      check(reservation !== null, 'Reserva não foi criada.')

      await releaseLoginReservation(db, reservation)

      check(
        (await countOwned(reservation.reservationHash)) === 0,
        'A liberação deixou reservas pendentes.',
      )
      await checkCounters()

      results.push('Reservas liberadas sem alterar os contadores.')

      // Repetir a liberação deve ser seguro.
      await releaseLoginReservation(db, reservation)
      await checkCounters()

      results.push('Liberação repetida não altera os contadores.')

      // Simula uma execução antiga e sua substituta.
      const oldReservation = await acquireLoginReservation(db, keys)
      check(oldReservation !== null, 'Reserva antiga não foi criada.')

      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        UPDATE reservas_login
        SET criado_em = ?, expira_em = ?
        WHERE reserva_hash = ?
      `).bind(
        now - 61,
        now - 1,
        oldReservation.reservationHash,
      ).run()

      const replacement = await acquireLoginReservation(db, keys)
      check(replacement !== null, 'Reserva substituta não foi criada.')

      await releaseLoginReservation(db, oldReservation)

      check(
        (await countOwned(replacement.reservationHash)) === 2,
        'A execução antiga removeu as reservas da substituta.',
      )
      await checkCounters()

      results.push('Execução antiga preserva as reservas da substituta.')

      await releaseLoginReservation(db, replacement)

      check(
        (await countOwned(replacement.reservationHash)) === 0,
        'A substituta não conseguiu liberar suas próprias reservas.',
      )
      await checkCounters()

      results.push('Substituta libera suas próprias reservas.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de liberação:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
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