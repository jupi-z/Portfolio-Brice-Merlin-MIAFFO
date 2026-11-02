param([Parameter(Mandatory=$true)][string]$InputFile, [string]$DatabaseUser = "brice_cms", [string]$DatabaseName = "brice_portfolio")
$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath $InputFile)) { throw "Backup not found: $InputFile" }
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$composeArgs = @('--env-file', (Join-Path $repoRoot 'cms/.env'), '-f', (Join-Path $repoRoot 'cms/docker-compose.yml'))
Get-Content -LiteralPath $InputFile -AsByteStream | docker compose @composeArgs exec -T db pg_restore -U $DatabaseUser -d $DatabaseName --clean --if-exists
Write-Output "Restore completed from $InputFile"
