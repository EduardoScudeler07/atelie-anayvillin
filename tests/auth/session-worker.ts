import { verifySession } from '../../server/auth/sessions'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken'

type Env = {
  DB: D1Database
}

function check(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Use POST para executar os testes.', {
        status: 405,
        headers: { Allow: 'POST' },
      })
    }

    const db = env.DB
    const administratorId = 'admin-session-test'
    const results: string[] = []
    const hashes: string[] = []

    async function createSession(
      created: number,
      lastActivity: number,
      expires: number,
      revoked: number | null = null,
    ): Promise<string> {
      const token = createSessionToken()
      const hash = await hashSessionToken(token)
      hashes.push(hash)

      await db.prepare(`
        INSERT INTO sessoes_administrativas (
          token_hash,
          administrador_id,
          criado_em,
          ultima_atividade_em,
          expira_em,
          revogada_em
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        hash,
        administratorId,
        created,
        lastActivity,
        expires,
        revoked,
      ).run()

      return token
    }

    try {
      await db.prepare(`
        INSERT INTO administradores (
          id, nome, usuario, email_firebase, firebase_uid, ativo
        ) VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET ativo = 1
      `).bind(
        administratorId,
        'Administrador fictício',
        'session.test',
        'session-test@example.invalid',
        'firebase-session-test',
      ).run()

      const now = Math.floor(Date.now() / 1000)

      const validToken = await createSession(
        now - 3600,
        now - 60,
        now + 3600,
      )

      const administrator = await verifySession(db, validToken)

      check(
        administrator?.id === administratorId,
        'Sessão válida foi recusada.',
      )

      const updated = await db.prepare(`
        SELECT ultima_atividade_em
        FROM sessoes_administrativas
        WHERE token_hash = ?
      `).bind(await hashSessionToken(validToken))
        .first<{ ultima_atividade_em: number }>()

      check(
        updated !== null && updated.ultima_atividade_em >= now,
        'Atividade da sessão válida não foi atualizada.',
      )

      results.push('Sessão válida aceita e atividade atualizada.')

      const expired = await createSession(
        now - 3600,
        now - 60,
        now - 1,
      )
      check(
        await verifySession(db, expired) === null,
        'Sessão vencida foi aceita.',
      )
      results.push('Sessão vencida recusada.')

      const inactive = await createSession(
        now - 10800,
        now - 7201,
        now + 3600,
      )
      check(
        await verifySession(db, inactive) === null,
        'Sessão sem atividade por mais de 2 horas foi aceita.',
      )

      const unchanged = await db.prepare(`
        SELECT ultima_atividade_em
        FROM sessoes_administrativas
        WHERE token_hash = ?
      `).bind(await hashSessionToken(inactive))
        .first<{ ultima_atividade_em: number }>()

      check(
        unchanged?.ultima_atividade_em === now - 7201,
        'Sessão inativa teve sua atividade renovada.',
      )
      results.push('Sessão inativa recusada sem renovação.')

      const revoked = await createSession(
        now - 3600,
        now - 60,
        now + 3600,
        now - 30,
      )
      check(
        await verifySession(db, revoked) === null,
        'Sessão revogada foi aceita.',
      )
      results.push('Sessão revogada recusada.')

      await db.prepare(`
        UPDATE administradores SET ativo = 0 WHERE id = ?
      `).bind(administratorId).run()

      check(
        await verifySession(db, validToken) === null,
        'Administrador desativado foi aceito.',
      )
      results.push('Administrador desativado recusado.')

      check(
        await verifySession(db, createSessionToken()) === null,
        'Token inexistente foi aceito.',
      )
      check(
        await verifySession(db, 'invalido') === null,
        'Token inválido foi aceito.',
      )
      results.push('Tokens inexistente e inválido recusados.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de sessões:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } },
      )
    } finally {
      for (const hash of hashes) {
        await db.prepare(`
          DELETE FROM sessoes_administrativas
          WHERE token_hash = ? AND administrador_id = ?
        `).bind(hash, administratorId).run()
      }

      await db.prepare(`
        DELETE FROM administradores WHERE id = ?
      `).bind(administratorId).run()
    }
  },
}