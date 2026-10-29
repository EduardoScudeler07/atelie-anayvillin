class ConfigurationCheckError extends Error {}

function check(condition, message) {
  if (!condition) {
    throw new ConfigurationCheckError(message)
  }
}

function hasSetting(value) {
  if (
    value === undefined ||
    value === null ||
    value === false ||
    value === '' ||
    value === 0
  ) {
    return false
  }

  if (Array.isArray(value)) return value.length > 0

  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return true
}

async function main() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim()

  check(
    cloudName === 'lbspaasm',
    'Confira CLOUDINARY_CLOUD_NAME no arquivo local.',
  )
  check(
    apiKey && apiSecret,
    'API Key ou API Secret ausente no arquivo local.',
  )
  check(
    preset === 'atelie_produtos_preview',
    'Confira CLOUDINARY_UPLOAD_PRESET no arquivo local.',
  )

  const authorization = Buffer
    .from(`${apiKey}:${apiSecret}`, 'utf8')
    .toString('base64')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/upload_presets/${encodeURIComponent(preset)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authorization}`,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    },
  )

  check(
    response.status !== 401 && response.status !== 403,
    'Cloudinary recusou as credenciais ou permissoes. Pare e me avise.',
  )
  check(
    response.status !== 404,
    'Preset nao encontrado. Confira seu nome e se foi salvo.',
  )
  check(
    response.status === 200,
    `Consulta nao concluida. Codigo HTTP: ${response.status}.`,
  )

  const data = await response.json()

  check(
    data &&
      typeof data === 'object' &&
      data.name === preset &&
      data.settings &&
      typeof data.settings === 'object',
    'Resposta de configuracao inesperada.',
  )

  console.log('PASSOU: credenciais aceitas e preset encontrado.')

  check(
    data.unsigned === false,
    'O preset precisa estar configurado como Signed.',
  )
  console.log('PASSOU: preset exige upload autenticado.')

  check(
    data.settings.overwrite === false,
    'A sobrescrita precisa estar desativada.',
  )
  console.log('PASSOU: sobrescrita desativada.')

  check(
    data.settings.asset_folder === 'atelie-anayvillin-preview/produtos',
    'A pasta do preset difere da pasta combinada.',
  )
  console.log('PASSOU: pasta de destino correta.')

  const processingFields = [
    'transformation',
    'eager',
    'format',
    'background_removal',
    'raw_convert',
    'categorization',
    'auto_tagging',
    'ocr',
    'detection',
    'moderation',
    'eval',
    'on_success',
  ]

  check(
    processingFields.every(
      (field) => !hasSetting(data.settings[field]),
    ),
    'O preset possui uma configuracao de processamento que precisamos revisar.',
  )
  console.log('PASSOU: sem processamento adicional nos campos conferidos.')
}

main().catch((error) => {
  console.error(
    error instanceof ConfigurationCheckError
      ? error.message
      : 'Nao foi possivel consultar a configuracao. Pare e me avise.',
  )
  process.exitCode = 1
})