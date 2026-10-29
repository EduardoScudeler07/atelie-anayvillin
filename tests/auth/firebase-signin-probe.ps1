$ErrorActionPreference = 'Stop'

$varsPath = Join-Path $PSScriptRoot '../../.dev.vars'

if (-not (Test-Path -LiteralPath $varsPath)) {
  Write-Output 'Arquivo .dev.vars não encontrado.'
  exit 1
}

$keyLines = @(
  Get-Content -LiteralPath $varsPath |
    Where-Object { $_ -match '^FIREBASE_WEB_API_KEY=' }
)

if ($keyLines.Count -ne 1) {
  Write-Output 'Confira FIREBASE_WEB_API_KEY no arquivo local.'
  exit 1
}

$firebaseKey = ($keyLines[0] -split '=', 2)[1].Trim()

if ([string]::IsNullOrWhiteSpace($firebaseKey)) {
  Write-Output 'Chave Web não configurada.'
  exit 1
}

$email = (Read-Host 'E-mail da conta Firebase de teste').Trim()
$securePassword = Read-Host 'Senha da conta de teste' -AsSecureString

$password = $null
$body = $null
$result = $null

try {
  $password = [System.Net.NetworkCredential]::new(
    '',
    $securePassword
  ).Password

  $body = @{
    email = $email
    password = $password
    returnSecureToken = $true
  } | ConvertTo-Json -Compress

  $uri = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
    [Uri]::EscapeDataString($firebaseKey)

  $result = Invoke-RestMethod `
    -Method Post `
    -Uri $uri `
    -ContentType 'application/json' `
    -Body $body `
    -TimeoutSec 30

  $expectedUid = 'LDIBrKyE2EU7INR8ya6wL1Leo1m1'

  if ($result.localId -ne $expectedUid) {
    throw 'Identidade diferente da conta de teste esperada.'
  }

  Write-Output 'PASSOU: Firebase aceitou as credenciais.'
  Write-Output 'PASSOU: UID corresponde à conta de teste esperada.'
}
catch {
  Write-Output 'TESTE FALHOU: confira as credenciais, a configuração e a conexão.'
  Write-Output 'Nenhuma sessão administrativa foi criada.'
  exit 1
}
finally {
  $password = $null
  $body = $null
  $result = $null
  $securePassword.Dispose()
}