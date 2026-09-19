# FLASH GEAR BD — V7 Premium

Premium mobile-first storefront upgrade built from the uploaded V6 source.

## Included
- Premium neon-tech visual layer and mobile bottom navigation.
- Faster product image requests and versioned browser cache.
- Client-side stock quantity protection.
- Server-side price, stock, payment, customer-data and delivery-fee validation.
- Collision-resistant order references.
- Admin PIN moved from source code to Apps Script Script Properties.
- Reduced unnecessary hero-image preloads on inner pages.
- Existing Google Sheets + Apps Script + WhatsApp architecture preserved.

## Required after deployment
In Google Apps Script, run once:

`setAdminPin('YOUR_NEW_PIN')`

Use a new 6–12 digit PIN. Do not put the PIN in the website, GitHub, or public files.

Then deploy the Apps Script web app and make sure `app.js` points to the deployed `/exec` URL.

## Important
The website still uses Google Drive product images. V7 requests smaller thumbnails for catalogue views, but a proper image CDN will provide the next major performance improvement when the catalogue grows.
