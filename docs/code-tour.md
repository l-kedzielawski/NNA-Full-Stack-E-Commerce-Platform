# Code Tour

This guide is for engineers opening the repo for the first time and wanting the fastest path to the interesting parts.

Start with section 1 and follow the numbered order, or jump  directly to whichever area is most relevant to what you're evaluating.

## 1. Start With The Storefront Shell

- `app/layout.tsx`
- `app/page.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`

This gives you the global page shell, analytics mounting, theme bootstrapping, and the top-level storefront composition.

## 2. Theme System

- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `components/themed-image.tsx`

Look here for:

- persisted theme state
- DOM theme attribute management
- asset switching between light and dark variants

## 3. Internationalization And Routing

- `proxy.ts`
- `lib/i18n.ts`

Look here for:

- locale detection from path, cookie, and request headers
- localized pathname mapping
- locale prefix behavior

## 4. Product Experience

- `app/products/page.tsx`
- `app/products/[slug]/page.tsx`
- `components/product-catalog.tsx`
- `components/product-gallery.tsx`

Look here for:

- product listing
- product storytelling blocks
- locale-aware rendering
- image and merchandising presentation

## 5. Quote And Lead Flow

- `components/request-quote-form.tsx`
- `app/api/quote/route.ts`
- `services/medusa/src/admin/routes/leads/page.tsx`
- `services/medusa/src/admin/routes/leads-analytics/page.tsx`

This is one of the best custom workflow areas in the repo. It covers intake, anti-spam, Medusa persistence, and internal lead operations.

## 6. Checkout And Stripe Extensions

- `components/cart-page.tsx`
- `components/checkout-page.tsx`
- `services/medusa/src/admin/routes/leads/page.tsx`
- `services/medusa/src/admin/widgets/order-detailed-payment-link.tsx`

Look here for:

- storefront cart and checkout behavior
- custom lead payment links
- detailed order payment-link generation
- manual sales and recovery tooling

## 7. Coupons And Promotions

- `components/promo-banner.tsx`
- `components/coupon-code-form.tsx`
- `services/medusa/src/admin/routes/coupons/page.tsx`
- `services/medusa/src/api/admin/coupon-tools/route.ts`

This area shows how campaign tooling was shaped around business workflows rather than only default commerce admin behavior.

## 8. Analytics

- `components/analytics/ga4.tsx`
- `components/analytics/baseline-traffic.tsx`
- `services/medusa/src/admin/routes/traffic/page.tsx`
- `services/medusa/src/api/admin/traffic/route.ts`
- `services/medusa/src/api/admin/traffic/baseline/route.ts`

This area demonstrates the dual analytics strategy: consented GA4 plus first-party baseline traffic.

## 9. CMS And Backend Services

- `services/medusa/`
- `services/strapi/`
- `services/README.md`

Read `services/README.md` first, then drill into the Medusa admin routes and APIs.

## 10. Deployment Layer

- `docker-compose.yml`
- `docker-compose.prod.yml`
- `docker-compose.prod.shared-proxy.yml`
- `docker-compose.prod.traefik.yml`
- `deploy/`

This area shows how local development and multiple VPS topologies were supported.
