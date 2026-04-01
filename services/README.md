# Backend Services Bootstrap

This directory hosts local app backends used by the Next.js storefront:

- `services/medusa` - commerce API/admin
- `services/strapi` - content CMS

## 1) Start dependencies first

From repo root:

```bash
docker compose up -d postgres redis
```

Postgres init SQL creates two databases on first boot:

- `mystic_medusa`
- `mystic_strapi`

If you already had a Postgres volume running, reset it once to re-run init scripts:

```bash
docker compose down -v
docker compose up -d postgres redis
```

## 2) Medusa + Strapi are already scaffolded here

This repo now includes starter projects in:

- `services/medusa`
- `services/strapi`

You can run them directly with Docker profile `app`.

## 3) (Optional) Re-initialize Medusa app

From repo root:

```bash
cd services
npx create-medusa-app@latest
```

Use `medusa` as project folder and configure Postgres + Redis.

## 4) (Optional) Re-initialize Strapi app

From repo root:

```bash
cd services
npx create-strapi-app@latest
```

Use `strapi` as project folder and choose Postgres.

## 5) Run full local stack

From repo root:

```bash
docker compose --profile app up -d
```

Then run storefront:

```bash
npm run dev
```

## First-time Medusa DB bootstrap (host mode)

If you run Medusa directly on host, initialize its schema once:

```bash
cd services/medusa
npx medusa db:setup --no-interactive --db mystic_medusa --execute-safe-links
```

## Import storefront products into Medusa

From repo root:

```bash
npm run medusa:import-products
```

The script imports `content/products.json`, creates missing categories, links products to the default sales channel, and prints the publishable API key token for storefront usage.

## Bootstrap checkout infra in Medusa

From repo root:

```bash
npm run medusa:setup-checkout
```

This creates stock location, fulfillment setup, shipping profile, and a standard shipping option so storefront checkout can complete orders.

## Stripe setup (Medusa)

Set in `services/medusa/.env` and restart Medusa:

```bash
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Without Stripe keys, Medusa runs without Stripe provider.

## Email notifications (Medusa)

Order confirmation (customer), internal order alerts, and internal lead alerts are sent through Resend.

Set in `services/medusa/.env` and restart Medusa:

```bash
RESEND_API_KEY=re_xxx
EMAIL_FROM="Example Store <sales@example.com>"
EMAIL_REPLY_TO=sales@example.com
ORDER_NOTIFY_EMAILS=sales@example.com,ops@example.com
LEAD_NOTIFY_EMAILS=sales@example.com,ops@example.com
```

`ORDER_NOTIFY_EMAILS` and `LEAD_NOTIFY_EMAILS` are comma-separated and can be changed anytime in Medusa env.

## Product Content Editor (Medusa Admin)

A custom widget is available on each product page in Medusa Admin (`product.details.after`) to edit storefront content blocks.

File:

- `services/medusa/src/admin/widgets/product-content-editor.tsx`

It updates product metadata keys used by the storefront template:

- `custom_overview`
- `custom_spec_rows`
- `custom_detail_sections`
- `custom_gallery_images`
- `custom_detail_images`
- `custom_youtube_embed_url`
- `custom_disable_origin_story`

Image rules: only local files/URLs are accepted. Upload images in the widget first; then use generated local URLs.

## Lead CRM and Analytics (Medusa Admin)

Quote form submissions from storefront are saved to the custom Medusa lead module.

Admin pages:

- `/a/leads` - full lead inbox with full payload view and status workflow
- `/a/leads-analytics` - lead analytics dashboard (trend, top countries/products, status breakdown)

## Traffic Dashboard in Medusa Admin

Website traffic is available in Medusa at:

- `/a/traffic`

Required Medusa env vars (`services/medusa/.env`):

- `GA4_PROPERTY_ID`
- `GA4_CLIENT_EMAIL`
- `GA4_PRIVATE_KEY` (single line with `\\n` escapes)

The service account must have access to the GA4 property and the Google Analytics Data API must be enabled in Google Cloud.

## Default local URLs

- Next storefront: `http://localhost:3000` (redirects to `/en`)
- Medusa: `http://localhost:9000`
- Strapi admin: `http://localhost:1337/admin`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`
