const SHEET_NAME = 'Products';

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json({ error: 'Products sheet not found' });
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return json([]);
  const headers = values[0].map(h => String(h).trim());
  const products = values.slice(1)
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = String(row[i] || '').trim());
      const active = String(obj['Active'] || '').toLowerCase();
      if (active && !['yes', 'true', '1', 'active'].includes(active)) return null;
      return {
        id: obj['Product ID'] || '', name: obj['Product Name'] || '', category: obj['Category'] || 'Gadgets',
        brand: obj['Brand'] || '', price: number(obj['Price']), mrp: number(obj['MRP']), stock: obj['Stock'] || 'In Stock',
        warranty: obj['Warranty'] || '', image: obj['Image URL'] || '', description: obj['Description'] || '',
        featured: ['yes', 'true', '1'].includes(String(obj['Featured']).toLowerCase())
      };
    }).filter(Boolean);
  return json(products);
}
function number(value) { const n = Number(String(value).replace(/[৳,\s]/g, '')); return isNaN(n) ? 0 : n; }
function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
