FLASH GEAR BD — Premium Polished V5

This build specifically fixes the issues reported after V4:

1. Product artwork no longer gets forced to 100% width/height. Images use true contain sizing so the complete image remains visible.
2. Product PNG/WebP uploads preserve transparency. The Product Manager no longer paints a white rectangle behind transparent PNGs before converting them to WebP.
3. Product-page first paint no longer waits for the Google Apps Script API. Product snapshots/cached data render first and the API refresh runs in the background.
4. Global tap feedback is lightweight. The old DOM-created ripple was removed because it was causing unnecessary work on mobile.
5. Product/card entrance animations and heavy image hover motion were reduced for smoother scrolling and tapping.
6. Product-page Colour is displayed when the inventory data contains Colour/Color/color/colour. It is not invented when the field is empty.
7. The Product Manager has a Colour field, and the Apps Script supports both Colour and Color spreadsheet headers.
8. The 30-minute product cache behavior remains enforced for normal cache reads.

IMPORTANT FOR TRANSPARENT PRODUCT IMAGES:
Existing images that were previously uploaded with the old Product Manager may already have a white background baked into the file. Re-upload those PNG/WebP originals once using this V5 Product Manager to preserve transparency.

IMPORTANT FOR COLOUR:
Make sure the Products sheet has a Colour (or Color) column and fill the value for each product, e.g. Black. Then deploy the updated Apps Script web app. The website will show only the stored colour value.
