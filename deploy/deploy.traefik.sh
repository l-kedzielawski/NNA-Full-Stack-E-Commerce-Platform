#!/usr/bin/env bash
# deploy.traefik.sh - deploy for shared Traefik topology.
# Run as deploy user from project directory.
# Usage: ./deploy/deploy.traefik.sh [--skip-pull]

set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.traefik.yml --env-file .env.production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy/logs/deploy_traefik_${TIMESTAMP}.log"

mkdir -p deploy/logs
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Traefik deploy started at $(date) ==="

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

echo "--- Container status"
$COMPOSE ps

echo "--- Pruning unused Docker images..."
docker image prune -f

echo "=== Traefik deploy finished at $(date) ==="
