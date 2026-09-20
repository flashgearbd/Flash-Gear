# FLASH GEAR BD — Clean Production Build

## Website
Cloudflare Pages/Workers serves only the `public/` directory. Do not change `assets.directory` away from `./public`.

## Apps Script
Upload `google-apps-script.gs` into the Apps Script project as `Code.gs`.
Add `product-manager.html` as an **HTML file** in the same Apps Script project because the manager uses `google.script.run`.

Run `setupStore()` once after pasting the backend. On the first run it creates a new secure admin PIN and returns it in the execution result. Keep that PIN private. The old PIN should not be reused because it was previously exposed.

Set the Apps Script project timezone to **Asia/Dhaka** in Project Settings.

After deploying the Apps Script Web App, make sure `public/app.js` contains the current `/exec` URL.

## Store Settings
In the `Settings` sheet, fill these when available:
- Store Email — receives new-order email alerts
- bKash Number
- Nagad Number
- Business Address
- Business Hours

## Important
The backend re-checks current prices and stock at checkout. It creates the official Order ID before WhatsApp opens. Transaction IDs for bKash/Nagad are recorded for manual checking; there is no automatic payment verification.
