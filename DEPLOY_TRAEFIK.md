# VPS Deployment (Traefik)

Use this guide when you run one shared Traefik instance for multiple apps on the same VPS.

## What changes in this mode

- Use `docker-compose.prod.traefik.yml`.
- This stack does not expose host ports for web traffic.
- Traefik discovers routes via Docker labels.
- Services attach to external Docker network `TRAEFIK_PUBLIC_NETWORK`.

## 1) Traefik prerequisites (once per VPS)

- Traefik must run with Docker provider enabled.
- Traefik must be attached to a shared external Docker network.
- Default network name in this repo is `traefik-public`.

Create network once if needed:

```bash
docker network create traefik-public
```

## 2) Prepare production env

```bash
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

Set all `CHANGE_ME` values. For Traefik mode, confirm:

```bash
TRAEFIK_PUBLIC_NETWORK=traefik-public
TRAEFIK_CERTRESOLVER=letsencrypt
```

## 3) Migrate local production data to VPS

Create dumps on your local source:

```bash
docker exec mystic-postgres pg_dump -U mystic -d mystic_medusa -Fc > mystic_medusa.dump
docker exec mystic-postgres pg_dump -U mystic -d mystic_strapi -Fc > mystic_strapi.dump
```

Copy to VPS:

```bash
scp mystic_medusa.dump mystic_strapi.dump user@YOUR_VPS_IP:/opt/your-app/
```

Start infra and restore on VPS:

```bash
docker compose -f docker-compose.prod.traefik.yml --env-file .env.production up -d postgres redis
docker compose -f docker-compose.prod.traefik.yml --env-file .env.production exec -T postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d mystic_medusa --clean --if-exists' < mystic_medusa.dump
docker compose -f docker-compose.prod.traefik.yml --env-file .env.production exec -T postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d mystic_strapi --clean --if-exists' < mystic_strapi.dump
```

## 4) Deploy app services

```bash
./deploy/deploy.traefik.sh --skip-pull
```

For next deploys:

```bash
./deploy/deploy.traefik.sh
```

## 5) DNS (CyberFolks)

Point these A records to your VPS IP:

- `@`
- `www`
- `api`
- `admin`

Traefik routes from labels in `docker-compose.prod.traefik.yml` and derive domains from `DOMAIN` in `.env.production`:

- `${DOMAIN}`, `www.${DOMAIN}` -> nextjs
- `api.${DOMAIN}` -> medusa
- `admin.${DOMAIN}` -> strapi

## 6) Smoke checks

```bash
curl -I https://example.com
curl -I https://api.example.com/health
curl -I https://admin.example.com/admin
```
