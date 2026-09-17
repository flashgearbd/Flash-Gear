/**
 * FLASH GEAR BD — Google Sheets Product API + Mobile Product Manager
 *
 * Sheet tab: Products
 *
 * Public website:
 *   GET /exec                  -> JSON product API
 * Mobile product manager:
 *   GET /exec?admin=1          -> Product Manager
 *
 * IMPORTANT:
 * - Change ADMIN_PIN before using the Product Manager.
 * - Keep the Product Manager URL private.
 * - The upload is resized/compressed in the phone browser, then saved to
 *   a Google Drive folder and its image URL is written to Google Sheets.
 */

const SHEET_NAME = 'Products';
const DRIVE_FOLDER_NAME = 'FLASH GEAR BD Product Images';
const ADMIN_PIN = '2580'; // CHANGE THIS before publishing.

function doGet(e) {
  if (e && e.parameter && e.parameter.admin === '1') {
    return HtmlService.createHtmlOutputFromFile('product-manager')
      .setTitle('FLASH GEAR BD — Product Manager')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json({ error: 'Products sheet not found' });

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return json([]);

  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);

  const products = rows
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = String(row[i] ?? '').trim());

      const active = String(obj.Active || '').toLowerCase();
      if (active && !['yes','true','1','active'].includes(active)) return null;

      return {
        id: obj['Product ID'] || '',
        name: obj['Product Name'] || '',
        category: obj['Category'] || 'Gadgets',
        brand: obj['Brand'] || '',
        price: number(obj['Price']),
        mrp: number(obj['MRP']),
        stock: obj['Stock'] || 'In Stock',
        warranty: obj['Warranty'] || '',
        image: obj['Image URL'] || '',
        description: obj['Description'] || '',
        featured: ['yes','true','1'].includes(String(obj['Featured']).toLowerCase())
      };
    })
    .filter(Boolean);

  return json(products);
}

function saveProduct(form) {
  if (!form || String(form.pin || '') !== ADMIN_PIN) {
    throw new Error('Incorrect PIN.');
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Products sheet not found.');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(h => String(h).trim());
  const required = ['Product ID','Product Name','Category','Brand','Price','MRP','Stock','Warranty','Image URL','Description','Featured','Active'];
  const missing = required.filter(h => !headers.includes(h));
  if (missing.length) throw new Error('Missing columns: ' + missing.join(', '));
  if (!String(form.name || '').trim()) throw new Error('Product name is required.');
  if (!String(form.category || '').trim()) throw new Error('Category is required.');

  let imageUrl = String(form.imageUrl || '').trim();
  if (form.imageData && String(form.imageData).includes(',')) {
    imageUrl = saveImage_(form.imageData, form.imageName || 'product.webp');
  }

  const id = String(form.id || '').trim() || createProductId_(form.name);
  const values = {
    'Product ID': id,
    'Product Name': String(form.name || '').trim(),
    'Category': String(form.category || '').trim(),
    'Brand': String(form.brand || '').trim(),
    'Price': cleanNumber_(form.price),
    'MRP': cleanNumber_(form.mrp),
    'Stock': String(form.stock || 'In Stock').trim(),
    'Warranty': String(form.warranty || '').trim(),
    'Image URL': imageUrl,
    'Description': String(form.description || '').trim(),
    'Featured': form.featured ? 'Yes' : 'No',
    'Active': form.active === false ? 'No' : 'Yes'
  };

  const row = headers.map(h => values[h] ?? '');
  sheet.appendRow(row);
  return { ok: true, id, imageUrl };
}

function saveImage_(dataUrl, originalName) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data.');

  const mime = match[1] || 'image/webp';
  const bytes = Utilities.base64Decode(match[2]);
  const ext = mime.includes('png') ? 'png' : mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'webp';
  const safe = String(originalName || 'product').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '');
  const name = safe + '_' + Date.now() + '.' + ext;
  const blob = Utilities.newBlob(bytes, mime, name);
  const folder = getOrCreateFolder_();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function getOrCreateFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function createProductId_(name) {
  const base = String(name || 'PRODUCT').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'PRODUCT';
  return base + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function cleanNumber_(value) {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function number(value) {
  const n = Number(String(value).replace(/[৳,\s]/g, ''));
  return isNaN(n) ? 0 : n;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
