# FLASH GEAR BD — Final Light Blue / White Edition

This package is designed for the current Google Sheets + Cloudflare Worker setup.

## Main changes
- User-provided hero image is used and optimized as `hero-tech.webp`.
- User-provided logo is cleaned, background-removed and optimized as `flash-gear-logo.webp`.
- Light white + blue visual system instead of the previous very-dark interface.
- Featured Products appear first on the homepage, before categories.
- All requested categories are included.
- Category artwork no longer uses the previous 1.8MB sprite, so category rendering is much lighter.
- Product images are lazy-loaded and decoded asynchronously.
- Product data is cached in the browser for faster repeat visits, then refreshed from Google Sheets in the background.
- Clicking a product opens a smooth product details view with description, warranty, availability, price and WhatsApp order.
- Navigation is simplified to Home + Categories. Search and Cart remain as core shopping controls.
- Rounded pill / Dynamic-Island-inspired controls throughout the interface.
- Full warranty policy page added.
- About / brand description added near the bottom of the homepage.
- Mobile layout refined for Android screens.

## Product categories
Feature Phone, Mobile Phones, Adapter & Cable, Charger, Earbud, Headphone, Neckband, Earphone, Speaker, Powerbank, Smart watch, Tripod, Boya, Screen Protector, Phone Case.

## Google Sheets
The existing Apps Script URL is already configured in `app.js`. Continue managing products from the `Products` sheet. Use `Active = Yes` to publish a product and `Featured = Yes` to place it in Featured Products.

## Latest refinements
- Darker premium blue hero overlay while retaining a light blue/white interface
- Live search suggestions showing up to 5 matching products as the customer types
- Suggestions match product name, brand, category and description
- Selecting a suggestion opens the product details or takes the customer to its catalog result
