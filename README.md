# FLASH GEAR BD — Mobile Product Manager Update

This version adds a phone-friendly Product Manager to the existing Google Sheets product system.

## What it does
- Open the Apps Script Web App with `?admin=1`.
- Add a product from an Android phone.
- Choose a product image directly from the phone gallery/camera.
- The browser resizes the image to a web-friendly maximum of 1400px and WebP quality.
- The image is saved into a Google Drive folder named `FLASH GEAR BD Product Images`.
- The returned image URL is automatically written into the `Image URL` column.
- Product information is automatically appended to the `Products` sheet.
- Category, warranty, description, featured and active status are included.

## One-time setup
1. Open your existing Apps Script project attached to the Products spreadsheet.
2. Replace the old `google-apps-script.gs` code with the new code in this package.
3. Add a new Apps Script HTML file named exactly `product-manager` and paste the contents of `product-manager.html`.
4. The Apps Script manager now uses a strong numeric PIN. Keep the manager URL and PIN private. The current PIN is supplied separately with this build.
5. Deploy the Web App again as the same deployment: Execute as **Me**, Who has access **Anyone**.
6. Open your existing `/exec` URL followed by `?admin=1` to open the mobile Product Manager.

The normal `/exec` URL still returns the JSON API for the website.

## Sheet columns
Product ID, Product Name, Category, Brand, Price, MRP, Stock, Warranty, Image URL, Description, Featured, Active

## Important
The Product Manager is protected by the PIN in Apps Script. Keep the manager URL and PIN private. Google Drive sharing is set to Anyone with the link so the public website can display uploaded product images.


### Editable announcement
Create an optional Google Sheet tab named `Settings` with columns `Key` and `Value`. Add a row with `Announcement` in column A and the announcement text in column B. The website reads it from the Apps Script API.
