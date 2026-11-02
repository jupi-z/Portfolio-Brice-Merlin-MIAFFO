param([Parameter(Mandatory=$true)][string]$InputFile, [string]$DatabaseUser = "brice_cms", [string]$DatabaseName = "brice_portfolio")
$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath $InputFile)) { throw "Backup not found: $InputFile" }
Get-Content -LiteralPath $InputFile -Encoding Byte | docker compose -f cms/docker-compose.yml exec -T db pg_restore -U $DatabaseUser -d $DatabaseName --clean --if-exists
Write-Output "Restore completed from $InputFile"
