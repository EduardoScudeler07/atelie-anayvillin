$baseUrl = 'http://127.0.0.1:8788'
$usernameInput = Read-Host 'Usuario administrativo'
$securePassword = Read-Host 'Senha' -AsSecureString
$cookiePair = $null
$logoutCompleted = $false

function Invoke-LocalLogout {
  param([string]$SessionCookie)

  $parts = $SessionCookie.Split('=', 2)

  if (
    $parts.Count -ne 2 -or
    $parts[0] -ne '__Host-atelie_admin' -or
    $parts[1] -notmatch '^[A-Za-z0-9_-]{43}$'
  ) {
    throw 'Cookie de teste invalido.'
  }

  $webSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

  $localCookie = New-Object System.Net.Cookie
  $localCookie.Name = $parts[0]
  $localCookie.Value = $parts[1]
  $localCookie.Path = '/'
  $localCookie.HttpOnly = $true

  # Exclusivo do cliente de teste no endereco HTTP local.
  $localCookie.Secure = $false

  $webSession.Cookies.Add(
    [Uri]$baseUrl,
    $localCookie
  )

  return Invoke-WebRequest `
    -UseBasicParsing `
    -Method Post `
    -Uri "$baseUrl/api/admin/logout" `
    -ContentType 'application/json' `
    -WebSession $webSession `
    -Headers @{
      Origin = $baseUrl
      'X-Atelie-Admin' = '1'
    } `
    -TimeoutSec 25 `
    -ErrorAction Stop
}

try {
  $plainPassword = (
    New-Object System.Net.NetworkCredential('', $securePassword)
  ).Password

  $payload = @{
    username = $usernameInput
    password = $plainPassword
  } | ConvertTo-Json -Compress

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

  $loginResponse = Invoke-WebRequest `
    -UseBasicParsing `
    -Method Post `
    -Uri "$baseUrl/api/admin/login" `
    -ContentType 'application/json' `
    -Headers @{
      Origin = $baseUrl
      'X-Atelie-Admin' = '1'
    } `
    -Body $bodyBytes `
    -TimeoutSec 25 `
    -ErrorAction Stop

  $loginResult = $loginResponse.Content | ConvertFrom-Json

  if ($loginResult.autenticado -ne $true) {
    throw 'Login nao confirmado.'
  }

  $cookiePair = (
    [string]$loginResponse.Headers['Set-Cookie']
  ).Split(';')[0]

  if ($cookiePair -notmatch '^__Host-atelie_admin=[A-Za-z0-9_-]{43}$') {
    throw 'Cookie inesperado.'
  }

  Write-Output 'PASSOU: login confirmado e cookie recebido sem exibir o token.'

  $logoutResponse = Invoke-LocalLogout -SessionCookie $cookiePair
  $logoutResult = $logoutResponse.Content | ConvertFrom-Json

  if ($logoutResult.encerrado -ne $true) {
    throw 'Logout nao confirmado.'
  }

  $logoutCompleted = $true
  Write-Output 'PASSOU: rota confirmou o logout.'

  $clearCookie = [string]$logoutResponse.Headers['Set-Cookie']

  if (
    $clearCookie -notmatch '^__Host-atelie_admin=;' -or
    $clearCookie -notmatch '(?:^|;\s*)Max-Age=0(?:;|$)' -or
    $clearCookie -notmatch '(?i)(?:^|;\s*)HttpOnly(?:;|$)' -or
    $clearCookie -notmatch '(?i)(?:^|;\s*)Secure(?:;|$)' -or
    $clearCookie -notmatch '(?i)(?:^|;\s*)SameSite=Strict(?:;|$)' -or
    $clearCookie -notmatch '(?i)(?:^|;\s*)Path=/(?:;|$)'
  ) {
    throw 'Remocao do cookie inesperada.'
  }

  if ($logoutResponse.Headers['Cache-Control'] -notmatch 'no-store') {
    throw 'Controle de cache inesperado.'
  }

  Write-Output 'PASSOU: logout solicita remocao do cookie e impede cache.'

  $repeatedResponse = Invoke-LocalLogout -SessionCookie $cookiePair
  $repeatedResult = $repeatedResponse.Content | ConvertFrom-Json

  if ($repeatedResult.encerrado -ne $true) {
    throw 'Logout repetido nao confirmado.'
  }

  Write-Output 'PASSOU: logout repetido aceito.'
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
  if ($cookiePair -and -not $logoutCompleted) {
    try {
      $null = Invoke-LocalLogout -SessionCookie $cookiePair
      Write-Output 'Sessao do teste encerrada durante a limpeza.'
    }
    catch {
      Write-Output 'Nao foi possivel confirmar a limpeza da sessao.'
    }
  }

  $plainPassword = $null
  $payload = $null
  $bodyBytes = $null
  $cookiePair = $null
  $loginResponse = $null
  $loginResult = $null
  $logoutResponse = $null
  $logoutResult = $null
  $clearCookie = $null
  $repeatedResponse = $null
  $repeatedResult = $null

  if ($null -ne $securePassword) {
    $securePassword.Dispose()
  }
}