param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ExpoArgs
)

$ErrorActionPreference = 'Stop'

$bootstrapScript = Join-Path $PSScriptRoot 'bootstrap-android-env.ps1'
& $bootstrapScript -DoNotPersist | Out-Null

$frontendRoot = Split-Path $PSScriptRoot -Parent

Push-Location $frontendRoot
try {
  node .\scripts\patch-expo-cli-node24.js
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao aplicar o patch do Expo CLI. Codigo: $LASTEXITCODE"
  }

  & npx expo run:android @ExpoArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}
finally {
  Pop-Location
}
