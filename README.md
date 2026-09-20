# FLASH GEAR BD V26 — V7.1 Search Reference + Premium UI Polish

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
- All HTML asset references updated to `app-v26.js` and `style-v26.css`.
- Backend files compared byte-for-byte with the supplied V25 package.
- Frontend JavaScript compared byte-for-byte with the supplied V25 package.
- HTML content compared byte-for-byte with V25 except for the intentional V26 asset filename changes.
- Final ZIP contents inspected after creation.
