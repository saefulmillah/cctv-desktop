$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-IsccPath {
  $paths = @(
    (Get-Command iscc.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  $pathList = @($paths)
  if ($pathList.Count -gt 0) {
    return $pathList[0]
  }

  throw "ISCC.exe not found. Install Inno Setup 6 first: https://jrsoftware.org/isdl.php"
}

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

Write-Host "Packaging Electron app..." -ForegroundColor Cyan
npm run package

$version = (Get-Content "package.json" -Raw | ConvertFrom-Json).version
$sourceDir = Get-ChildItem -Path "out" -Directory |
  Where-Object { $_.Name -like "*-win32-x64" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $sourceDir) {
  throw "Packaged app folder not found in 'out/*-win32-x64'."
}

$outputDir = Join-Path $rootDir "out\installer-wizard"
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$isccPath = Get-IsccPath
$issPath = Join-Path $rootDir "installer\windows\cctv-desktop.iss"

Write-Host "Compiling Inno Setup installer..." -ForegroundColor Cyan
& $isccPath `
  "/DAppVersion=$version" `
  "/DAppSourceDir=$($sourceDir.FullName)" `
  "/DOutputDir=$outputDir" `
  $issPath

if ($LASTEXITCODE -ne 0) {
  throw "Inno Setup compilation failed with exit code $LASTEXITCODE."
}

Write-Host "Wizard installer generated in: $outputDir" -ForegroundColor Green
