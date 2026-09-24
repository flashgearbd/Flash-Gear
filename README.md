# FLASH GEAR BD V27 — V7.1 Search Reference + Premium UI Polish

This build starts from the supplied V25 storefront and uses the supplied V7.1 storefront as the visual reference for the top search bar.

## Scope of changes
- Recreated the V7.1-style full pill search bar.
- Premium focus/press/hover motion for the search bar and search suggestions.
- Smooth, restrained UI motion for non-cart visible controls/cards.
- Mobile search remains a full-width pill beneath the brand row.
- Native GET search flow remains unchanged: `products.html?q=...`.
- Cart markup, cart state, cart drawer, checkout and cart JavaScript were not modified.
- Apps Script backend was not modified.

## Verification
- JavaScript syntax checked.
- CSS braces/comments balanced.
- All HTML asset references updated to `app-v27.js` and `style-v27.css`.
- Backend files compared byte-for-byte with the supplied V25 package.
- Frontend JavaScript compared byte-for-byte with the supplied V25 package.
- HTML content compared byte-for-byte with V25 except for the intentional V27 asset filename changes.
- Final ZIP contents inspected after creation.


V30 changes: exact search suggestions (max 5, no unrelated fallback matches), New Arrivals capped at 6, Hot Deals capped at 10, Featured capped at 5, and all three rails advance one card then wait 2.5 seconds before the next card, looping indefinitely.


## New Sheet / Web Management connection
This connected build points the storefront API to the current FLASH GEAR BD Google Apps Script Web App:
https://script.google.com/macros/s/AKfycbxmPBbQROUhe3ZzKlWpNqsL-6jZpV0De51U7NMkiFOpfVz21YDJL2ywrEz4MaDbks_KXg/exec

The storefront uses this URL for product loading, public settings, and order submission. The Product Manager remains on the Apps Script management endpoint (`?admin=1`). Do not deploy the legacy `backend/google-apps-script.gs` from this ZIP over the currently working management project.
