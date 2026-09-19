/************************************************************
 * FLASH GEAR BD — V8 STORE BACKEND
 *
 * One Apps Script project for:
 * 1) Public storefront API
 * 2) Product Manager
 * 3) Google Drive product images
 * 4) Orders / stock validation
 *
 * IMPORTANT:
 * Replace YOUR_ADMIN_PIN with your existing private PIN.
 ************************************************************/

const SPREADSHEET_ID =
  '1jkN5RTSJ1-LYUh0OMNcB-BIXBCiUAQZZE_mCWXVuejU';

const ADMIN_PIN = 'YOUR_ADMIN_PIN';

const PRODUCTS_SHEET = 'Products';
const ORDERS_SHEET = 'Orders';
const SETTINGS_SHEET = 'Settings';

const PRODUCT_IMAGE_FOLDER_NAME =
  'FLASH GEAR BD - Product Images';

const PRODUCT_HEADERS = [
  'Product ID',
  'Product Name',
  'Brand',
  'Category',
  'Description',
  'RP',
  'MRP',
  'Stock',
  'Image URL',
  'Status'
];

const ORDER_HEADERS = [
  'Order ID','Date','Customer Name','Phone','Address','Products','Subtotal','Delivery Fee','Total','Payment','Status',
  'Delivery Area','Transaction ID','Client Reference'
];


/* ==========================================================
   SETUP
   ========================================================== */

function setupStore() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let products = ss.getSheetByName(PRODUCTS_SHEET);
  if (!products) products = ss.insertSheet(PRODUCTS_SHEET);

  if (products.getLastRow() === 0) {
    products.getRange(1, 1, 1, PRODUCT_HEADERS.length)
      .setValues([PRODUCT_HEADERS]);
  }

  let orders = ss.getSheetByName(ORDERS_SHEET);
  if (!orders) orders = ss.insertSheet(ORDERS_SHEET);

  ensureHeaders(orders, ORDER_HEADERS);

  let settings = ss.getSheetByName(SETTINGS_SHEET);
  if (!settings) settings = ss.insertSheet(SETTINGS_SHEET);

  if (settings.getLastRow() === 0) {
    settings.getRange(1, 1, 1, 2)
      .setValues([['Setting', 'Value']]);

    settings.getRange(2, 1, 7, 2).setValues([
      ['Store Name', 'FLASH GEAR BD'],
      ['Currency', 'BDT'],
      ['Default Delivery Fee', '80'],
      ['WhatsApp Number', ''],
      ['Store Email', ''],
      ['Website URL', ''],
      ['Announcement', 'FLASH GEAR BD • Good Quality • Best Price • Reliable Service']
    ]);
  }

  products.getRange(1, 1, 1, PRODUCT_HEADERS.length)
    .setFontWeight('bold');

  orders.getRange(1, 1, 1, ORDER_HEADERS.length)
    .setFontWeight('bold');

  settings.getRange(1, 1, 1, 2)
    .setFontWeight('bold');

  getProductImageFolder();

  return {
    success: true,
    message: 'FLASH GEAR BD setup completed.'
  };
}


/* ==========================================================
   GET API
   ========================================================== */

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};

    // Product Manager page
    if (p.admin === '1') {
      return HtmlService
        .createHtmlOutputFromFile('product-manager')
        .setTitle('FLASH GEAR BD — Product Manager')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
    }

    // Optional sitemap support
    if (p.sitemap === '1') {
      return sitemap_();
    }

    const action = p.action || 'products';

    if (action === 'products') {
      return jsonResponse({
        success: true,
        products: getProducts()
      });
    }

    if (action === 'product') {
      return jsonResponse({
        success: true,
        product: getProduct(p.id || '')
      });
    }

    if (action === 'search') {
      return jsonResponse({
        success: true,
        products: searchProducts(p.q || '')
      });
    }

    if (action === 'settings') {
      return jsonResponse({
        success: true,
        settings: getPublicSettings()
      });
    }

    if (action === 'dashboard') {
      return jsonResponse({
        success: true,
        dashboard: getDashboard()
      });
    }

    throw new Error('Unknown action.');

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message
    });
  }
}


/* ==========================================================
   POST API
   ========================================================== */

