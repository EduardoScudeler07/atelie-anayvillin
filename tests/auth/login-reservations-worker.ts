import {
  acquireLoginReservation,
  type LoginKeys,
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
    const keysToClean: LoginKeys[] = []
    const results: string[] = []

    async function newHash(): Promise<string> {
      return hashSessionToken(createSessionToken())
    }

    async function newKeys(): Promise<LoginKeys> {
      const keys = {
        usernameHash: await newHash(),
        ipHash: await newHash(),
      }

      keysToClean.push(keys)
      return keys
    }

    async function countReservation(
      scope: 'usuario' | 'ip',
      hash: string,
    ): Promise<number> {
      const row = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE escopo = ? AND chave_hash = ?
      `).bind(scope, hash).first<{ total: number }>()

      return row?.total ?? 0
    }

    async function countOwnedReservations(
      reservationHash: string,
    ): Promise<number> {
      const row = await db.prepare(`
        SELECT COUNT(*) AS total
        FROM reservas_login
        WHERE reserva_hash = ?
      `).bind(reservationHash).first<{ total: number }>()

      return row?.total ?? 0
    }

    async function hasPair(keys: LoginKeys): Promise<boolean> {
      return (
        (await countReservation('usuario', keys.usernameHash)) === 1 &&
        (await countReservation('ip', keys.ipHash)) === 1
      )
    }

    async function hasNoReservations(
      keys: LoginKeys,
    ): Promise<boolean> {
      return (
        (await countReservation('usuario', keys.usernameHash)) === 0 &&
        (await countReservation('ip', keys.ipHash)) === 0
      )
    }

    try {
      // 1. Aquisição das duas reservas.
      const base = await newKeys()
      const first = await acquireLoginReservation(db, base)

      check(first !== null, 'Aquisição inicial recusada.')
      check(
        await hasPair(base),
        'Aquisição inicial não criou as duas reservas.',
      )

      results.push('Usuário e IP reservados juntos.')

      // 2. Repetição das mesmas chaves.
      check(
        (await acquireLoginReservation(db, base)) === null,
        'Reservas ocupadas foram adquiridas.',
      )

      results.push('Tentativa duplicada recusada.')

      // 3. Usuário ocupado com outro IP.
      const sameUser: LoginKeys = {
        usernameHash: base.usernameHash,
        ipHash: await newHash(),
      }
      keysToClean.push(sameUser)

      check(
        (await acquireLoginReservation(db, sameUser)) === null,
        'Usuário ocupado foi adquirido por outro IP.',
      )
      check(
        (await countReservation('ip', sameUser.ipHash)) === 0,
        'Sobrou reserva parcial de IP.',
      )

      results.push(
        'Disputa por usuário recusada sem reserva parcial.',
      )

      // 4. IP ocupado com outro usuário.
      const sameIp: LoginKeys = {
        usernameHash: await newHash(),
        ipHash: base.ipHash,
      }
      keysToClean.push(sameIp)

      check(
        (await acquireLoginReservation(db, sameIp)) === null,
        'IP ocupado foi adquirido por outro usuário.',
      )
      check(
        (await countReservation('usuario', sameIp.usernameHash)) === 0,
        'Sobrou reserva parcial de usuário.',
      )

      results.push(
        'Disputa por IP recusada sem reserva parcial.',
      )

      // 5. Preservação das reservas originais.
      check(
        (await countOwnedReservations(first.reservationHash)) === 2,
        'Uma disputa alterou as reservas da primeira tentativa.',
      )

      results.push('Reservas da primeira tentativa preservadas.')

      // 6. Dez tentativas simultâneas.
      const concurrentKeys = await newKeys()

      const concurrentResults = await Promise.all(
        Array.from(
          { length: 10 },
          () => acquireLoginReservation(db, concurrentKeys),
        ),
      )

      const winners = concurrentResults.filter(
        (reservation) => reservation !== null,
      )

      check(
        winners.length === 1,
        'As tentativas simultâneas não tiveram exatamente uma vencedora.',
      )

      const winner = winners[0]
      check(winner !== undefined, 'Tentativa vencedora ausente.')

      check(
        await hasPair(concurrentKeys),
        'A disputa simultânea deixou reservas inconsistentes.',
      )
      check(
        (await countOwnedReservations(winner.reservationHash)) === 2,
        'As reservas não pertencem à mesma tentativa vencedora.',
      )

      results.push(
        'Dez tentativas simultâneas: uma vencedora com as duas reservas.',
      )

      // 7. Substituição de reservas vencidas.
      const expirationKeys = await newKeys()
      const oldReservation = await acquireLoginReservation(
        db,
        expirationKeys,
      )

      check(
        oldReservation !== null,
        'Não foi possível preparar o teste de expiração.',
      )

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

      const replacement = await acquireLoginReservation(
        db,
        expirationKeys,
      )

      check(
        replacement !== null,
        'Reserva vencida não foi substituída.',
      )
      check(
        replacement.reservationHash !== oldReservation.reservationHash,
        'A nova tentativa reutilizou a identificação anterior.',
      )
      check(
        (await countOwnedReservations(
          oldReservation.reservationHash,
        )) === 0 &&
          (await countOwnedReservations(
            replacement.reservationHash,
          )) === 2,
        'Substituição deixou reservas inconsistentes.',
      )

      results.push(
        'Reservas vencidas substituídas por uma nova tentativa.',
      )

      // 8 e 9. Bloqueios de usuário e de IP.
      for (const scope of ['usuario', 'ip'] as const) {
        const blockedKeys = await newKeys()
        const blockedHash = scope === 'usuario'
          ? blockedKeys.usernameHash
          : blockedKeys.ipHash

        const blockedNow = Math.floor(Date.now() / 1000)
        const blockedUntil = blockedNow + 900

        await db.prepare(`
          INSERT INTO tentativas_login (
            escopo,
            chave_hash,
            falhas,
            janela_inicio_em,
            bloqueado_ate,
            atualizado_em
          ) VALUES (?, ?, 5, ?, ?, ?)
        `).bind(
          scope,
          blockedHash,
          blockedNow - 10,
          blockedUntil,
          blockedNow,
        ).run()

        check(
          (await acquireLoginReservation(db, blockedKeys)) === null,
          `Bloqueio de ${scope} não impediu a aquisição.`,
        )

        check(
          await hasNoReservations(blockedKeys),
          `Bloqueio de ${scope} deixou reserva parcial.`,
        )

        const blockedRow = await db.prepare(`
          SELECT falhas, bloqueado_ate
          FROM tentativas_login
          WHERE escopo = ? AND chave_hash = ?
        `).bind(scope, blockedHash).first<{
          falhas: number
          bloqueado_ate: number
        }>()

        check(
          blockedRow?.falhas === 5 &&
            blockedRow.bloqueado_ate === blockedUntil,
          `A tentativa alterou o bloqueio de ${scope}.`,
        )

        results.push(
          scope === 'usuario'
            ? 'Usuário bloqueado recusado sem reserva parcial.'
            : 'IP bloqueado recusado sem reserva parcial.',
        )
      }

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste local de reservas:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
      // Limpa somente as chaves fictícias desta execução.
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
  },
}