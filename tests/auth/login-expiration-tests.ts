import {
  acquireLoginReservation,
  recordLoginFailure,
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

export async function runLoginExpirationTests(
  db: D1Database,
): Promise<string[]> {
  const keys = {
    usernameHash: await hashSessionToken(createSessionToken()),
    ipHash: await hashSessionToken(createSessionToken()),
  }

  async function checkCounters(expected: number): Promise<void> {
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
          (row) =>
            row.falhas === expected &&
            row.bloqueado_ate === null,
        ),
      'Contadores ou bloqueios inesperados.',
    )
  }

  try {
    const now = Math.floor(Date.now() / 1000)

    // Simula uma janela antiga e um bloqueio já encerrado.
    await db.batch(
      (['usuario', 'ip'] as const).map((scope) =>
        db.prepare(`
          INSERT INTO tentativas_login (
            escopo, chave_hash, falhas,
            janela_inicio_em, bloqueado_ate, atualizado_em
          ) VALUES (?, ?, 5, ?, ?, ?)
        `).bind(
          scope,
          scope === 'usuario' ? keys.usernameHash : keys.ipHash,
          now - 1800,
          now - 1,
          now - 1,
        ),
      ),
    )

    const afterBlock = await acquireLoginReservation(db, keys)

    check(
      afterBlock !== null,
      'Bloqueio vencido continuou impedindo a tentativa.',
    )
    check(
      await recordLoginFailure(db, afterBlock),
      'Falha da nova janela não foi registrada.',
    )

    await checkCounters(1)

    // Prepara uma reserva e simula seu vencimento.
    const oldReservation = await acquireLoginReservation(db, keys)
    check(oldReservation !== null, 'Reserva antiga não foi criada.')

    const expirationNow = Math.floor(Date.now() / 1000)

    await db.prepare(`
      UPDATE reservas_login
      SET criado_em = ?, expira_em = ?
      WHERE reserva_hash = ?
    `).bind(
      expirationNow - 61,
      expirationNow - 1,
      oldReservation.reservationHash,
    ).run()

    // A execução vencida não pode registrar uma falha.
    check(
      (await recordLoginFailure(db, oldReservation)) === false,
      'Reserva vencida conseguiu registrar uma falha.',
    )
    await checkCounters(1)

    const replacement = await acquireLoginReservation(db, keys)
    check(replacement !== null, 'Reserva substituta não foi criada.')

    // A execução antiga também não pode remover a substituta.
    check(
      (await recordLoginFailure(db, oldReservation)) === false,
      'Execução antiga conseguiu registrar uma falha.',
    )

    const replacementRows = await db.prepare(`
      SELECT COUNT(*) AS total
      FROM reservas_login
      WHERE reserva_hash = ?
    `).bind(replacement.reservationHash)
      .first<{ total: number }>()

    check(
      replacementRows?.total === 2,
      'Execução antiga removeu reservas da substituta.',
    )
    await checkCounters(1)

    check(
      await recordLoginFailure(db, replacement),
      'Tentativa substituta não conseguiu registrar sua falha.',
    )
    await checkCounters(2)

    return [
      'Bloqueio vencido permite nova tentativa.',
      'Janela vencida reinicia a contagem em uma falha.',
      'Reserva vencida não registra falhas.',
      'Tentativa antiga não altera contadores nem remove a substituta.',
      'Tentativa substituta registra sua própria falha.',
    ]
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
}