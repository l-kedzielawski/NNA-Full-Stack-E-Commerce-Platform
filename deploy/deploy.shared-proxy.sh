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
$COMPOSE run --rm medusa sh -c "node .medusa/server/src/index.js --run-migrations 2>&1"

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

echo "--- Verifying telemetry route via Next.js proxy..."
$COMPOSE exec -T nextjs node -e 'async function main() { const url = "http://localhost:3000/api/medusa/store/traffic/hit"; const payload = { path: "/deploy-probe", locale: "en", source: "deploy_probe" }; const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const body = await res.json().catch(() => null); if (res.status !== 202 || !body || body.accepted !== true) { throw new Error("Telemetry probe failed (" + res.status + "): " + JSON.stringify(body)); } console.log("--- Telemetry probe OK (accepted=true)"); } main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });'

echo "--- Pruning unused Docker images..."
docker image prune -f

echo "=== Shared-proxy deploy finished at $(date) ==="
