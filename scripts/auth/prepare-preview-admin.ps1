$targetFile = '.private/admin-preview.sql'

try {
  git check-ignore --quiet $targetFile

  if ($LASTEXITCODE -ne 0) {
    throw 'A pasta privada nao esta ignorada pelo Git.'
  }

  if (Test-Path -LiteralPath $targetFile) {
    throw 'O arquivo privado ja existe. Nenhuma alteracao realizada.'
  }

  $emailInput = (Read-Host 'Email da conta de teste no Firebase').Trim()
  $address = New-Object System.Net.Mail.MailAddress($emailInput)

  if (
    $address.Address -ne $emailInput -or
    $emailInput -match '\s'
  ) {
    throw 'Formato de email invalido.'
  }

  $escapedEmail = $emailInput.Replace("'", "''")

  $sql = @"
INSERT INTO administradores (
  id,
  nome,
  usuario,
  email_firebase,
  firebase_uid,
  ativo
) VALUES (
  'admin-teste-eduardo',
  'Eduardo - teste',
  'teste.eduardo',
  '$escapedEmail',
  'LDIBrKyE2EU7INR8ya6wL1Leo1m1',
  0
);
"@

  New-Item -ItemType Directory -Path '.private' -Force | Out-Null
  Set-Content -LiteralPath $targetFile -Value $sql -Encoding UTF8

  Write-Output 'SQL privado preparado. Conta definida como desativada.'
  Write-Output 'Nenhuma alteracao realizada no banco.'
}
catch {
  Write-Output 'Preparacao nao concluida. Confira o email e o arquivo de destino.'
}
finally {
  $emailInput = $null
  $escapedEmail = $null
  $address = $null
  $sql = $null
}