import {
  createAdminSession,
  type CreatedAdminSession,
} from './createAdminSession.ts'
import { signInWithFirebase } from './firebaseAuth.ts'
import {
  acquireLoginReservation,
  recordLoginFailure,
  releaseLoginReservation,
  type LoginReservation,
} from './loginAttempts.ts'
import {
  createLoginKeys,
  normalizeLoginUsername,
} from './loginKeys.ts'

type LoginConfiguration = {
  firebaseWebApiKey: string
  rateLimitSecret: string
}

type LoginInput = {
  username: string
  password: string
  trustedIp: string
}

type AdministratorRow = {
  id: string
  email_firebase: string
  firebase_uid: string
}

export type LoginResult =
  | { status: 'authenticated'; session: CreatedAdminSession }
  | { status: 'rejected' }
  | { status: 'retry' }
  | { status: 'unavailable' }

const UNKNOWN_ACCOUNT_EMAIL = 'login-inexistente@example.invalid'

export async function login(
  db: D1Database,
  configuration: LoginConfiguration,
  input: LoginInput,
  authenticate: typeof signInWithFirebase = signInWithFirebase,
): Promise<LoginResult> {
  if (!input.password || input.password.length > 128) {
    return { status: 'rejected' }
  }

  let username: string

  try {
    username = normalizeLoginUsername(input.username)
  } catch {
    return { status: 'rejected' }
  }

  let reservation: LoginReservation | null = null

  try {
    const keys = await createLoginKeys({
      secret: configuration.rateLimitSecret,
      username,
      trustedIp: input.trustedIp,
    })

    reservation = await acquireLoginReservation(db, keys)

    if (!reservation) {
      return { status: 'retry' }
    }

    const administrator = await db.prepare(`
      SELECT id, email_firebase, firebase_uid
      FROM administradores
      WHERE usuario = ?
        AND ativo = 1
    `).bind(username).first<AdministratorRow>()

    const verification = await authenticate({
      webApiKey: configuration.firebaseWebApiKey,
      email: administrator?.email_firebase ?? UNKNOWN_ACCOUNT_EMAIL,
      password: input.password,
    })

    if (verification.status === 'unavailable') {
      return { status: 'unavailable' }
    }

    if (verification.status === 'limited') {
      return { status: 'retry' }
    }

    if (
      verification.status === 'rejected' ||
      !administrator ||
      verification.uid !== administrator.firebase_uid
    ) {
      const recorded = await recordLoginFailure(db, reservation)
      reservation = null

      return recorded
        ? { status: 'rejected' }
        : { status: 'retry' }
    }

    const session = await createAdminSession(db, {
      administratorId: administrator.id,
      verifiedFirebaseUid: verification.uid,
      reservation,
    })

    reservation = null

    if (!session) {
      return { status: 'retry' }
    }

    return {
      status: 'authenticated',
      session,
    }
  } catch {
    // Não inclui senha, tokens ou respostas do provedor em logs.
    return { status: 'unavailable' }
  } finally {
    if (reservation) {
      try {
        await releaseLoginReservation(db, reservation)
      } catch {
        // A reserva também possui expiração limitada a 60 segundos.
        console.warn('Não foi possível liberar uma reserva de login.')
      }
    }
  }
}