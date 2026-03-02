# VPS Deployment Guide – Natural Mystic Aroma

For multi-app VPS setups with one shared edge proxy, use `DEPLOY_SHARED_PROXY.md` (recommended).
For Traefik-based shared edge proxy setups, use `DEPLOY_TRAEFIK.md`.

Stack: **Next.js + Medusa + Strapi + PostgreSQL + Redis + Nginx + Let's Encrypt**  
Domain registrar / DNS: **CyberFolks**  
SSL: **Let's Encrypt (Certbot)**

---

## Architecture

```
Internet
   │
   ▼
Nginx (ports 80 + 443) ──────── internal Docker network ──────┐
   │                                                           │
   ├── themysticaroma.com     → nextjs:3000 (Next.js)        │
   ├── api.themysticaroma.com → medusa:9000 (Medusa API)     │
   └── admin.themysticaroma.com → strapi:1337 (Strapi CMS)  │
                                                               │
                              postgres:5432  redis:6379  ──────┘
```

All application ports are internal-only. The only public ports are 80 and 443 on Nginx.

---

## 1 – DNS (CyberFolks panel)

Add **A records** pointing to your VPS IP for all four subdomains:

| Name                          | Type | Value           |
|-------------------------------|------|-----------------|
| `@` (themysticaroma.com)      | A    | `<VPS_IP>`      |
| `www`                         | A    | `<VPS_IP>`      |
| `api`                         | A    | `<VPS_IP>`      |
| `admin`                       | A    | `<VPS_IP>`      |

Wait for DNS to propagate (usually 5-15 min with CyberFolks, up to 24 h globally).  
Verify with: `dig +short themysticaroma.com`

---

## 2 – VPS initial setup

```bash
# Update system
apt update && apt upgrade -y

# Install Docker (Debian/Ubuntu)
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER   # add your deploy user to docker group
newgrp docker

# Verify
docker --version
docker compose version     # must be v2 (plugin, not docker-compose v1)
```

---

## 3 – Clone the repository

```bash
cd /opt
git clone https://github.com/YOUR_ORG/naturalmysticaroma.git
cd naturalmysticaroma
```

---

## 4 – Create the production environment file

```bash
cp .env.production.example .env.production
nano .env.production       # fill in every CHANGE_ME value
```

Keep `QUOTE_LOCAL_BACKUP_ENABLED=false` in production so quote data is stored in Medusa only.

Generate secrets:
```bash
# Single 48-byte secret
openssl rand -base64 48

# Strapi APP_KEYS (4 comma-separated)
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

Lock down permissions:
```bash
chmod 600 .env.production
```

---

## 5 – Obtain SSL certificates (first time only)

Nginx needs to be running in HTTP-only mode first so Certbot can complete the ACME challenge.

**Step 5a – start Nginx with a temporary HTTP-only config:**

```bash
# Temporarily rename the HTTPS vhost so Nginx starts on port 80 only
docker compose -f docker-compose.prod.yml --env-file .env.production up -d nginx

# Confirm port 80 is responding
curl -I http://themysticaroma.com
```

**Step 5b – run Certbot for all four names:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d themysticaroma.com \
  -d www.themysticaroma.com \
  -d api.themysticaroma.com \
  -d admin.themysticaroma.com \
  --email YOUR_EMAIL@example.com \
  --agree-tos --non-interactive
```

Certbot will write certs to the `letsencrypt_certs` Docker volume (mapped to `/etc/letsencrypt` inside the container).

**Step 5c – download the recommended SSL options file (one-time):**

```bash
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
  > /tmp/options-ssl-nginx.conf

curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
  > /tmp/ssl-dhparams.pem

# Copy into the named volume via a helper container
docker run --rm \
  -v naturalmysticaroma_letsencrypt_certs:/etc/letsencrypt \
  -v /tmp/options-ssl-nginx.conf:/src/options-ssl-nginx.conf:ro \
  -v /tmp/ssl-dhparams.pem:/src/ssl-dhparams.pem:ro \
  alpine sh -c "cp /src/options-ssl-nginx.conf /etc/letsencrypt/ && cp /src/ssl-dhparams.pem /etc/letsencrypt/"
```

---

## 6 – First full stack start

```bash
./deploy/deploy.sh --skip-pull
```

This will:
1. Build all Docker images (Next.js, Medusa, Strapi)
2. Start postgres + redis
3. Run Medusa database migrations
4. Start all application services + Nginx
5. Perform basic health checks

Tail the logs to verify:
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## 7 – Medusa initial admin user

After Medusa starts, create the first admin user:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec medusa sh -c "node .medusa/server/src/index.js --create-admin"
```

Or use the Medusa invite flow at `https://api.themysticaroma.com/app`.

---

## 8 – Certificate auto-renewal

Certbot in the `certbot` service runs `certbot renew` every 12 hours automatically.  
After renewal, Nginx needs to reload its config to pick up new certs:

```bash
# Add to crontab (as root or via systemd timer)
0 3 * * * docker exec mystic-nginx nginx -s reload
```

---

## 9 – Subsequent deploys

```bash
cd /opt/naturalmysticaroma
./deploy/deploy.sh
```

Or with GitHub Actions / webhook: call `./deploy/deploy.sh` via SSH.

---

## 10 – Hosting a second app (your CRM) on the same VPS

Add the CRM as a new service in a **separate** `docker-compose.crm.yml` in `/opt/your-crm/`.  
Share the same `internal` Docker network by referencing it as external:

**In `/opt/your-crm/docker-compose.crm.yml`:**
```yaml
networks:
  mystic_internal:
    external: true
    name: naturalmysticaroma_internal
```

Then add a new `server {}` block in `deploy/nginx/conf.d/crm.conf`:
```nginx
server {
    listen 443 ssl;
    server_name crm.themysticaroma.com;
    # ... SSL certs (request them with Certbot -d crm.themysticaroma.com)
    location / {
        proxy_pass http://crm-app:PORT;
    }
}
```

Reload Nginx: `docker exec mystic-nginx nginx -s reload`

---

## Useful commands

```bash
# View all container status
docker compose -f docker-compose.prod.yml ps

# Follow logs for one service
docker compose -f docker-compose.prod.yml logs -f medusa

# Open psql in running postgres container
docker exec -it mystic-postgres psql -U mystic -d mystic_medusa

# Restart a single service without full deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate nextjs

# Backup postgres (run daily via cron)
docker exec mystic-postgres pg_dumpall -U mystic | gzip > /backups/postgres_$(date +%Y%m%d).sql.gz
```

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Nginx 502 Bad Gateway | `docker compose logs nextjs` — is the container up? |
| SSL cert not found | Did Step 5 complete? Check volume: `docker exec mystic-nginx ls /etc/letsencrypt/live/` |
| Medusa stuck on startup | `docker compose logs medusa` — likely a migration or DB connection issue |
| Strapi won't start | Check `STRAPI_APP_KEYS` — must be 4 comma-separated values, not empty |
| Port 80/443 already in use | Another process (e.g. Apache) is using the port: `ss -tlnp | grep -E ':80|:443'` |
