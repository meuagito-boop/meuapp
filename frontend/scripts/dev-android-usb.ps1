param(
  [switch]$Clear
)

$ErrorActionPreference = 'Stop'

$bootstrapScript = Join-Path $PSScriptRoot 'bootstrap-android-env.ps1'
if (Test-Path $bootstrapScript) {
  & $bootstrapScript -DoNotPersist | Out-Null
}

function Resolve-AdbPath {
  $sdkCandidates = @()

  if ($env:ANDROID_SDK_ROOT) {
    $sdkCandidates += (Join-Path $env:ANDROID_SDK_ROOT 'platform-tools\adb.exe')
  }

  if ($env:ANDROID_HOME) {
    $sdkCandidates += (Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe')
  }

  $adbCommand = Get-Command adb -ErrorAction SilentlyContinue
  if ($adbCommand) {
    return $adbCommand.Source
  }

  $sdkCandidates += (Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe')

  foreach ($candidate in $sdkCandidates | Select-Object -Unique) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  throw 'ADB nao encontrado. Instale Android SDK Platform-Tools, preferencialmente em um caminho configurado por ANDROID_SDK_ROOT ou ANDROID_HOME, ou adicione adb ao PATH.'
}

$adb = Resolve-AdbPath

& $adb start-server | Out-Null

$devicesRaw = & $adb devices
$connectedDevices = $devicesRaw | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $connectedDevices) {
  throw 'Nenhum dispositivo Android autorizado encontrado via USB.'
}

# Expo/Metro and backend ports for localhost access on the physical device
& $adb reverse tcp:8081 tcp:8081 | Out-Null
& $adb reverse tcp:3001 tcp:3001 | Out-Null

if ($Clear) {
  npm run start -- --clear
} else {
  npm run start
}
