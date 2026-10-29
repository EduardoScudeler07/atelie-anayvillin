import { runLoginExpirationTests } from './login-expiration-tests.ts'
import {
  acquireLoginReservation,
  recordLoginFailure,
} from '../../server/auth/loginAttempts.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

type Env = {
  DB: D1Database
}

type CounterRow = {
  escopo: string
  falhas: number
  bloqueado_ate: number | null
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

    const keys = {
      usernameHash: await hashSessionToken(createSessionToken()),
      ipHash: await hashSessionToken(createSessionToken()),
    }

    const results: string[] = []

    async function readCounters(): Promise<CounterRow[]> {
      const response = await db.prepare(`
        SELECT escopo, falhas, bloqueado_ate
        FROM tentativas_login
        WHERE (escopo = 'usuario' AND chave_hash = ?)
           OR (escopo = 'ip' AND chave_hash = ?)
      `).bind(keys.usernameHash, keys.ipHash).all<CounterRow>()

      return response.results
    }

    try {
      for (let failure = 1; failure <= 5; failure++) {
        const reservation = await acquireLoginReservation(db, keys)

        check(
          reservation !== null,
          `Tentativa ${failure} foi impedida antes do limite.`,
        )

        const before = Math.floor(Date.now() / 1000)
        const recorded = await recordLoginFailure(db, reservation)
        const after = Math.floor(Date.now() / 1000)

        check(
          recorded,
          `Falha ${failure} não foi registrada.`,
        )

        const counters = await readCounters()

        check(
          counters.length === 2 &&
            counters.every((row) => row.falhas === failure),
          `Contadores incorretos após a falha ${failure}.`,
        )

        if (failure < 5) {
          check(
            counters.every((row) => row.bloqueado_ate === null),
            'Bloqueio aplicado antes da quinta falha.',
          )
        } else {
          check(
            counters.every(
              (row) =>
                row.bloqueado_ate !== null &&
                row.bloqueado_ate >= before + 900 &&
                row.bloqueado_ate <= after + 900,
            ),
            'A quinta falha não aplicou bloqueio de 15 minutos.',
          )
        }

        const remaining = await db.prepare(`
          SELECT COUNT(*) AS total
          FROM reservas_login
          WHERE reserva_hash = ?
        `).bind(reservation.reservationHash)
          .first<{ total: number }>()

        check(
          remaining?.total === 0,
          'A reserva não foi liberada após registrar a falha.',
        )

        check(
          (await recordLoginFailure(db, reservation)) === false,
          'A mesma tentativa foi contabilizada duas vezes.',
        )

        const afterRepeat = await readCounters()

        check(
          afterRepeat.every((row) => row.falhas === failure),
          'A repetição alterou os contadores.',
        )
      }

      results.push('Falhas contadas corretamente para usuário e IP.')
      results.push('Primeiras quatro falhas sem bloqueio.')
      results.push('Quinta falha aplica bloqueio de 15 minutos.')
      results.push('Reservas liberadas após registrar cada falha.')
      results.push('Repetição da mesma tentativa não conta outra falha.')

      check(
        (await acquireLoginReservation(db, keys)) === null,
        'Uma nova tentativa foi permitida durante o bloqueio.',
      )

      results.push('Nova tentativa recusada durante o bloqueio.')
    results.push(...await runLoginExpirationTests(db))
      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de contadores:', error)

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