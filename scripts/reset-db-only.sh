#!/usr/bin/env bash
# Ubuntu server: run this script for DB-only reset (keeps containers + uploads + redis).
# Manual commands (on server):
#   docker compose -f docker-compose.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"$POSTGRES_USER\"; GRANT ALL ON SCHEMA public TO public;"'
#   docker compose -f docker-compose.yml exec -T app npx prisma generate
#   docker compose -f docker-compose.yml exec -T app npx prisma db push --accept-data-loss
#   docker compose -f docker-compose.yml exec -T app npx tsx scripts/init-admin.ts
set -e
cd "$(dirname "$0")/.."
COMPOSE_FILES="-f docker-compose.yml"
[ -f docker-compose.small.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.small.yml"

echo "Resetting database only (containers and uploads/redis volumes stay)..."
docker compose $COMPOSE_FILES exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"$POSTGRES_USER\"; GRANT ALL ON SCHEMA public TO public;"'

echo "Prisma generate..."
docker compose $COMPOSE_FILES exec -T app npx prisma generate

echo "Prisma db push (accept data loss)..."
docker compose $COMPOSE_FILES exec -T app npx prisma db push --accept-data-loss

echo "Init admin from env..."
docker compose $COMPOSE_FILES exec -T app npx tsx scripts/init-admin.ts

echo "Done. Database is empty with fresh schema and admin user."
