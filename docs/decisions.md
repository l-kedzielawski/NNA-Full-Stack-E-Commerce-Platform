# Decisions

## Why Next.js For The Storefront

Next.js provides a strong fit for this project because the site combines brand-heavy marketing pages, localized routes, server-rendered product content, and custom API edges.

Why it works here:

- App Router structure fits content-heavy storefront pages
- metadata and SEO handling are built into page composition
- server and client boundaries are explicit
- it is straightforward to proxy backend traffic and preserve a clean browser-facing surface

## Why Medusa Was Extended Instead Of Used As-Is

The project needed more than catalog and checkout primitives. It also needed internal operational tooling.

Custom Medusa extensions were added for:

- leads inbox and manual lead handling
- leads analytics
- coupon tooling for public and private campaigns
- payment-link generation for non-standard sales flows
- traffic analytics dashboards


## Why Strapi Was Kept Separate

The CMS concerns were kept distinct from the commerce concerns.

Benefits:

- content workflows stay separate from ordering logic
- the storefront can mix commerce-driven and CMS-driven content
- editors and operators do not need the same tooling surface

## Theme And Brand Presentation

The theme implementation intentionally avoids a superficial toggle.

Key decisions:

- persist the selected theme in `localStorage`
- mirror state to the root HTML attribute
- run a pre-paint script to avoid flash on initial load
- support theme-aware assets rather than only color swaps

## Locale Strategy

The project uses localized routes rather than only translated strings.

Why:

- better UX for region-specific storefront paths
- better control over metadata and canonical URLs
- clearer SEO structure
- easier expansion of locale-specific product content

## Analytics Strategy

The repo uses two analytics layers on purpose:

1. GA4 for richer consented analytics
2. first-party baseline tracking for operational visibility even without relying entirely on third-party analytics

This balances:

- privacy awareness
- business observability
- resilience when consent or third-party signal quality is limited

## Deployment Strategy

The deployment layer supports more than one topology because projects like this often outgrow a single hosting pattern.

Supported modes include:

- single-stack VPS
- shared reverse-proxy VPS
- shared Traefik VPS
