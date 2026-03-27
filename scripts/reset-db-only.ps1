# Windows only. On Ubuntu server use reset-db-only.sh (DB-only reset, keeps uploads/redis).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$cf = @("-f", "docker-compose.yml")
if (Test-Path "docker-compose.small.yml") { $cf += "-f", "docker-compose.small.yml" }

Write-Host "Resetting database only (containers and uploads/redis volumes stay)..."
& docker compose @cf exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"$POSTGRES_USER\"; GRANT ALL ON SCHEMA public TO public;"'

Write-Host "Prisma generate..."
& docker compose @cf exec -T app npx prisma generate

Write-Host "Prisma db push (accept data loss)..."
& docker compose @cf exec -T app npx prisma db push --accept-data-loss

Write-Host "Init admin from env..."
& docker compose @cf exec -T app npx tsx scripts/init-admin.ts

Write-Host "Done. Database is empty with fresh schema and admin user."
