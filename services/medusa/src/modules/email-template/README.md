# Email Template Module

This module provides editable order email templates used by the `order.placed` subscriber.

## Edit templates

- Customer confirmation template: `src/modules/email-template/templates/order-customer.ts`
- Internal order alert template: `src/modules/email-template/templates/order-internal.ts`

Each template exposes:

- `subject`
- `html`
- `text`

Use placeholders like `{{order_ref}}`, `{{total}}`, `{{items_rows_html}}`, etc.

## Delay before sending

The order subscriber waits before fetching and sending the email to reduce stale totals.

- Env var: `ORDER_EMAIL_DELAY_MS`
- Default: `12000` (12 seconds)

Set `ORDER_EMAIL_DELAY_MS=0` to disable the delay.
