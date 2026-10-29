import { createAdminSession } from '../../server/auth/createAdminSession.ts'
import {
  acquireLoginReservation,
  type LoginKeys,
} from '../../server/auth/loginAttempts.ts'
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

export async function runSessionCompletionTests(
  db: D1Database,
  administratorId: string,
  firebaseUid: string,
): Promise<string[]> {
  const keysToClean: LoginKeys[] = []
  const sessionHashes: string[] = []
  const results: string[] = []

  async function newKeys(): Promise<LoginKeys> {
    const keys = {
      usernameHash: await hashSessionToken(createSessionToken()),
      ipHash: await hashSessionToken(createSessionToken()),
    }

    keysToClean.push(keys)
    return keys
  }

  try {
    // O bloqueio aparece depois da aquisição das reservas.
    for (const scope of ['usuario', 'ip'] as const) {
      const keys = await newKeys()
      const reservation = await acquireLoginReservation(db, keys)

      check(reservation !== null, 'Reserva de teste não foi criada.')

      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        INSERT INTO tentativas_login (
          escopo, chave_hash, falhas,
          janela_inicio_em, bloqueado_ate, atualizado_em
        ) VALUES (?, ?, 5, ?, ?, ?)
      `).bind(
        scope,
        scope === 'usuario' ? keys.usernameHash : keys.ipHash,
        now,
        now + 900,
        now,
      ).run()

      const created = await createAdminSession(db, {
        administratorId,
        verifiedFirebaseUid: firebaseUid,
        reservation,
      })

      if (created) {
        sessionHashes.push(await hashSessionToken(created.token))
      }

      check(
        created === null,
        `Bloqueio de ${scope} não impediu a criação da sessão.`,
      )

      results.push(
        scope === 'usuario'
          ? 'Bloqueio de usuário aplicado durante a tentativa impede a sessão.'
          : 'Bloqueio de IP aplicado durante a tentativa impede a sessão.',
      )
    }

    // A mesma reserva deve permitir somente uma conclusão.
    const keys = await newKeys()
    const reservation = await acquireLoginReservation(db, keys)

    check(reservation !== null, 'Reserva de concorrência não foi criada.')

    const outcomes = await Promise.allSettled(
      Array.from(
        { length: 10 },
        () => createAdminSession(db, {
          administratorId,
          verifiedFirebaseUid: firebaseUid,
          reservation,
        }),
      ),
    )

    let winners = 0
    let errors = 0

    for (const outcome of outcomes) {
      if (outcome.status === 'rejected') {
        errors++
      } else if (outcome.value !== null) {
        winners++
        sessionHashes.push(
          await hashSessionToken(outcome.value.token),
        )
      }
    }

    check(errors === 0, 'Houve erro nas conclusões simultâneas.')
    check(
      winners === 1,
      'A mesma reserva não teve exatamente uma conclusão vencedora.',
    )

    const remaining = await db.prepare(`
      SELECT COUNT(*) AS total
      FROM reservas_login
      WHERE reserva_hash = ?
    `).bind(reservation.reservationHash)
      .first<{ total: number }>()

    check(
      remaining?.total === 0,
      'A conclusão deixou reservas pendentes.',
    )

    results.push(
      'Dez conclusões simultâneas da mesma reserva criam somente uma sessão.',
    )

    return results
  } finally {
    for (const hash of sessionHashes) {
      await db.prepare(`
        DELETE FROM sessoes_administrativas
        WHERE token_hash = ? AND administrador_id = ?
      `).bind(hash, administratorId).run()
    }

    for (const keys of keysToClean) {
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
  }
}