param([string]$Output = "./backups/qa-verify")

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$composeArgs = @('--env-file', (Join-Path $repoRoot 'cms/.env'), '-f', (Join-Path $repoRoot 'cms/docker-compose.yml'))
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Output))
$dump = Join-Path $backupDir "brice-portfolio-$stamp.dump"
$restoreDb = "brice_portfolio_restore_qa"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
try {
  docker compose @composeArgs exec -T db pg_dump -U brice_cms -d brice_portfolio -Fc > $dump
  docker compose @composeArgs exec -T db dropdb -U brice_cms --if-exists $restoreDb
  docker compose @composeArgs exec -T db createdb -U brice_cms $restoreDb
  Get-Content -LiteralPath $dump -AsByteStream | docker compose @composeArgs exec -T db pg_restore -U brice_cms -d $restoreDb --no-owner --exit-on-error
  $count = (docker compose @composeArgs exec -T db psql -U brice_cms -d $restoreDb -Atc 'select count(*) from publications;').Trim()
  if ([int]$count -lt 0) { throw "La restauration a renvoyé un nombre de publications invalide." }
  Write-Output "Backup et restauration vérifiés : $count publication(s) restaurée(s) dans une base temporaire."
} finally {
  docker compose @composeArgs exec -T db dropdb -U brice_cms --if-exists $restoreDb | Out-Null
  if (Test-Path -LiteralPath $dump) { Remove-Item -LiteralPath $dump -Force }
  if ((Test-Path -LiteralPath $backupDir -PathType Container) -and -not (Get-ChildItem -LiteralPath $backupDir)) { Remove-Item -LiteralPath $backupDir -Force }
}
