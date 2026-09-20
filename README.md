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
No Apps Script backend change is required for these fixes. The existing API URL remains in `app-v21.js`.

## Verification performed
- JavaScript syntax checked with Node.js.
- Source audit confirms the home rails no longer use JS pointer capture or JS transform dragging.
- Final CSS audit confirms mobile rails use native horizontal overflow and `touch-action:auto`.
- Search form has an explicit submit-to-products handler.
- ZIP contents are rechecked after creation.

## Important
This is a frontend/storefront update. The existing Google Apps Script deployment and Spreadsheet do not need to be replaced for these particular fixes.
