# VPS Deployment (Shared Reverse Proxy)

Use this guide when your VPS already has one shared edge proxy (Nginx/Caddy/Traefik)
for multiple apps. In this mode, this stack does not run its own nginx/certbot.

## What changes in this mode

- Use `docker-compose.prod.shared-proxy.yml`.
- App services bind only to localhost on the VPS:
  - Next.js: `127.0.0.1:3100`
  - Medusa API: `127.0.0.1:9100`
  - Strapi admin: `127.0.0.1:1437`
- Shared edge proxy handles TLS and domain routing.

## 1) Prepare production env

```bash
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

Set strong values for all `CHANGE_ME` entries.

Optional port overrides (if 3100/9100/1437 conflict):

```bash
NEXTJS_HOST_PORT=3100
MEDUSA_HOST_PORT=9100
STRAPI_HOST_PORT=1437
```

## 2) Migrate production data from local to VPS

Create SQL dumps from local source:

```bash
# local machine
docker exec mystic-postgres pg_dump -U mystic -d mystic_medusa -Fc > mystic_medusa.dump
docker exec mystic-postgres pg_dump -U mystic -d mystic_strapi -Fc > mystic_strapi.dump
```

Copy dumps to VPS:

```bash
scp mystic_medusa.dump mystic_strapi.dump user@YOUR_VPS_IP:/opt/your-app/
```

On VPS, start infra first and restore:

```bash
docker compose -f docker-compose.prod.shared-proxy.yml --env-file .env.production up -d postgres redis
docker compose -f docker-compose.prod.shared-proxy.yml --env-file .env.production exec -T postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d mystic_medusa --clean --if-exists' < mystic_medusa.dump
docker compose -f docker-compose.prod.shared-proxy.yml --env-file .env.production exec -T postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d mystic_strapi --clean --if-exists' < mystic_strapi.dump
```

## 3) Deploy app services

```bash
./deploy/deploy.shared-proxy.sh --skip-pull
```

For subsequent updates:

```bash
./deploy/deploy.shared-proxy.sh
```

## 4) Configure shared nginx

Use `deploy/nginx/shared-proxy/site.conf.example` as your vhost template
in the shared proxy host. It routes:

- `example.com` -> `127.0.0.1:3100`
- `api.example.com` -> `127.0.0.1:9100`
- `admin.example.com` -> `127.0.0.1:1437`

Then reload your shared proxy.

## 5) DNS at CyberFolks

Point these A records to the VPS IP:

- `@`
- `www`
- `api`
- `admin`

## 6) Smoke checks

```bash
curl -I https://example.com
curl -I https://api.example.com/health
curl -I https://admin.example.com/admin
```

If these pass, you are live behind the shared proxy topology.
