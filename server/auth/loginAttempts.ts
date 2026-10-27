import {
  createSessionToken,
  hashSessionToken,
} from './sessionToken.ts'

const RESERVATION_SECONDS = 60
const HASH_PATTERN = /^[0-9a-f]{64}$/

export type LoginKeys = {
  usernameHash: string
  ipHash: string
}

export type LoginReservation = LoginKeys & {
  reservationHash: string
  expiresAt: number
}

export async function acquireLoginReservation(
  db: D1Database,
  keys: LoginKeys,
): Promise<LoginReservation | null> {
  if (
    !HASH_PATTERN.test(keys.usernameHash) ||
    !HASH_PATTERN.test(keys.ipHash)
  ) {
    throw new Error('Chaves de controle inválidas.')
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + RESERVATION_SECONDS
  const reservationHash = await hashSessionToken(createSessionToken())

  // SQL fixo. Os valores recebidos são passados somente por bind.
  const insertReservation = `
    INSERT OR IGNORE INTO reservas_login (
      escopo, chave_hash, reserva_hash, criado_em, expira_em
    )
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1
      FROM tentativas_login
      WHERE (
        (escopo = 'usuario' AND chave_hash = ?)
        OR (escopo = 'ip' AND chave_hash = ?)
      )
      AND bloqueado_ate > ?
    )
  `

  const results = await db.batch([
    db.prepare(`
      DELETE FROM reservas_login
      WHERE expira_em <= ?
        AND (
          (escopo = 'usuario' AND chave_hash = ?)
          OR (escopo = 'ip' AND chave_hash = ?)
        )
    `).bind(now, keys.usernameHash, keys.ipHash),

    db.prepare(insertReservation).bind(
      'usuario',
      keys.usernameHash,
      reservationHash,
      now,
      expiresAt,
      keys.usernameHash,
      keys.ipHash,
      now,
    ),

    db.prepare(insertReservation).bind(
      'ip',
      keys.ipHash,
      reservationHash,
      now,
      expiresAt,
      keys.usernameHash,
      keys.ipHash,
      now,
    ),

    // Remove qualquer aquisição parcial desta tentativa.
    db.prepare(`
      DELETE FROM reservas_login
      WHERE reserva_hash = ?
        AND NOT EXISTS (
          SELECT 1
          FROM reservas_login AS usuario
          JOIN reservas_login AS ip
            ON ip.reserva_hash = usuario.reserva_hash
          WHERE usuario.escopo = 'usuario'
            AND usuario.chave_hash = ?
            AND ip.escopo = 'ip'
            AND ip.chave_hash = ?
            AND usuario.reserva_hash = ?
        )
    `).bind(
      reservationHash,
      keys.usernameHash,
      keys.ipHash,
      reservationHash,
    ),
  ])

  const acquiredBoth =
    results[1].meta.changes === 1 &&
    results[2].meta.changes === 1

  if (!acquiredBoth) {
    return null
  }

  return {
    ...keys,
    reservationHash,
    expiresAt,
  }
}