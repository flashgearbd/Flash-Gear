# FLASH GEAR BD — V8

Connected to the new Google Sheet / Apps Script backend.

## New Web App
https://script.google.com/macros/s/AKfycbzCpbkkiI71eYs1GKhCtCyWLNuN6KyHfDHCuJo9gV97UV2MhUPn0yCvka4IrOmLSQTO/exec

## Included
- New Google Sheet backend
- Product search by Product ID/name
- Add / edit products
- Numeric stock management
- Server-side price and stock validation
- Orders
- Dashboard
- Google Drive product image upload
- Automatic Drive thumbnail Image URL
- Phone-friendly Product Manager
- Existing premium storefront preserved

## Google Drive image system
Images are automatically saved to:

FLASH GEAR BD - Product Images

The generated website URL is stored in the Products sheet under Image URL.

## Setup
1. Open the Apps Script project.
2. Replace YOUR_ADMIN_PIN in google-apps-script.gs with your private PIN.
3. Save.
4. Run setupStore once and authorize Google Drive/Sheets permissions.
5. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
6. Update the deployment to a new version.
7. Open the Product Manager with:
   https://script.google.com/macros/s/AKfycbzCpbkkiI71eYs1GKhCtCyWLNuN6KyHfDHCuJo9gV97UV2MhUPn0yCvka4IrOmLSQTO/exec?admin=1

Do not publish your PIN.
