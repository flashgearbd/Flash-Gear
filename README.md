# FLASH GEAR BD — Google Sheets Product Catalog

The website reads products from the Google Sheet tab named `Products` through a Google Apps Script Web App.

## Product columns
Product ID, Product Name, Category, Brand, Price, MRP, Stock, Warranty, Image URL, Description, Featured, Active

## How to manage products
1. Open the Google Sheet and use the `Products` tab.
2. Add one product per row.
3. Set `Active` to `Yes` to show it on the website. Set `No` to hide it.
4. Set `Featured` to `Yes` for products you want on the homepage.
5. Use a publicly accessible direct image URL in `Image URL`.
6. Save the sheet. The website fetches the latest data from the API without a Cloudflare redeploy.

The Apps Script Web App URL is already connected in `app.js` for this deployment.
