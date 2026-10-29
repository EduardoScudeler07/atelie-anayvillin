import type { LoginReservation } from './loginAttempts.ts'
import {
  createSessionToken,
  hashSessionToken,
} from './sessionToken.ts'

const SESSION_SECONDS = 24 * 60 * 60
const HASH_PATTERN = /^[0-9a-f]{64}$/

export type CreatedAdminSession = {
  token: string
  expiresAt: number
}

type CreateSessionInput = {
  administratorId: string
  verifiedFirebaseUid: string
  reservation: LoginReservation
}

export async function createAdminSession(
  db: D1Database,
  input: CreateSessionInput,
): Promise<CreatedAdminSession | null> {
  const {
    administratorId,
    verifiedFirebaseUid,
    reservation,
  } = input

  if (
    !administratorId.trim() ||
    !verifiedFirebaseUid.trim() ||
    !HASH_PATTERN.test(reservation.usernameHash) ||
    !HASH_PATTERN.test(reservation.ipHash) ||
    !HASH_PATTERN.test(reservation.reservationHash)
  ) {
    throw new Error('Dados de conclusão de login inválidos.')
  }

  const token = createSessionToken()
  const tokenHash = await hashSessionToken(token)
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + SESSION_SECONDS

  const results = await db.batch([
    db.prepare(`
      INSERT INTO sessoes_administrativas (
        token_hash,
        administrador_id,
        criado_em,
        ultima_atividade_em,
        expira_em
      )
      SELECT ?, id, ?, ?, ?
      FROM administradores
      WHERE id = ?
        AND firebase_uid = ?
        AND ativo = 1
        AND (
          SELECT COUNT(*)
          FROM reservas_login
          WHERE reserva_hash = ?
            AND criado_em <= ?
            AND expira_em > ?
            AND (
              (escopo = 'usuario' AND chave_hash = ?)
              OR (escopo = 'ip' AND chave_hash = ?)
            )
        ) = 2
        AND NOT EXISTS (
          SELECT 1
          FROM tentativas_login
          WHERE (
            (escopo = 'usuario' AND chave_hash = ?)
            OR (escopo = 'ip' AND chave_hash = ?)
          )
          AND bloqueado_ate > ?
        )
    `).bind(
      tokenHash,
      now,
      now,
      expiresAt,
      administratorId,
      verifiedFirebaseUid,
      reservation.reservationHash,
      now,
      now,
      reservation.usernameHash,
      reservation.ipHash,
      reservation.usernameHash,
      reservation.ipHash,
      now,
    ),

    db.prepare(`
      DELETE FROM reservas_login
      WHERE reserva_hash = ?
        AND (
          (escopo = 'usuario' AND chave_hash = ?)
          OR (escopo = 'ip' AND chave_hash = ?)
        )
    `).bind(
      reservation.reservationHash,
      reservation.usernameHash,
      reservation.ipHash,
    ),
  ])

  if (results[0].meta.changes !== 1) {
    return null
  }

  return {
    token,
    expiresAt,
  }
}