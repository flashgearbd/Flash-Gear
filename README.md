FLASH GEAR BD — V18 CLEAN MOBILE LAYOUT

This package rebuilds the confirmed mobile layout from the V14 working storefront base.

Confirmed fixes:
- Bottom mobile dock is Home / Categories / Cart only.
- Header has a dedicated first row for hamburger/logo/cart and a dedicated second row for search.
- Hero uses the actual hero image without a top overlay/mask; only the bottom edge blends into the site background.
- Explore Categories uses a high-contrast white/blue treatment.
- Empty cart explicitly hides checkout/customer-information until a product exists, and the empty state itself does not scroll.
- Existing Apps Script API, order logic, stock, delivery, payment and Product Manager backend are preserved.

Cache-busting: storefront pages reference style-v18.css and app-v18.js so an older Cloudflare-cached style.css/app.js cannot mask the changes.

Deploy the ZIP contents at repository root to Cloudflare Workers.
