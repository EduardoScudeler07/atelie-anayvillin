$loginUrl = 'http://127.0.0.1:8788/api/admin/login'
$loginOrigin = 'http://127.0.0.1:8788'

$usernameInput = Read-Host 'Usuario administrativo'
$securePassword = Read-Host 'Senha' -AsSecureString

try {
  $plainPassword = (
    New-Object System.Net.NetworkCredential('', $securePassword)
  ).Password

  $payload = @{
    username = $usernameInput
    password = $plainPassword
  } | ConvertTo-Json -Compress

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

  $response = Invoke-WebRequest `
    -UseBasicParsing `
    -Method Post `
    -Uri $loginUrl `
    -ContentType 'application/json' `
    -Headers @{
      Origin = $loginOrigin
      'X-Atelie-Admin' = '1'
    } `
    -Body $bodyBytes `
    -TimeoutSec 25

  $result = $response.Content | ConvertFrom-Json

  if (
    $response.StatusCode -ne 200 -or
    $result.autenticado -ne $true -or
    @($result.PSObject.Properties).Count -ne 1
  ) {
    throw 'Resposta inesperada.'
  }

  Write-Output 'PASSOU: rota confirmou o login sem retornar token no JSON.'

  $cookieHeader = [string]$response.Headers['Set-Cookie']

  if (
    $cookieHeader -notmatch '^__Host-atelie_admin=[A-Za-z0-9_-]{43};' -or
    $cookieHeader -notmatch '(?i)(?:^|;\s*)HttpOnly(?:;|$)' -or
    $cookieHeader -notmatch '(?i)(?:^|;\s*)Secure(?:;|$)' -or
    $cookieHeader -notmatch '(?i)(?:^|;\s*)SameSite=Strict(?:;|$)' -or
    $cookieHeader -notmatch '(?i)(?:^|;\s*)Path=/(?:;|$)' -or
    $cookieHeader -match '(?i)(?:^|;\s*)Domain='
  ) {
    throw 'Atributos do cookie inesperados.'
  }

  Write-Output 'PASSOU: resposta enviou cookie com os atributos esperados.'

  if ($response.Headers['Cache-Control'] -notmatch 'no-store') {
    throw 'Controle de cache inesperado.'
  }

  Write-Output 'PASSOU: resposta de login impede armazenamento em cache.'
}
catch {
  Write-Output 'Verificacao nao concluida. Pare e me avise.'

  if ($null -ne $_.Exception.Response) {
    Write-Output (
      'Codigo HTTP: ' + [int]$_.Exception.Response.StatusCode
    )
  }
}
finally {
  $plainPassword = $null
  $payload = $null
  $bodyBytes = $null
  $cookieHeader = $null
  $response = $null
  $result = $null
  $usernameInput = $null

  if ($null -ne $securePassword) {
    $securePassword.Dispose()
  }
}