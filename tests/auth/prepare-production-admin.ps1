$ErrorActionPreference = 'Stop'
$targetFile = '.private/admin-production.sql'

try {
  git check-ignore --quiet $targetFile

  if ($LASTEXITCODE -ne 0) {
    throw 'A pasta privada nao esta ignorada pelo Git.'
  }

  if (Test-Path -LiteralPath $targetFile) {
    throw 'O arquivo privado ja existe.'
  }

  $emailInput = (
    Read-Host 'Email da sua conta no Firebase de PRODUCAO'
  ).Trim()

  $address = New-Object System.Net.Mail.MailAddress($emailInput)

  if (
    $address.Address -ne $emailInput -or
    $emailInput -match '\s'
  ) {
    throw 'Formato de email invalido.'
  }

  $uidInput = (
    Read-Host 'UID dessa mesma conta no Firebase de PRODUCAO'
  ).Trim()

  if (
    $uidInput.Length -lt 1 -or
    $uidInput.Length -gt 128 -or
    $uidInput -match '\s'
  ) {
    throw 'UID invalido.'
  }

  $usernameInput = (
    Read-Host 'Usuario para entrar no site, por exemplo eduardo'
  ).Trim().ToLowerInvariant()

  if ($usernameInput -cnotmatch '^[a-z0-9._-]{3,40}$') {
    throw 'Use de 3 a 40 letras sem acentos, numeros, ponto, traco ou sublinhado.'
  }

  $escapedEmail = $emailInput.Replace("'", "''")
  $escapedUid = $uidInput.Replace("'", "''")
  $escapedUsername = $usernameInput.Replace("'", "''")
  $administratorId = 'admin-' + [guid]::NewGuid().ToString()

  $sql = @"
INSERT INTO administradores (
  id,
  nome,
  usuario,
  email_firebase,
  firebase_uid,
  ativo
) VALUES (
  '$administratorId',
  'Eduardo',
  '$escapedUsername',
  '$escapedEmail',
  '$escapedUid',
  0
);
"@

  New-Item -ItemType Directory -Path '.private' -Force |
    Out-Null

  Set-Content -LiteralPath $targetFile -Value $sql -Encoding UTF8

  Write-Output 'SQL privado preparado com a conta desativada.'
  Write-Output 'Nenhuma alteracao realizada no banco.'
}
catch {
  Write-Output 'Preparacao nao concluida.'
  Write-Output $_.Exception.Message
}
finally {
  $emailInput = $null
  $uidInput = $null
  $usernameInput = $null
  $escapedEmail = $null
  $escapedUid = $null
  $escapedUsername = $null
  $address = $null
  $sql = $null
}