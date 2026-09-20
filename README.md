# FLASH GEAR BD V16 — COMPLETE BUGFIX PACKAGE

## Cloudflare deployment

This storefront is a **root-level Workers Static Assets** project. Do not put it inside `public/`.

Cloudflare build command:

    npx wrangler deploy

Repository root: `/`
Build output directory: leave blank.

The root must contain `index.html` and `wrangler.jsonc` directly.

`backend/` contains the Google Apps Script source and Product Manager. It is excluded from Cloudflare static asset upload by `.assetsignore`.

## Product management

Products are NOT uploaded in Cloudflare. They are managed through the Google Apps Script Product Manager connected to the Google Sheet. See `backend/README.md`.
