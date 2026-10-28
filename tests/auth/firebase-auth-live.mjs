import { signInWithFirebase } from '../../server/auth/firebaseAuth.ts'

const expectedUid = 'LDIBrKyE2EU7INR8ya6wL1Leo1m1'

try {
  let text = ''

  for await (const chunk of process.stdin) {
    text += chunk.toString('utf8')

    if (text.length > 8192) {
      throw new Error('Entrada inválida')
    }
  }

  const credentials = JSON.parse(text.replace(/^\uFEFF/, ''))

  if (
    typeof credentials.email !== 'string' ||
    typeof credentials.password !== 'string'
  ) {
    throw new Error('Entrada inválida')
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY

  if (!apiKey) {
    console.error('Configuração Firebase ausente. Pare e me avise.')
    process.exitCode = 1
  } else {
    const result = await signInWithFirebase({
      webApiKey: apiKey,
      email: credentials.email,
      password: credentials.password,
    })

    if (result.status === 'verified' && result.uid === expectedUid) {
      console.log('PASSOU: Firebase confirmou a conta de teste esperada.')
    } else if (result.status === 'rejected') {
      console.log('Credenciais recusadas pelo Firebase.')
      process.exitCode = 1
    } else if (result.status === 'limited') {
      console.log('Firebase limitou as tentativas. Pare e me avise.')
      process.exitCode = 1
    } else {
      console.log('Não foi possível confirmar a conta esperada. Pare e me avise.')
      process.exitCode = 1
    }
  }
} catch {
  console.error('Não foi possível executar a verificação. Pare e me avise.')
  process.exitCode = 1
}