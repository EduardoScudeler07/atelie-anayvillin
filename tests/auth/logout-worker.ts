import {
  revokeSession,
  verifySession,
} from '../../server/auth/sessions.ts'
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
    const token = createSessionToken()
    const tokenHash = await hashSessionToken(token)
    const suffix = tokenHash.slice(0, 16)
    const administratorId = `admin-logout-${suffix}`
    const results: string[] = []

    async function readSession(hash: string) {
      return db.prepare(`
        SELECT revogada_em, ultima_atividade_em
        FROM sessoes_administrativas
        WHERE token_hash = ?
      `).bind(hash).first<{
        revogada_em: number | null
        ultima_atividade_em: number
      }>()
    }

    async function insertSession(hash: string) {
      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        INSERT INTO sessoes_administrativas (
          token_hash, administrador_id,
          criado_em, ultima_atividade_em, expira_em
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        hash,
        administratorId,
        now,
        now,
        now + 86400,
      ).run()
    }

    try {
      await db.prepare(`
        INSERT INTO administradores (
          id, nome, usuario, email_firebase, firebase_uid, ativo
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).bind(
        administratorId,
        'Administrador fictício',
        `logout.${suffix}`,
        `${suffix}@example.invalid`,
        `firebase-logout-${suffix}`,
      ).run()

      await insertSession(tokenHash)

      check(
        (await verifySession(db, token))?.id === administratorId,
        'Sessão inicial não foi reconhecida.',
      )

      const before = await readSession(tokenHash)
      check(before !== null, 'Sessão inicial ausente.')

      await revokeSession(db, token)

      const revoked = await readSession(tokenHash)

      check(
        revoked !== null &&
          revoked.revogada_em !== null &&
          revoked.ultima_atividade_em === before.ultima_atividade_em,
        'Revogação incorreta ou atividade alterada.',
      )

      check(
        (await verifySession(db, token)) === null,
        'Sessão revogada continuou sendo aceita.',
      )

      results.push('Sessão revogada passa a ser recusada.')
      results.push('Revogação não renova a atividade.')

      await revokeSession(db, token)

      const repeated = await readSession(tokenHash)

      check(
        repeated?.revogada_em === revoked.revogada_em,
        'Repetição alterou a revogação original.',
      )

      results.push('Logout repetido preserva a revogação original.')

      await revokeSession(db, null)
      await revokeSession(db, 'invalido')
      await revokeSession(db, createSessionToken())

      const unchanged = await readSession(tokenHash)

      check(
        unchanged?.revogada_em === revoked.revogada_em &&
          unchanged?.ultima_atividade_em === before.ultima_atividade_em,
        'Outro token alterou a sessão.',
      )

      results.push('Tokens ausentes, inválidos ou inexistentes são seguros.')

      const inactiveToken = createSessionToken()
      const inactiveHash = await hashSessionToken(inactiveToken)
      await insertSession(inactiveHash)

      await db.prepare(`
        UPDATE administradores SET ativo = 0 WHERE id = ?
      `).bind(administratorId).run()

      await revokeSession(db, inactiveToken)

      const inactiveSession = await readSession(inactiveHash)

      check(
        inactiveSession !== null &&
          inactiveSession.revogada_em !== null,
        'Administrador desativado não conseguiu ter a sessão revogada.',
      )

      results.push('Sessão de administrador desativado também é revogada.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de logout:', error)

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
    }
  },
}