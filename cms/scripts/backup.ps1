param([string]$Output = "./backups", [string]$DatabaseUser = "brice_cms", [string]$DatabaseName = "brice_portfolio")
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $Output | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
docker compose -f cms/docker-compose.yml exec -T db pg_dump -U $DatabaseUser -d $DatabaseName -Fc | Set-Content -Encoding Byte (Join-Path $Output "brice-portfolio-$stamp.dump")
Write-Output "Backup written to $Output/brice-portfolio-$stamp.dump"