function doPost(e) {
  try {
    if (!e || !e.postData) {
      throw new Error('No POST data received.');
    }

    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action || data.type || '';

    // Product Manager uses google.script.run and reaches
    // these functions directly.
    if (action === 'saveProduct') return jsonResponse(saveProduct(data));
    if (action === 'addProduct') return jsonResponse(addProduct(data));
    if (action === 'deleteProduct') return jsonResponse(deleteProduct(data));
    if (action === 'uploadImage') return jsonResponse(uploadProductImage(data));
    if (action === 'createOrder' || action === 'order') {
      return jsonResponse(createOrder(data));
    }

    throw new Error('Unknown POST action.');

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message
    });
  }
}


/* ==========================================================
   PRODUCTS
   ========================================================== */

function getProducts() {
  const sheet = getSheet(PRODUCTS_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const values = sheet.getRange(
    2, 1, lastRow - 1, PRODUCT_HEADERS.length
  ).getValues();

  return values
    .map(rowToProduct)
    .filter(function(p) {
      return p.productId !== '' &&
        String(p.status).toLowerCase() === 'active';
    })
    .map(publicProduct);
}


function getProduct(id) {
  id = String(id || '').trim();
  if (!id) return null;

  const sheet = getSheet(PRODUCTS_SHEET);
  const row = findProductRow(sheet, id);

  if (row === -1) return null;

  const product = rowToProduct(
    sheet.getRange(row, 1, 1, PRODUCT_HEADERS.length).getValues()[0]
  );

  return publicProduct(product);
}


function searchProducts(q) {
  q = String(q || '').trim().toLowerCase();
  if (!q) return [];

  return getProducts().filter(function(p) {
    const haystack = [
      p.id, p.name, p.brand, p.category, p.description
    ].join(' ').toLowerCase();

    return haystack.indexOf(q) !== -1;
  });
}


function publicProduct(p) {
  return {
    id: p.productId,
    name: p.productName,
    category: p.category || 'Gadgets',
    brand: p.brand,
    price: Number(p.rp || 0),
    mrp: Number(p.mrp || 0),
    stock: Number(p.stock || 0),
    image: p.imageUrl,
    image2: '',
    image3: '',
    description: p.description,
    warranty: '',
    color: '',
    featured: false
  };
}


/* ==========================================================
   PRODUCT SAVE / ADD / DELETE
   ========================================================== */

function saveProduct(data) {
  requireAdmin(data.pin);

  const product = managerProductToProduct(data);
  validateProductData(product);

  const sheet = getSheet(PRODUCTS_SHEET);
  const row = findProductRow(sheet, product.productId);

  if (row === -1) {
    // If Product ID is blank, add a new product.
    return addProduct(data);
  }

  // Upload images first. Existing URLs remain if no new image
  // was selected.
  const imageUrls = uploadManagerImages(data, product.productId);

  if (imageUrls[0]) product.imageUrl = imageUrls[0];

  sheet.getRange(
    row, 1, 1, PRODUCT_HEADERS.length
  ).setValues([[
    product.productId,
    product.productName,
    product.brand,
    product.category,
    product.description,
    product.rp,
    product.mrp,
    product.stock,
    product.imageUrl,
    product.status
  ]]);

  return {
    success: true,
    ok: true,
    updated: true,
    id: product.productId,
    message: 'Product updated successfully.',
    product: product
  };
}


function addProduct(data) {
  requireAdmin(data.pin);

  const product = managerProductToProduct(data);

  if (!product.productId) {
    product.productId = generateProductId();
  }

  validateProductData(product);

  const sheet = getSheet(PRODUCTS_SHEET);

  if (findProductRow(sheet, product.productId) !== -1) {
    throw new Error('Product ID already exists.');
  }

  const imageUrls = uploadManagerImages(
    data,
    product.productId
  );

  if (imageUrls[0]) product.imageUrl = imageUrls[0];

  sheet.appendRow([
    product.productId,
    product.productName,
    product.brand,
    product.category,
    product.description,
    product.rp,
    product.mrp,
    product.stock,
    product.imageUrl,
    product.status
  ]);

  return {
    success: true,
    ok: true,
    updated: false,
    id: product.productId,
    message: 'Product added successfully.',
    product: product
  };
}


function deleteProduct(data) {
  requireAdmin(data.pin);

  const id = String(data.productId || '').trim();

  if (!id) throw new Error('Product ID is required.');

  const sheet = getSheet(PRODUCTS_SHEET);
  const row = findProductRow(sheet, id);

  if (row === -1) throw new Error('Product not found.');

  sheet.deleteRow(row);

  return {
    success: true,
    ok: true,
    message: 'Product deleted successfully.'
  };
}


/* ==========================================================
   PRODUCT MANAGER DATA MAPPING
   ========================================================== */

function managerProductToProduct(data) {
  const stockRaw = String(data.stock || '').trim();

  let stock = Number(data.stock);

  // Support the old V7 "In Stock" style value.
  if (stockRaw.toLowerCase() === 'out of stock') {
    stock = 0;
  } else if (
    stockRaw.toLowerCase() === 'in stock' &&
    !Number.isFinite(stock)
  ) {
    stock = 1;
  }

  return {
    productId: String(data.id || data.productId || '').trim(),
    productName: String(data.name || data.productName || '').trim(),
    brand: String(data.brand || '').trim(),
    category: String(data.category || '').trim(),
    description: String(data.description || '').trim(),
    rp: Number(data.price ?? data.rp ?? 0),
    mrp: Number(data.mrp ?? 0),
    stock: Number.isFinite(stock) ? stock : 0,
    imageUrl: String(data.imageUrl || '').trim(),
    status:
      data.active === false ||
      String(data.active).toLowerCase() === 'false'
        ? 'Inactive'
        : 'Active'
  };
}


function validateProductData(p) {
  if (!p.productId) {
    throw new Error('Product ID is required.');
  }

  if (!p.productName) {
    throw new Error('Product name is required.');
  }

  if (!p.category) {
    throw new Error('Category is required.');
  }

  if (!Number.isFinite(p.rp) || p.rp < 0) {
    throw new Error('Invalid RP / price.');
  }

  if (!Number.isFinite(p.mrp) || p.mrp < 0) {
    throw new Error('Invalid MRP.');
  }

  if (!Number.isFinite(p.stock) || p.stock < 0) {
    throw new Error('Invalid stock.');
  }
}


/* ==========================================================
   IMAGE SYSTEM
   ========================================================== */

function getProductImageFolder() {
  const props = PropertiesService.getScriptProperties();

  let folderId = props.getProperty(
    'PRODUCT_IMAGE_FOLDER_ID'
  );

  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (err) {}
  }

  const folders = DriveApp.getFoldersByName(
    PRODUCT_IMAGE_FOLDER_NAME
  );

  let folder;

  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(
      PRODUCT_IMAGE_FOLDER_NAME
    );
  }

  props.setProperty(
    'PRODUCT_IMAGE_FOLDER_ID',
    folder.getId()
  );

  return folder;
}


