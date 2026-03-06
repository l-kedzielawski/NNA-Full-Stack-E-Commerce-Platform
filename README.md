# The Mystic Aroma Frontend

Next.js frontend for Natural Mystic Aroma (B2B Madagascar vanilla and specialty ingredients).

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Locale-prefixed routing is enabled. Requests are redirected to `/en/...` by proxy.

## Build

```bash
npm run lint
npm run build
```

## Deployment Guides

- Standard single-stack VPS deployment: `DEPLOY.md`
- Shared reverse-proxy VPS deployment (recommended for multiple apps): `DEPLOY_SHARED_PROXY.md`
- Shared Traefik VPS deployment: `DEPLOY_TRAEFIK.md`

## Local Backend Stack

Bring up database/cache dependencies:

```bash
npm run stack:deps:up
```

Make sure Docker Desktop/daemon is running before these commands.

With scaffolded `services/medusa` and `services/strapi`, run full stack:

```bash
npm run stack:up
```

Or run backends directly on host:

```bash
npm run medusa:dev
npm run strapi:dev
```

Import storefront products into Medusa:

```bash
npm run medusa:import-products
```

The command prints a publishable API key token you can use in `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

Set custom product content blocks in Medusa metadata:

```bash
npm run medusa:set-product-content
```

Configure Starter Pack offer (sets `Essence of Madagascar` to EUR 40 and marks both sample sets as free-shipping eligible metadata):

```bash
npm run medusa:setup-starter-pack
```

Supported metadata keys read by product page renderer:

- `custom_overview` (string[])
- `custom_gallery_images` (string[])
- `custom_detail_images` (string[])
- `custom_spec_rows` (`[{ label, value }]`)
- `custom_detail_sections` (`[{ title, paragraphs?, bullets? }]`)
- `custom_youtube_embed_url` (string)
- `custom_disable_origin_story` (boolean)

Bootstrap shipping/checkout infrastructure in Medusa:

```bash
npm run medusa:setup-checkout
```

This setup creates both standard shipping options and `Free Shipping - Starter Packs - <Region>` options. The storefront checkout auto-selects free shipping only when the cart contains only the starter packs (`Essence of Madagascar` and `Taste of Madagascar`).

Then switch frontend product source in `.env.local`:

```bash
PRODUCTS_SOURCE=medusa
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_replace_me
NEXT_PUBLIC_MEDUSA_REGION_ID=reg_replace_me
NEXT_PUBLIC_MEDUSA_REGION_ID_EUR=reg_replace_eur
NEXT_PUBLIC_MEDUSA_REGION_ID_PLN=reg_replace_pln
MEDUSA_REGION_ID_EUR=reg_replace_eur
MEDUSA_REGION_ID_PLN=reg_replace_pln
```

Regional pricing behavior:

- `/pl` defaults to PLN region pricing (Poland)
- other locales default to EUR region pricing

## Cart and Checkout

- Cart route: `/cart`
- Checkout route: `/checkout`

Checkout currently expects a Stripe payment provider configured in Medusa. If no Stripe provider exists for the selected region, checkout will stop with a clear setup message.

To enable Stripe provider in Medusa, set `STRIPE_API_KEY` (and optionally `STRIPE_WEBHOOK_SECRET`) in `services/medusa/.env`, then restart Medusa.

For payment capture behavior:

- `STRIPE_CAPTURE=false` (default) -> authorize now, capture later from Medusa admin.
- `STRIPE_CAPTURE=true` -> automatic capture immediately after payment authorization.

Order and lead emails are sent by Medusa via Resend. Set in `services/medusa/.env`:

- `RESEND_API_KEY`
- `EMAIL_FROM` (for example `The Mystic Aroma <orders@themysticaroma.com>`)
- `EMAIL_REPLY_TO`
- `ORDER_NOTIFY_EMAILS` (comma-separated internal recipients)
- `LEAD_NOTIFY_EMAILS` (comma-separated internal recipients)

If `stack:up` shows Medusa/Strapi exiting with `ENOENT /srv/.../package.json`, Docker Desktop likely does not have access to your `/var/www/...` bind-mount path. In that case, keep Postgres/Redis in Docker and run Medusa/Strapi on host using the two commands above.

Bootstrap instructions are in `services/README.md`.

## WooCommerce Product CSV Import

Convert the latest Woo export (`wc-product-export-*.csv`) into the JSON shape used by `lib/products.ts`:

```bash
npm run import:woo-products
```

Default output file:

- `content/products.from-csv.json`

Write directly into the live product file:

```bash
npm run import:woo-products:apply
```

Use explicit input/output paths:

```bash
npm run import:woo-products -- --input wc-product-export-27-2-2026-1772229882291.csv --output content/products.json
```

## Content Data Sources

The app reads product and journal data from JSON files (`products.json`, `posts.json`).

By default, it checks these locations in order:

1. `CONTENT_DIR` (if set)
2. `./content`
3. `../content`
4. `../themysticaroma/react-migration/content`

Set a custom source with:

```bash
CONTENT_DIR=/absolute/path/to/content
```

You can point product loading to a different file name inside the content directory:

```bash
PRODUCTS_FILE=products.from-csv.json
```

To switch storefront products to Medusa Store API:

```bash
PRODUCTS_SOURCE=medusa
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_replace_me
```

When `PRODUCTS_SOURCE` is not set, the app uses file data.

## Quote Request API

`POST /api/quote` now includes:

- Required field validation
- Honeypot spam protection
- IP-based rate limiting
- Primary lead sink to Medusa (`POST /store/leads`)
- Optional local persistence (`data/quote-requests.jsonl`) controlled by `QUOTE_LOCAL_BACKUP_ENABLED`

By default, local backup is enabled in development and disabled in production.

Leads are managed in Medusa Admin at `/a/leads`.
Lead analytics is available at `/a/leads-analytics`.

Leads admin now supports:

- Manual lead creation (for phone/email/WhatsApp inquiries)
- Custom Stripe checkout links per lead with custom amount and currency
- Special-order Stripe links from catalog variants with custom per-item pricing
- Payment status refresh directly from Stripe for generated links

Custom payment links require `STRIPE_API_KEY` in `services/medusa/.env` and use `NEXT_PUBLIC_SITE_URL` for success/cancel redirects.

Order details in Medusa Admin now include a widget to create a Stripe Checkout link with full order line-item breakdown (product names + amounts), useful when sharing manual payment links for existing orders.

## Analytics (GA4)

Set your GA4 Measurement ID:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The storefront loads GA4 only when this env var is present and tracks:

- Page views (App Router navigation)
- Quote lead submits (`generate_lead`)
- Quote submit errors (`quote_submit_error`)

In addition, the storefront now sends first-party cookieless baseline page-hit telemetry to Medusa (`/store/traffic/hit`) for aggregate analytics in `/a/traffic`, even when optional analytics consent is not granted.

Medusa Admin traffic dashboard is available at `/a/traffic` (served by Medusa backend). For that dashboard, set these in `services/medusa/.env`:

```bash
GA4_PROPERTY_ID=123456789
GA4_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

## SEO Artifacts

The app includes:

- `app/sitemap.ts` -> `/sitemap.xml`
- `app/robots.ts` -> `/robots.txt`
- `app/manifest.ts` -> `/manifest.webmanifest`
- Organization and FAQ JSON-LD on key pages

Sitemap URLs are emitted with locale prefix (`/en/...`).
