$emailInput = Read-Host 'Email interno da conta de teste'
$securePassword = Read-Host 'Senha da conta de teste' -AsSecureString

try {
  $plainPassword = (
    New-Object System.Net.NetworkCredential('', $securePassword)
  ).Password

  $payload = @{
    email = $emailInput
    password = $plainPassword
  } | ConvertTo-Json -Compress

  $payload |
    node --env-file=.dev.vars tests/auth/firebase-auth-live.mjs
}
finally {
  $plainPassword = $null
  $payload = $null
  $emailInput = $null

  if ($null -ne $securePassword) {
    $securePassword.Dispose()
  }
}