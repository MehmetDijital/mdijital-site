# Windows only. On Ubuntu server use reset-db.sh (full reset).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$cf = @("-f", "docker-compose.yml")
if (Test-Path "docker-compose.small.yml") { $cf += "-f", "docker-compose.small.yml" }

Write-Host "Stopping containers and removing ALL volumes (postgres + redis + uploads)..."
& docker compose @cf down -v

Write-Host "Starting containers..."
& docker compose @cf up -d

Write-Host "Waiting for PostgreSQL..."
$max = 30
$n = 0
$user = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "mdijital_prod" }
do {
  Start-Sleep -Seconds 2
  $n++
  & docker compose @cf exec -T postgres pg_isready -U $user 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { break }
  if ($n -ge $max) { Write-Error "PostgreSQL not ready"; exit 1 }
  Write-Host "Waiting for PostgreSQL... ($n/$max)"
} while ($true)
Write-Host "PostgreSQL ready."

Write-Host "Waiting for app container..."
Start-Sleep -Seconds 5

Write-Host "Prisma generate..."
& docker compose @cf exec -T app npx prisma generate

Write-Host "Prisma db push (accept data loss)..."
& docker compose @cf exec -T app npx prisma db push --accept-data-loss

Write-Host "Init admin user from .env..."
try { & docker compose @cf exec -T app npx tsx scripts/init-admin.ts } catch {}

Write-Host "Done. DB is empty and schema + admin are applied."
