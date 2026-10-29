import { randomBytes } from 'node:crypto'
import { readFileSync, appendFileSync } from 'node:fs'

try {
  const path = '.dev.vars'
  const current = readFileSync(path, 'utf8')

  if (/^\s*AUTH_RATE_LIMIT_SECRET\s*=/m.test(current)) {
    console.log('O segredo já existe. Nenhuma alteração realizada.')
  } else {
    const secret = randomBytes(32).toString('base64url')
    const separator = current.endsWith('\n') ? '' : '\n'

    appendFileSync(
      path,
      `${separator}AUTH_RATE_LIMIT_SECRET=${secret}\n`,
      'utf8',
    )

    console.log('Segredo criado em .dev.vars, sem exibir seu valor.')
  }
} catch {
  console.error('Não foi possível atualizar .dev.vars. Pare e me avise.')
  process.exitCode = 1
}