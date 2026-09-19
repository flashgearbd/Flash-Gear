# FLASH GEAR BD — Premium V6

This build extends the Premium Polished storefront with mobile-first shopping, SEO/trust, performance and product-management improvements.

## Included now
- Fixed mobile bottom navigation: Home / Categories / Cart / WhatsApp
- Payment trust pills: bKash / Nagad / COD
- Delivery area + delivery charge in cart: Dhaka ৳60 / Outside Dhaka ৳120
- Full WhatsApp order summary including delivery and optional bKash/Nagad transaction ID
- Address required at checkout
- 11-digit Bangladesh phone validation
- Order log `doPost` support in Apps Script
- 5-minute server-side Apps Script product cache
- Product API response includes announcement, removing the extra `?meta=1` page request
- 30-minute browser product cache remains enforced
- Product Manager can ADD or UPDATE by Product ID; it no longer blindly creates duplicates
- Colour field plus Image 2 / Image 3 gallery fields
- Product gallery with thumbnails
- Recently Viewed rail
- Swipe/drag product rails with click suppression after a real drag
- Fly-to-cart animation
- Dismissible announcement bar + mobile marquee
- Dark-mode toggle with `prefers-color-scheme` fallback
- Dynamic product title, description, canonical and Product JSON-LD
- Homepage Organization + WebSite JSON-LD
- OG/Twitter tags on storefront pages
- Category hero count and zero-product category filtering
- Delivery table + Track My Order section
- Warranty FAQ accordion
- Trust/testimonial section
- Product sitemap endpoint through Apps Script (`?sitemap=1`)
- Contact page included in static sitemap
- Drive `open?id=` parsing and Drive image retry
- Transparent product image handling with no CSS white plate and `contain` sizing
- Reduced animation overhead and `prefers-reduced-motion` support

## Required after deployment
1. Replace `Code.gs` in Apps Script with `google-apps-script.gs` from this package.
2. Make sure the `Products` sheet has/gets these columns: `Colour`, `Image 2`, `Image 3`.
3. Redeploy the Apps Script web app as the same public deployment.
4. The Product Manager remains protected by its PIN and uses `XFrameOptionsMode.DEFAULT`.
5. For announcement editing, create a `Settings` sheet with columns `Key, Value` and a row with `Announcement` in Key.
6. Orders will be written to an `Orders` sheet automatically after the first checkout POST.

## Delivery charges
- Inside Dhaka: ৳60
- Outside Dhaka: ৳120

Update these values in `app.js` if your business policy changes.

## Image CDN
`CONFIG.imageCdnBase` is provided as an optional hook. Leave it empty to use Google Drive thumbnails/retry. Connect a Cloudflare image/CDN endpoint later when you have one.
