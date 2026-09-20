# FLASH GEAR BD — Google Apps Script backend

1. Open the Google Apps Script project connected to the FLASH GEAR BD Google Sheet.
2. Replace the existing server code with `google-apps-script.gs`.
3. Add/replace the HTML file named exactly `product-manager` with `product-manager.html`.
4. Save the project.
5. Run `setupStore()` once from the Apps Script editor and authorize the requested Google permissions.
6. Deploy the project as a **Web app**. Use the deployed `/exec` URL in `app.js` as `productsApiUrl`.
7. Product manager: open the same `/exec` URL with `?admin=1`.

The backend keeps products in the `Products` sheet and product images in the Drive folder created by the script.
