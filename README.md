# FLASH GEAR BD — V33 Order Tracking + Order Manager

## Changes in V33
- Cart drawer includes a **Track Order** option.
- Mobile bottom dock automatically hides while the cart drawer is open and returns after the cart closes.
- Customer tracking now uses **Order ID OR the phone number used for the order**. Customer Order Number has been removed.
- Order confirmation shows only the Order ID and phone-based tracking instruction.
- Added a dedicated **Order Manager** Apps Script HTML app (`backend/order-manager.html`).
- Order Manager shows every order, recent/pending/status counts, search/filter, tracking timeline, and status controls.
- Manager can move orders through Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered/Cancelled and add customer-facing tracking notes.
- Existing Orders sheet is migrated to remove the Customer Order Number column.
- Existing Order Tracking sheet is migrated to remove the Customer Order Number column.
- Existing product descriptions remain in **Product Descriptions** and are managed through Product Manager.

## Apps Script deployment
Add/replace:
- `google-apps-script.gs`
- `product-manager.html`
- `order-manager.html`

After deploying the Apps Script web app, the Order Manager is available with the same web-app URL plus `?orders=1`.
The existing Product Manager remains available with `?admin=1`.
