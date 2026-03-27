# Docker Complete Clean and Rebuild Script
# Run this after starting Docker Desktop

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Docker Complete Clean and Rebuild" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Stopping and removing containers..." -ForegroundColor Yellow
docker compose down -v

Write-Host "`n2. Removing all unused Docker resources..." -ForegroundColor Yellow
docker system prune -a --volumes -f

Write-Host "`n3. Generating Prisma Client locally..." -ForegroundColor Yellow
npx prisma@5.19.1 generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma generate failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n4. Building Docker images (no cache)..." -ForegroundColor Yellow
docker compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n5. Starting containers..." -ForegroundColor Yellow
docker compose up -d

Write-Host "`n6. Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
do {
    Start-Sleep -Seconds 2
    $result = docker compose exec -T postgres pg_isready -U mdijital_prod 2>$null
    $retryCount++
    if ($retryCount -ge $maxRetries) {
        Write-Host "PostgreSQL failed to become ready!" -ForegroundColor Red
        docker compose logs postgres
        exit 1
    }
    Write-Host "Waiting for PostgreSQL... ($retryCount/$maxRetries)" -ForegroundColor Gray
} while ($LASTEXITCODE -ne 0)

Write-Host "PostgreSQL is ready!" -ForegroundColor Green

Write-Host "`n7. Generating Prisma Client in container..." -ForegroundColor Yellow
docker compose exec -T app npx prisma@5.19.1 generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma generate in container failed!" -ForegroundColor Red
    docker compose logs app --tail=50
    exit 1
}

Write-Host "`n8. Pushing database schema..." -ForegroundColor Yellow
docker compose exec -T app npx prisma@5.19.1 db push --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database push failed!" -ForegroundColor Red
    docker compose logs app --tail=50
    exit 1
}

Write-Host "`n9. Container status:" -ForegroundColor Yellow
docker compose ps

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✅ Rebuild completed successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