function uploadManagerImages(data, productId) {
  const urls = [];

  const imageDataList = [
    data.imageData,
    data.imageData2,
    data.imageData3
  ];

  imageDataList.forEach(function(imageData, index) {
    if (!imageData) return;

    const url = uploadImageData(
      imageData,
      productId + '-' + (index + 1)
    );

    urls[index] = url;
  });

  return urls;
}


function uploadProductImage(data) {
  requireAdmin(data.pin);

  if (!data.imageData) {
    throw new Error('No image received.');
  }

  const url = uploadImageData(
    data.imageData,
    String(data.productId || 'PRODUCT')
  );

  return {
    success: true,
    imageUrl: url
  };
}


function uploadImageData(imageData, namePrefix) {
  const folder = getProductImageFolder();

  const parts = String(imageData).split(',');

  if (parts.length !== 2) {
    throw new Error('Invalid image data.');
  }

  const match = parts[0].match(
    /data:(.*?);base64/
  );

  if (!match) {
    throw new Error('Invalid image format.');
  }

  const mimeType = match[1];

  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowed.indexOf(mimeType) === -1) {
    throw new Error('Unsupported image format.');
  }

  const bytes = Utilities.base64Decode(parts[1]);

  if (bytes.length > 5 * 1024 * 1024) {
    throw new Error(
      'Image is too large. Maximum size is 5 MB.'
    );
  }

  const extension = getImageExtension(mimeType);

  const safePrefix = String(namePrefix || 'PRODUCT')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  const fileName =
    safePrefix +
    '-' +
    Date.now() +
    extension;

  const blob = Utilities.newBlob(
    bytes,
    mimeType,
    fileName
  );

  const file = folder.createFile(blob);

  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  const fileId = file.getId();

  return (
    'https://drive.google.com/thumbnail?id=' +
    fileId +
    '&sz=w1000'
  );
}


function getImageExtension(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };

  return map[mimeType] || '.jpg';
}


/* ==========================================================
   ORDERS
   ========================================================== */

