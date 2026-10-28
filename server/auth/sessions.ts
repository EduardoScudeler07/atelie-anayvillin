import { hashSessionToken, isSessionToken } from './sessionToken'

const INACTIVITY_SECONDS = 2 * 60 * 60

export type AuthenticatedAdministrator = {
  id: string
  name: string
  username: string
}

type SessionRow = {
  administrador_id: string
}

type AdministratorRow = {
  id: string
  nome: string
  usuario: string
}

export async function verifySession(
  db: D1Database,
  token: unknown,
): Promise<AuthenticatedAdministrator | null> {
  if (!isSessionToken(token)) {
    return null
  }

  const tokenHash = await hashSessionToken(token)
  const now = Math.floor(Date.now() / 1000)

  const session = await db
    .prepare(`
      UPDATE sessoes_administrativas
      SET ultima_atividade_em = MAX(ultima_atividade_em, ?)
      WHERE token_hash = ?
        AND revogada_em IS NULL
        AND criado_em <= ?
        AND expira_em > ?
        AND ultima_atividade_em > ?
        AND EXISTS (
          SELECT 1
          FROM administradores
          WHERE administradores.id =
            sessoes_administrativas.administrador_id
            AND administradores.ativo = 1
        )
      RETURNING administrador_id
    `)
    .bind(
      now,
      tokenHash,
      now,
      now,
      now - INACTIVITY_SECONDS,
    )
    .first<SessionRow>()

  if (!session) {
    return null
  }

  const administrator = await db
    .prepare(`
      SELECT id, nome, usuario
      FROM administradores
      WHERE id = ?
        AND ativo = 1
    `)
    .bind(session.administrador_id)
    .first<AdministratorRow>()

  if (!administrator) {
    return null
  }

  return {
    id: administrator.id,
    name: administrator.nome,
    username: administrator.usuario,
  }
}

export async function revokeSession(
  db: D1Database,
  token: unknown,
): Promise<void> {
  if (!isSessionToken(token)) {
    return
  }

  const tokenHash = await hashSessionToken(token)
  const now = Math.floor(Date.now() / 1000)

  await db.prepare(`
    UPDATE sessoes_administrativas
    SET revogada_em = MAX(criado_em, ?)
    WHERE token_hash = ?
      AND revogada_em IS NULL
  `).bind(now, tokenHash).run()
}