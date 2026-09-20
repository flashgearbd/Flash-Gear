# FLASH GEAR BD — Cloudflare Workers deployment

This package is structured for Cloudflare Workers + Static Assets.

## Cloudflare Workers Builds
- Root directory: `/`
- Build command: `npx wrangler deploy`
- Build output directory: leave blank
- Deploy command: `npx wrangler deploy`

`wrangler.jsonc` intentionally points to `./public`, and this package contains that directory.

## Important
Do not set the asset directory to `/opt/buildhome/repo/public` manually. Wrangler resolves `./public` from the project root.

The public website files are inside `public/`.