function createOrder(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const items = parseItems(data.items);
    if (!items.length) throw new Error('No products in order.');

    const customerName = String(data.customerName || data.name || '').trim();
    const phone = String(data.phone || '').replace(/\s+/g,'').trim();
    const address = String(data.address || '').trim();
    const deliveryArea = String(data.deliveryArea || '').trim();
    const payment = String(data.payment || 'COD').trim();
    const transactionId = String(data.transactionId || '').trim();
    const clientReference = String(data.clientReference || '').trim();

    if (!customerName) throw new Error('Customer name is required.');
    if (!/^01\d{9}$/.test(phone)) throw new Error('Enter a valid Bangladesh mobile number.');
    if (!address) throw new Error('Delivery address is required.');
    if (!['Inside Chattogram City','Outside Chattogram'].includes(deliveryArea)) throw new Error('Invalid delivery area.');
    if (!['COD','bKash','Nagad'].includes(payment)) throw new Error('Invalid payment method.');
    if (payment !== 'COD' && !transactionId) throw new Error('Transaction ID is required for bKash/Nagad.');

    const ordersSheet = getSheet(ORDERS_SHEET);
    ensureHeaders(ordersSheet, ORDER_HEADERS);
    if (clientReference) {
      const last = ordersSheet.getLastRow();
      if (last >= 2) {
        const refs = ordersSheet.getRange(2,14,last-1,1).getDisplayValues().flat();
        const idx = refs.findIndex(v => String(v).trim() === clientReference);
        if (idx >= 0) {
          const row = ordersSheet.getRange(idx+2,1,1,ORDER_HEADERS.length).getValues()[0];
          return {success:true, duplicate:true, orderId:String(row[0]), subtotal:Number(row[6]||0), deliveryFee:Number(row[7]||0), total:Number(row[8]||0)};
        }
      }
    }

    const productsSheet = getSheet(PRODUCTS_SHEET);
    let subtotal = 0;
    const orderProducts = [];
    items.forEach(function(item){
      const id=String(item.id||item.productId||'').trim();
      const qty=Number(item.quantity||item.qty||0);
      if(!id) throw new Error('Product ID missing.');
      if(!Number.isInteger(qty)||qty<=0) throw new Error('Invalid quantity.');
      const row=findProductRow(productsSheet,id);
      if(row===-1) throw new Error('Product not found: '+id);
      const p=rowToProduct(productsSheet.getRange(row,1,1,PRODUCT_HEADERS.length).getValues()[0]);
      if(String(p.status).toLowerCase()!=='active') throw new Error(p.productName+' is unavailable.');
      if(Number(p.stock)<qty) throw new Error('Not enough stock for '+p.productName+'. Only '+Number(p.stock)+' left.');
      const price=Number(p.rp||0), lineTotal=price*qty;
      subtotal+=lineTotal;
      orderProducts.push({row,productId:p.productId,productName:p.productName,quantity:qty,price,stock:Number(p.stock),lineTotal});
    });

    const deliveryFee = calculateDeliveryFee(deliveryArea, orderProducts, subtotal);
    const total = subtotal + deliveryFee;
    orderProducts.forEach(item=>productsSheet.getRange(item.row,8).setValue(item.stock-item.quantity));

    const orderId=generateOrderId();
    const productText=orderProducts.map(item=>item.productName+' x'+item.quantity+' @ '+item.price).join(' | ');
    ordersSheet.appendRow([orderId,new Date(),customerName,phone,address,productText,subtotal,deliveryFee,total,payment,'Pending',deliveryArea,transactionId,clientReference]);
    return {success:true,orderId,subtotal,deliveryFee,total,items:orderProducts.map(function(item){return {id:item.productId,name:item.productName,qty:item.quantity,price:item.price};})};
  } finally { lock.releaseLock(); }
}

function calculateDeliveryFee(area, orderProducts, subtotal){
  const count=orderProducts.reduce((s,i)=>s+Number(i.quantity||0),0);
  if(area==='Inside Chattogram City'){
    const unitPrices=[]; orderProducts.forEach(i=>{for(let n=0;n<i.quantity;n++)unitPrices.push(Number(i.price||0));});
    const over1900=unitPrices.some(v=>v>1900);
    const over1000Count=unitPrices.filter(v=>v>1000).length;
    return count>=2 && (over1900 || over1000Count>=2) ? 0 : 50;
  }
  return count>=2 && subtotal>6890 ? 0 : 120;
}


/* ==========================================================
   DASHBOARD / SETTINGS
   ========================================================== */

