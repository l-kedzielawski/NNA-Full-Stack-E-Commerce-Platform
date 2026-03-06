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

echo "--- Verifying telemetry route via Next.js proxy..."
$COMPOSE exec -T nextjs node -e 'async function main() { const url = "http://localhost:3000/api/medusa/store/traffic/hit"; const payload = { path: "/api/deploy-probe", locale: "en", source: "deploy_probe" }; const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const text = await res.text(); if (res.status !== 202) { throw new Error("Telemetry probe failed (" + res.status + "): " + text); } console.log("--- Telemetry probe OK (" + res.status + ")"); } main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });'

echo "--- Container status"
$COMPOSE ps

echo "--- Pruning unused Docker images..."
docker image prune -f

echo "=== Traefik deploy finished at $(date) ==="
