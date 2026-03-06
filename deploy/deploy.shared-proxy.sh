#!/usr/bin/env bash
# deploy.shared-proxy.sh - deploy for shared reverse-proxy VPS topology.
# Run as deploy user from project directory.
# Usage: ./deploy/deploy.shared-proxy.sh [--skip-pull]

set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.shared-proxy.yml --env-file .env.production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy/logs/deploy_shared_${TIMESTAMP}.log"

NEXTJS_HOST_PORT="${NEXTJS_HOST_PORT:-3100}"
MEDUSA_HOST_PORT="${MEDUSA_HOST_PORT:-9100}"

mkdir -p deploy/logs
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Shared-proxy deploy started at $(date) ==="

if [[ "${1:-}" != "--skip-pull" ]]; then
  echo "--- Pulling latest code..."
  git pull --ff-only
fi

echo "--- Building Docker images..."
$COMPOSE build --no-cache nextjs medusa strapi

echo "--- Starting infrastructure (postgres, redis)..."
$COMPOSE up -d postgres redis

echo "--- Waiting for postgres to be healthy..."
until $COMPOSE exec -T postgres pg_isready -U "${POSTGRES_USER:-mystic}" -q; do
  sleep 2
done

echo "--- Running Medusa database migrations..."
$COMPOSE run --rm medusa sh -c "node .medusa/server/src/index.js --run-migrations 2>&1 || true"

echo "--- Restarting application services..."
$COMPOSE up -d --force-recreate medusa strapi nextjs

echo "--- Waiting for Next.js on localhost:${NEXTJS_HOST_PORT}..."
for i in {1..30}; do
  if curl -sf "http://127.0.0.1:${NEXTJS_HOST_PORT}" > /dev/null 2>&1; then
    echo "--- Next.js is up."
    break
  fi
  sleep 2
done

echo "--- Waiting for Medusa on localhost:${MEDUSA_HOST_PORT}..."
for i in {1..30}; do
  if curl -sf "http://127.0.0.1:${MEDUSA_HOST_PORT}/health" > /dev/null 2>&1; then
    echo "--- Medusa is up."
    break
  fi
  sleep 2
done

echo "--- Pruning unused Docker images..."
docker image prune -f

echo "=== Shared-proxy deploy finished at $(date) ==="
