# FLASH GEAR BD — V22 Touch & Search Fix

This package is based on the previous V21 storefront and contains a focused frontend fix for the reported mobile issues.

## Fixed in V22
- Header search now has an explicit submit handler and always routes to `products.html?q=...` instead of relying only on browser form behavior.
- Featured, New Arrivals and Hot Deals use native horizontal scrolling on mobile. Android touch scrolling is handled by the browser rather than pointer-capture/transform dragging.
- Vertical page scrolling remains available when the gesture is vertical.
- Horizontal swipe/drag works naturally on touch screens.
- Automatic sliding remains enabled for rails with 2+ products.
- Infinite looping is implemented with duplicated product sets and scroll-position normalization.
- Product-card clicks remain protected from accidental activation after a swipe.
- Similar/recent product rails use the same touch-safe native scrolling approach.
- Conflicting mobile `overflow:hidden`, transform-based carousel, and pointer-capture rules are overridden at the end of the stylesheet.

## Backend
No Apps Script backend change is required for these fixes. The existing API URL remains in `app-v25.js`.

## Verification performed
- JavaScript syntax checked with Node.js.
- Source audit confirms the home rails no longer use JS pointer capture or JS transform dragging.
- Final CSS audit confirms mobile rails use native horizontal overflow and `touch-action:auto`.
- Search form has an explicit submit-to-products handler.
- ZIP contents are rechecked after creation.

## Important
This is a frontend/storefront update. The existing Google Apps Script deployment and Spreadsheet do not need to be replaced for these particular fixes.


## V25 touch/search repair
This build replaces the home product rails with native browser horizontal scrolling on mobile. It removes JS pointer-drag handling from those rails and adds explicit header search form navigation to products.html?q=... . Apps Script backend is unchanged.


V25 verification notes:
- Header search uses the native GET form as the primary path: products.html?q=... .
- Product catalog reads q from URLSearchParams and filters name/category/brand/description.
- Home product rails use native horizontal scrolling; no pointer-capture or JS drag handling.
- Final mobile CSS sets touch-action:auto!important and overflow-x:auto!important on the rails.
- V25 uses new app-v25.js and style-v25.css filenames to avoid stale V21/V22/V23 assets.
