#!/bin/bash

set -e

echo "=========================================="
echo "Production Rebuild Script"
echo "=========================================="
echo ""

echo "⚠️  WARNING: This will delete all Docker containers, volumes, and images!"
echo "⚠️  This will DELETE ALL DATABASE DATA!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Stopping all containers..."
docker compose down -v

echo ""
echo "Removing all Docker volumes (database data)..."
docker volume ls -q | grep mdijital || true
docker volume prune -f

echo ""
echo "Removing old images..."
docker images | grep mdijital | awk '{print $3}' | xargs -r docker rmi -f || true

echo ""
echo "Cleaning Docker system..."
docker system prune -af --volumes

echo ""
echo "Verifying .env file exists..."
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!"
  exit 1
fi

echo ""
echo "Setting NODE_ENV=production..."
export NODE_ENV=production

echo ""
echo "Building fresh containers (no cache)..."
docker compose build --no-cache

echo ""
echo "Starting containers..."
docker compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 30

echo ""
echo "Checking PostgreSQL is ready..."
MAX_RETRIES=60
RETRY_COUNT=0
until docker compose exec -T postgres pg_isready -U ${POSTGRES_USER:-mdijital_prod} 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Error: PostgreSQL failed to become ready"
    docker compose logs postgres
    exit 1
  fi
  echo "Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

echo ""
echo "Checking Redis is ready..."
if ! docker compose exec -T redis redis-cli ${REDIS_PASSWORD:+-a "$REDIS_PASSWORD"} ping 2>/dev/null | grep -q PONG; then
  echo "⚠️  Warning: Redis health check failed, but continuing..."
else
  echo "✅ Redis is ready!"
fi

echo ""
echo "Running database migrations (fresh database)..."
docker compose exec -T app npx prisma@5.19.1 db push

echo ""
echo "Waiting for application to be ready..."
sleep 15

echo ""
echo "Checking application health..."
MAX_HEALTH_RETRIES=20
HEALTH_RETRY=0
until curl -f http://localhost:3000/api/health 2>/dev/null; do
  HEALTH_RETRY=$((HEALTH_RETRY + 1))
  if [ $HEALTH_RETRY -ge $MAX_HEALTH_RETRIES ]; then
    echo "❌ Error: Application health check failed"
    docker compose logs app --tail=50
    exit 1
  fi
  echo "Waiting for application... ($HEALTH_RETRY/$MAX_HEALTH_RETRIES)"
  sleep 3
done
echo "✅ Application is healthy!"

echo ""
echo "=========================================="
echo "✅ Production rebuild completed successfully!"
echo "=========================================="
echo ""
echo "Container status:"
docker compose ps
echo ""
echo "Database is empty and ready for use."
echo "Application is running in PRODUCTION mode."
