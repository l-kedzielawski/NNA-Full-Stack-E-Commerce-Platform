# Product Metadata i18n

This project supports product translations stored in Medusa product metadata under:

```json
{
  "i18n": {
    "en": { "title": "...", "description": "...", "seo_description": "..." },
    "pl": { "title": "...", "description": "...", "seo_description": "..." },
    "de": { "title": "...", "description": "...", "seo_description": "..." }
  }
}
```

## Storefront behavior

- Product fields are resolved from `metadata.i18n.<locale>` first.
- Fallback is standard product fields (English).
- Locale-specific `custom_*` fields can be stored inside `metadata.i18n.<locale>` and are used by product detail sections.

## One-time/batch sync command

The Medusa script can:

1. Ensure `metadata.i18n.en` exists for every product.
2. Merge translations from a JSON file.

Run from repository root:

```bash
PRODUCT_I18N_FILE=../../content/product-i18n.example.json npm run medusa:sync-product-i18n
```

Or from `services/medusa`:

```bash
PRODUCT_I18N_FILE=../../content/product-i18n.example.json npm run sync:product-i18n
```

The file format is shown in `content/product-i18n.example.json`.

## Editing in Medusa Admin

- Open a product in Medusa Admin.
- In metadata JSON, edit `i18n.pl`, `i18n.de`, etc.
- Save product.

Example:

```json
"i18n": {
  "pl": {
    "title": "Naturalna wanilia Bourbon",
    "description": "Pelny opis po polsku",
    "seo_description": "Skrot SEO po polsku",
    "custom_overview": ["Akapit 1", "Akapit 2"]
  }
}
```
