#!/usr/bin/env bash
# deploy.sh – zero-downtime deploy for Natural Mystic Aroma on VPS
# Run as the deploy user (not root) from the project directory.
# Usage: ./deploy/deploy.sh [--skip-pull]

set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy/logs/deploy_${TIMESTAMP}.log"

mkdir -p deploy/logs
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Deploy started at $(date) ==="

# ── 1. Pull latest code ─────────────────────────────────────────────────────
if [[ "${1:-}" != "--skip-pull" ]]; then
  echo "--- Pulling latest code..."
  git pull --ff-only
fi

# ── 2. Build images ──────────────────────────────────────────────────────────
echo "--- Building Docker images..."
$COMPOSE build --no-cache nextjs medusa strapi

# ── 3. Start / restart infrastructure first ──────────────────────────────────
echo "--- Starting infrastructure (postgres, redis)..."
$COMPOSE up -d postgres redis
echo "--- Waiting for postgres to be healthy..."
until $COMPOSE exec -T postgres pg_isready -U "${POSTGRES_USER:-mystic}" -q; do
  sleep 2
done

# ── 4. Run Medusa migrations ─────────────────────────────────────────────────
echo "--- Running Medusa database migrations..."
$COMPOSE run --rm medusa sh -c "node .medusa/server/src/index.js --run-migrations 2>&1 || true"

# ── 5. Restart application services ─────────────────────────────────────────
echo "--- Restarting application services..."
$COMPOSE up -d --force-recreate medusa strapi nextjs nginx certbot

# ── 6. Health check ──────────────────────────────────────────────────────────
echo "--- Waiting for Next.js to respond..."
for i in {1..30}; do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1 || \
     curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "--- Next.js is up."
    break
  fi
  sleep 2
done

echo "--- Waiting for Medusa to respond..."
for i in {1..30}; do
  if curl -sf http://localhost:9000/health > /dev/null 2>&1; then
    echo "--- Medusa is up."
    break
  fi
  sleep 2
done

echo "--- Verifying telemetry route via Next.js proxy..."
$COMPOSE exec -T nextjs node -e 'async function main() { const url = "http://localhost:3000/api/medusa/store/traffic/hit"; const payload = { path: "/api/deploy-probe", locale: "en", source: "deploy_probe" }; const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const text = await res.text(); if (res.status !== 202) { throw new Error("Telemetry probe failed (" + res.status + "): " + text); } console.log("--- Telemetry probe OK (" + res.status + ")"); } main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });'

# ── 7. Clean up old images ───────────────────────────────────────────────────
echo "--- Pruning unused Docker images..."
docker image prune -f

echo "=== Deploy finished at $(date) ==="