function getDashboard() {
  const sheet = getSheet(PRODUCTS_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStock: 0,
      outOfStock: 0
    };
  }

  const products = sheet.getRange(
    2, 1, lastRow - 1, PRODUCT_HEADERS.length
  ).getValues().map(rowToProduct);

  let active = 0;
  let low = 0;
  let out = 0;

  products.forEach(function(p) {
    if (String(p.status).toLowerCase() === 'active') {
      active++;
    }

    if (Number(p.stock) <= 0) {
      out++;
    } else if (Number(p.stock) <= 5) {
      low++;
    }
  });

  return {
    totalProducts: products.length,
    activeProducts: active,
    lowStock: low,
    outOfStock: out
  };
}


function getPublicSettings() {
  const sheet = getSheet(SETTINGS_SHEET);
  const lastRow = sheet.getLastRow();

  const settings = {};

  if (lastRow >= 2) {
    const rows = sheet.getRange(
      2, 1, lastRow - 1, 2
    ).getValues();

    rows.forEach(function(row) {
      const key = String(row[0] || '').trim();
      if (key) settings[key] = row[1];
    });
  }

  return {
    storeName:
      settings['Store Name'] || 'FLASH GEAR BD',

    currency:
      settings['Currency'] || 'BDT',

    defaultDeliveryFee:
      Number(settings['Default Delivery Fee'] || 0),

    whatsappNumber:
      settings['WhatsApp Number'] || '',

    storeEmail:
      settings['Store Email'] || '',

    websiteUrl:
      settings['Website URL'] || '',

    announcement:
      settings['Announcement'] ||
      'FLASH GEAR BD • Good Quality • Best Price • Reliable Service'
  };
}


/* ==========================================================
   HELPERS
   ========================================================== */

function ensureHeaders(sheet, headers){
  const width=Math.max(sheet.getLastColumn(), headers.length);
  if(sheet.getMaxColumns()<headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length-sheet.getMaxColumns());
  const current=sheet.getRange(1,1,1,headers.length).getValues()[0];
  let changed=false;
  headers.forEach((h,i)=>{if(String(current[i]||'').trim()!==h){current[i]=h;changed=true;}});
  if(changed) sheet.getRange(1,1,1,headers.length).setValues([current]);
  sheet.getRange(1,1,1,headers.length).setFontWeight('bold');
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(
    SPREADSHEET_ID
  );

  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error(
      'Sheet not found: ' + name
    );
  }

  return sheet;
}


function findProductRow(sheet, id) {
  id = String(id || '').trim().toLowerCase();

  if (!id) return -1;

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return -1;

  const ids = sheet.getRange(
    2, 1, lastRow - 1, 1
  ).getDisplayValues();

  for (let i = 0; i < ids.length; i++) {
    if (
      String(ids[i][0] || '')
        .trim()
        .toLowerCase() === id
    ) {
      return i + 2;
    }
  }

  return -1;
}


function rowToProduct(row) {
  return {
    productId: String(row[0] || '').trim(),
    productName: String(row[1] || '').trim(),
    brand: String(row[2] || '').trim(),
    category: String(row[3] || '').trim(),
    description: String(row[4] || '').trim(),
    rp: Number(row[5] || 0),
    mrp: Number(row[6] || 0),
    stock: Number(row[7] || 0),
    imageUrl: String(row[8] || '').trim(),
    status: String(row[9] || 'Active').trim()
  };
}


function generateProductId() {
  const sheet = getSheet(PRODUCTS_SHEET);

  let number = Math.max(
    0,
    sheet.getLastRow() - 1
  ) + 1;

  let id;

  do {
    id =
      'FG-' +
      String(number).padStart(4, '0');

    number++;

  } while (
    findProductRow(sheet, id) !== -1
  );

  return id;
}


function generateOrderId() {
  const stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd-HHmmss'
  );

  const random =
    Math.floor(1000 + Math.random() * 9000);

  return 'FG-' + stamp + '-' + random;
}


function parseItems(items) {
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (err) {
      throw new Error('Invalid order items.');
    }
  }

  if (!Array.isArray(items)) {
    throw new Error('Invalid order items.');
  }

  return items;
}


function requireAdmin(pin) {
  if (
    String(pin || '') !==
    String(ADMIN_PIN)
  ) {
    throw new Error('Invalid admin PIN.');
  }
}


function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ==========================================================
   SIMPLE SITEMAP SUPPORT
   ========================================================== */

function sitemap_() {
  const base =
    'https://gear.flashgearbd.workers.dev/';

  const urls = [
    '',
    'products.html',
    'warranty.html',
    'delivery.html',
    'contact.html'
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(function(u) {
      return '<url><loc>' +
        base + u +
        '</loc></url>';
    }).join('') +
    '</urlset>';

  return ContentService
    .createTextOutput(xml)
    .setMimeType(ContentService.MimeType.XML);
}
