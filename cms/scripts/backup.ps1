param([string]$Output = "./backups", [string]$DatabaseUser = "brice_cms", [string]$DatabaseName = "brice_portfolio")
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $Output | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$composeArgs = @('--env-file', (Join-Path $repoRoot 'cms/.env'), '-f', (Join-Path $repoRoot 'cms/docker-compose.yml'))
$target = Join-Path $Output "brice-portfolio-$stamp.dump"
docker compose @composeArgs exec -T db pg_dump -U $DatabaseUser -d $DatabaseName -Fc > $target
Write-Output "Backup written to $Output/brice-portfolio-$stamp.dump"
