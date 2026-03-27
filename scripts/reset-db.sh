#!/usr/bin/env bash
# Ubuntu server: full reset, removes ALL volumes (postgres, redis, uploads). For DB-only use reset-db-only.sh
set -e
cd "$(dirname "$0")/.."
COMPOSE_FILES="-f docker-compose.yml"
[ -f docker-compose.small.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.small.yml"

echo "Stopping containers and removing ALL volumes (postgres + redis + uploads)..."
docker compose $COMPOSE_FILES down -v

echo "Starting containers..."
docker compose $COMPOSE_FILES up -d

echo "Waiting for PostgreSQL..."
MAX=30
n=0
until docker compose $COMPOSE_FILES exec -T postgres pg_isready -U "${POSTGRES_USER:-mdijital_prod}" 2>/dev/null; do
  n=$((n + 1))
  [ $n -ge $MAX ] && { echo "PostgreSQL not ready"; exit 1; }
  echo "Waiting for PostgreSQL... ($n/$MAX)"
  sleep 2
done
echo "PostgreSQL ready."

echo "Waiting for app container..."
sleep 5

echo "Prisma generate..."
docker compose $COMPOSE_FILES exec -T app npx prisma generate

echo "Prisma db push (accept data loss)..."
docker compose $COMPOSE_FILES exec -T app npx prisma db push --accept-data-loss

echo "Init admin user from .env..."
docker compose $COMPOSE_FILES exec -T app npx tsx scripts/init-admin.ts || true

echo "Done. DB is empty and schema + admin are applied."
