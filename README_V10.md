# FLASH GEAR BD — V10 CLEAN & PRODUCTION BUILD

V10 is a stability-focused rebuild based on the V9 storefront.

## Main fixes
- Order is saved to Google Apps Script before WhatsApp opens.
- Official backend Order ID is used everywhere.
- Failed orders keep the cart intact.
- Server validates customer details, stock, price and delivery fee.
- Server calculates delivery fee; browser cannot set the final fee.
- Idempotency/client reference prevents accidental duplicate order creation.
- Orders now preserve Delivery Area, Transaction ID and Client Reference in new columns without breaking existing 11-column order history.
- Stock `0` is correctly treated as Out of Stock.
- Low-stock labels are consistent.
- Mobile checkout is full-height, keyboard-friendly and scroll-safe.
- Clear Confirm Order button states and success confirmation screen.
- WhatsApp opens only after successful order save.
- WhatsApp receives the authoritative backend prices and official Order ID.
- Removed obsolete legacy mobile-navigation JavaScript.
- Reduced Google Drive thumbnail size from w900 to w600.
- Added reduced-motion handling and safer mobile fixed-position layout.
- Updated top trust wording to: Good Quality • Best Price • Reliable Service.

## Backend deployment
The included `google-apps-script.gs` is part of V10 and must be copied into the Google Apps Script project if the current deployed backend is not already updated.

After replacing the script, run `setupStore()` once. It safely adds the new order columns after the existing order columns.

Do not expose or commit the real ADMIN_PIN.
