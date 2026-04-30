param(
  [string]$SdkRoot = 'F:\Android\Sdk',
  [string]$JavaHome = 'F:\Meus Programas\Android Studio\jbr',
  [string]$GradleUserHome = 'F:\Android\Gradle',
  [switch]$DoNotPersist
)

$ErrorActionPreference = 'Stop'

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Add-ProcessPathEntry {
  param([string]$PathEntry)

  if (-not (Test-Path $PathEntry)) {
    return
  }

  $entries = ($env:Path -split ';') | Where-Object { $_ }
  if ($entries -notcontains $PathEntry) {
    $env:Path = "$PathEntry;$env:Path"
  }
}

function Add-UserPathEntry {
  param([string]$PathEntry)

  if (-not (Test-Path $PathEntry)) {
    return
  }

  $currentUserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $entries = ($currentUserPath -split ';') | Where-Object { $_ }

  if ($entries -notcontains $PathEntry) {
    $updatedPath = @($PathEntry) + $entries
    [Environment]::SetEnvironmentVariable('Path', ($updatedPath -join ';'), 'User')
  }
}

function Convert-ToGradlePath {
  param([string]$PathValue)

  return $PathValue.Replace('\', '\\').Replace(':', '\:')
}

$javaExe = Join-Path $JavaHome 'bin\java.exe'
if (-not (Test-Path $javaExe)) {
  throw "JAVA_HOME invalido: '$JavaHome'. Esperado: '$javaExe'."
}

Ensure-Directory -Path $SdkRoot
Ensure-Directory -Path $GradleUserHome

$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:GRADLE_USER_HOME = $GradleUserHome

$cmdlineToolsBin = Join-Path $SdkRoot 'cmdline-tools\latest\bin'
$platformToolsDir = Join-Path $SdkRoot 'platform-tools'

Add-ProcessPathEntry -PathEntry $cmdlineToolsBin
Add-ProcessPathEntry -PathEntry $platformToolsDir

if (-not $DoNotPersist) {
  [Environment]::SetEnvironmentVariable('JAVA_HOME', $JavaHome, 'User')
  [Environment]::SetEnvironmentVariable('ANDROID_HOME', $SdkRoot, 'User')
  [Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $SdkRoot, 'User')
  [Environment]::SetEnvironmentVariable('GRADLE_USER_HOME', $GradleUserHome, 'User')

  Add-UserPathEntry -PathEntry $cmdlineToolsBin
  Add-UserPathEntry -PathEntry $platformToolsDir
}

$frontendRoot = Split-Path $PSScriptRoot -Parent
$localPropertiesPath = Join-Path $frontendRoot 'android\local.properties'
$localPropertiesContent = "sdk.dir=$(Convert-ToGradlePath -PathValue $SdkRoot)"
Set-Content -LiteralPath $localPropertiesPath -Value $localPropertiesContent -Encoding ASCII

Write-Output "JAVA_HOME=$JavaHome"
Write-Output "ANDROID_HOME=$SdkRoot"
Write-Output "ANDROID_SDK_ROOT=$SdkRoot"
Write-Output "GRADLE_USER_HOME=$GradleUserHome"
Write-Output "LOCAL_PROPERTIES=$localPropertiesPath"
