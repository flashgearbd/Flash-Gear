/************************************************************
 * FLASH GEAR BD — V11 STORE BACKEND
 *
 * Public storefront API + Product Manager + Drive images + Orders.
 * Security-sensitive values live in Script Properties.
 ************************************************************/

const SPREADSHEET_ID = '1jkN5RTSJ1-LYUh0OMNcB-BIXBCiUAQZZE_mCWXVuejU';
const PRODUCTS_SHEET = 'Products';
const ORDERS_SHEET = 'Orders';
const SETTINGS_SHEET = 'Settings';
const PRODUCT_IMAGE_FOLDER_NAME = 'FLASH GEAR BD - Product Images';
const PRODUCT_CACHE_KEY = 'FLASH_GEAR_PUBLIC_PRODUCTS_V1';
const PRODUCT_CACHE_TTL = 60; // seconds
const ADMIN_FAIL_LIMIT = 5;
const ADMIN_LOCK_SECONDS = 15 * 60;

const PRODUCT_HEADERS = [
  'Product ID','Product Name','Brand','Category','Description',
  'RP','MRP','Stock','Image URL','Status','Warranty','Color','Featured','Image URL 2','Image URL 3'
];

const ORDER_HEADERS = [
  'Order ID','Date','Customer Name','Phone','Address','Products','Subtotal','Delivery Fee','Total','Payment','Status',
  'Delivery Area','Transaction ID','Client Reference'
];

function setupStore() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.setSpreadsheetTimeZone('Asia/Dhaka');

  let products = ss.getSheetByName(PRODUCTS_SHEET);
  if (!products) products = ss.insertSheet(PRODUCTS_SHEET);
  ensureHeaders(products, PRODUCT_HEADERS);

  let orders = ss.getSheetByName(ORDERS_SHEET);
  if (!orders) orders = ss.insertSheet(ORDERS_SHEET);
  ensureHeaders(orders, ORDER_HEADERS);

  let settings = ss.getSheetByName(SETTINGS_SHEET);
  if (!settings) settings = ss.insertSheet(SETTINGS_SHEET);
  ensureSettings(settings);

  products.getRange(1,1,1,PRODUCT_HEADERS.length).setFontWeight('bold');
  orders.getRange(1,1,1,ORDER_HEADERS.length).setFontWeight('bold');
  settings.getRange(1,1,1,2).setFontWeight('bold');

  // Preserve leading zeros and prevent formula interpretation in customer text fields.
  if (orders.getMaxRows() > 0) {
    orders.getRange(1,3,orders.getMaxRows(),3).setNumberFormat('@'); // C:E
    orders.getRange(1,13,orders.getMaxRows(),2).setNumberFormat('@'); // M:N
  }

  getProductImageFolder();
  const security = ensureAdminPin_();
  invalidateProductCache_();

  return {
    success: true,
    message: 'FLASH GEAR BD setup completed.',
    adminPinCreated: security.created,
    initialAdminPin: security.created ? security.pin : ''
  };
}

function ensureSettings(sheet) {
  if (sheet.getLastRow() === 0) sheet.getRange(1,1,1,2).setValues([['Setting','Value']]);
  const defaults = {
    'Store Name':'FLASH GEAR BD',
    'Currency':'BDT',
    'Default Delivery Fee':'80',
    'WhatsApp Number':'8801601093553',
    'Store Email':'',
    'Website URL':'https://gear.flashgearbd.workers.dev/',
    'Announcement':'FLASH GEAR BD • Good Quality • Best Price • Reliable Service',
    'bKash Number':'',
    'Nagad Number':'',
    'Business Address':'Chattogram, Bangladesh',
    'Business Hours':''
  };
  const last = sheet.getLastRow();
  const existing = last >= 2 ? sheet.getRange(2,1,last-1,2).getValues() : [];
  const seen = new Set(existing.map(r=>String(r[0]||'').trim()).filter(Boolean));
  const missing = Object.keys(defaults).filter(k=>!seen.has(k)).map(k=>[k,defaults[k]]);
  if (missing.length) sheet.getRange(sheet.getLastRow()+1,1,missing.length,2).setValues(missing);
}

/* ========================= GET API ========================= */
function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (p.sitemap === '1') return sitemap_();
    if (p.admin === '1') return HtmlService.createHtmlOutputFromFile('product-manager').setTitle('FLASH GEAR BD — Product Manager').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
    const action = p.action || 'products';
    if (action === 'products') return jsonResponse({success:true,products:getProducts()});
    if (action === 'product') return jsonResponse({success:true,product:getProduct(p.id||'')});
    if (action === 'search') return jsonResponse({success:true,products:searchProducts(p.q||'', '')});
    if (action === 'settings') return jsonResponse({success:true,settings:getPublicSettings()});
    if (action === 'dashboard') return jsonResponse({success:true,dashboard:getDashboard()});
    throw new Error('Unknown action.');
  } catch (err) { return jsonResponse({success:false,error:String(err.message||err)}); }
}

/* Only order creation is publicly POSTable. Admin actions use google.script.run and PIN checks. */
function doPost(e) {
  try {
    if (!e || !e.postData) throw new Error('No POST data received.');
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action || data.type || '';
    if (action === 'createOrder' || action === 'order') return jsonResponse(createOrder(data));
    throw new Error('Unknown POST action.');
  } catch (err) { return jsonResponse({success:false,error:String(err.message||err)}); }
}

/* ========================= PRODUCTS ========================= */
function getProducts() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(PRODUCT_CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }
  const products = getAllProducts_(false).map(publicProduct);
  try { cache.put(PRODUCT_CACHE_KEY, JSON.stringify(products), PRODUCT_CACHE_TTL); } catch (_) {}
  return products;
}

function getAllProducts_(includeInactive) {
  const sheet = getSheet(PRODUCTS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2,1,lastRow-1,PRODUCT_HEADERS.length).getValues();
  return values.map(rowToProduct).filter(p => p.productId && (includeInactive || String(p.status).toLowerCase()==='active'));
}

function getProduct(id) {
  id = String(id||'').trim();
  if (!id) return null;
  const sheet = getSheet(PRODUCTS_SHEET);
  const row = findProductRow(sheet,id);
  if (row === -1) return null;
  const p = rowToProduct(sheet.getRange(row,1,1,PRODUCT_HEADERS.length).getValues()[0]);
  if (String(p.status).toLowerCase() !== 'active') return null;
  return publicProduct(p);
}

function searchProducts(q, pin) {
  q = String(q||'').trim().toLowerCase();
  if (!q) return [];
  let includeInactive = false;
  if (pin) { requireAdmin(pin); includeInactive = true; }
  return getAllProducts_(includeInactive).filter(p => [p.productId,p.productName,p.brand,p.category,p.description].join(' ').toLowerCase().includes(q)).map(publicProduct);
}

function publicProduct(p) {
  return {
    id:p.productId,name:p.productName,category:p.category||'Gadgets',brand:p.brand,
    price:Number(p.rp||0),mrp:Number(p.mrp||0),stock:Number(p.stock||0),image:p.imageUrl,
    image2:p.imageUrl2||'',image3:p.imageUrl3||'',description:p.description,
    warranty:p.warranty||'',color:p.color||'',featured:Boolean(p.featured),status:p.status
  };
}

/* ===================== PRODUCT MANAGER ===================== */
function saveProduct(data) {
  requireAdmin(data.pin);
  const product = managerProductToProduct(data);
  // Blank Product ID means "add new"; generate it before validation.
  if (!product.productId) return addProduct(data);
  validateProductData(product);
  const sheet = getSheet(PRODUCTS_SHEET);
  const row = findProductRow(sheet, product.productId);
  if (row === -1) return addProduct(data);

  const imageUrls = uploadManagerImages(data, product.productId);
  if (imageUrls[0]) product.imageUrl = imageUrls[0];
  if (imageUrls[1]) product.imageUrl2 = imageUrls[1];
  if (imageUrls[2]) product.imageUrl3 = imageUrls[2];
  sheet.getRange(row,1,1,PRODUCT_HEADERS.length).setValues([[product.productId,product.productName,product.brand,product.category,product.description,product.rp,product.mrp,product.stock,product.imageUrl,product.status,product.warranty,product.color,product.featured,product.imageUrl2,product.imageUrl3]]);
  invalidateProductCache_();
  return {success:true,ok:true,updated:true,id:product.productId,message:'Product updated successfully.',product:product};
}

function addProduct(data) {
  requireAdmin(data.pin);
  const product = managerProductToProduct(data);
  if (!product.productId) product.productId = generateProductId();
  validateProductData(product);
  const sheet = getSheet(PRODUCTS_SHEET);
  if (findProductRow(sheet,product.productId)!==-1) throw new Error('Product ID already exists.');
  const imageUrls = uploadManagerImages(data,product.productId);
  if (imageUrls[0]) product.imageUrl=imageUrls[0];
  if (imageUrls[1]) product.imageUrl2=imageUrls[1];
  if (imageUrls[2]) product.imageUrl3=imageUrls[2];
  sheet.appendRow([product.productId,product.productName,product.brand,product.category,product.description,product.rp,product.mrp,product.stock,product.imageUrl,product.status,product.warranty,product.color,product.featured,product.imageUrl2,product.imageUrl3]);
  invalidateProductCache_();
  return {success:true,ok:true,updated:false,id:product.productId,message:'Product added successfully.',product:product};
}

function deleteProduct(data) {
  requireAdmin(data.pin);
  const id=String(data.productId||'').trim();
  if(!id) throw new Error('Product ID is required.');
  const sheet=getSheet(PRODUCTS_SHEET),row=findProductRow(sheet,id);
  if(row===-1) throw new Error('Product not found.');
  sheet.deleteRow(row); invalidateProductCache_();
  return {success:true,ok:true,message:'Product deleted successfully.'};
}

function managerProductToProduct(data) {
  const stockRaw=String(data.stock??'').trim();
  let stock=Number(data.stock);
  if(stockRaw.toLowerCase()==='out of stock') stock=0;
  else if(stockRaw.toLowerCase()==='in stock'&&!Number.isFinite(stock)) stock=1;
  return {
    productId:String(data.id||data.productId||'').trim(),productName:String(data.name||data.productName||'').trim(),brand:String(data.brand||'').trim(),category:String(data.category||'').trim(),description:String(data.description||'').trim(),
    rp:Number(data.price??data.rp??0),mrp:Number(data.mrp??0),stock:Number.isFinite(stock)?stock:0,imageUrl:String(data.imageUrl||'').trim(),status:data.active===false||String(data.active).toLowerCase()==='false'?'Inactive':'Active',
    warranty:String(data.warranty||'').trim(),color:String(data.color||'').trim(),featured:data.featured===true||String(data.featured).toLowerCase()==='true',imageUrl2:String(data.imageUrl2||'').trim(),imageUrl3:String(data.imageUrl3||'').trim()
  };
}
function validateProductData(p) {
  if(!p.productId) throw new Error('Product ID is required.');
  if(!p.productName) throw new Error('Product name is required.');
  if(!p.category) throw new Error('Category is required.');
  if(!Number.isFinite(p.rp)||p.rp<0) throw new Error('Invalid RP / price.');
  if(!Number.isFinite(p.mrp)||p.mrp<0) throw new Error('Invalid MRP.');
  if(!Number.isFinite(p.stock)||p.stock<0) throw new Error('Invalid stock.');
}

/* ========================= IMAGES ========================== */
function getProductImageFolder() {
  const props=PropertiesService.getScriptProperties(); let folderId=props.getProperty('PRODUCT_IMAGE_FOLDER_ID');
  if(folderId){try{return DriveApp.getFolderById(folderId);}catch(_){}}
  const folders=DriveApp.getFoldersByName(PRODUCT_IMAGE_FOLDER_NAME); const folder=folders.hasNext()?folders.next():DriveApp.createFolder(PRODUCT_IMAGE_FOLDER_NAME);
  props.setProperty('PRODUCT_IMAGE_FOLDER_ID',folder.getId()); return folder;
}
function uploadManagerImages(data,productId){
  const urls=[]; [data.imageData,data.imageData2,data.imageData3].forEach((imageData,index)=>{if(imageData) urls[index]=uploadImageData(imageData,productId+'-'+(index+1));}); return urls;
}
function uploadProductImage(data){requireAdmin(data.pin);if(!data.imageData)throw new Error('No image received.');return {success:true,imageUrl:uploadImageData(data.imageData,String(data.productId||'PRODUCT'))};}
function uploadImageData(imageData,namePrefix){
  const folder=getProductImageFolder(),parts=String(imageData).split(','); if(parts.length!==2)throw new Error('Invalid image data.');
  const match=parts[0].match(/data:(.*?);base64/); if(!match)throw new Error('Invalid image format.');
  const mimeType=match[1],allowed=['image/jpeg','image/jpg','image/png','image/webp','image/gif']; if(!allowed.includes(mimeType))throw new Error('Unsupported image format.');
  const bytes=Utilities.base64Decode(parts[1]); if(bytes.length>5*1024*1024)throw new Error('Image is too large. Maximum size is 5 MB.');
  const safePrefix=String(namePrefix||'PRODUCT').replace(/[^a-zA-Z0-9_-]/g,'')||'PRODUCT';
  const file=folder.createFile(Utilities.newBlob(bytes,mimeType,safePrefix+'-'+Date.now()+getImageExtension(mimeType)));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w1000';
}
function getImageExtension(mimeType){return {'image/jpeg':'.jpg','image/jpg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'}[mimeType]||'.jpg';}

/* =========================== ORDERS ======================== */
function normalizeBdPhone_(value){let v=String(value||'').replace(/[\s()-]/g,'');if(/^\+?88/.test(v))v=v.replace(/^\+?88/,'');return v;}
function createOrder(data){
  const lock=LockService.getScriptLock(); lock.waitLock(25000);
  try{
    const items=parseItems(data.items); if(!items.length)throw new Error('No products in order.');
    const customerName=safeCellText_(String(data.customerName||data.name||'').trim());
    const phone=normalizeBdPhone_(data.phone);
    const address=safeCellText_(String(data.address||'').trim());
    const deliveryArea=String(data.deliveryArea||'').trim(); const payment=String(data.payment||'COD').trim();
    const transactionId=safeCellText_(String(data.transactionId||'').trim()); const clientReference=safeCellText_(String(data.clientReference||'').trim());
    if(!customerName)throw new Error('Customer name is required.');
    if(!/^01[3-9]\d{8}$/.test(phone))throw new Error('Enter a valid Bangladesh mobile number.');
    if(!address)throw new Error('Delivery address is required.');
    if(!['Inside Chattogram City','Outside Chattogram'].includes(deliveryArea))throw new Error('Invalid delivery area.');
    if(!['COD','bKash','Nagad'].includes(payment))throw new Error('Invalid payment method.');
    if(payment!=='COD'&&!transactionId)throw new Error('Transaction ID is required for bKash/Nagad.');

    const ordersSheet=getSheet(ORDERS_SHEET); ensureHeaders(ordersSheet,ORDER_HEADERS);
    if(clientReference){
      const last=ordersSheet.getLastRow();
      if(last>=2){const refs=ordersSheet.getRange(2,14,last-1,1).getDisplayValues().flat();const idx=refs.findIndex(v=>String(v).trim()===clientReference);if(idx>=0){const row=ordersSheet.getRange(idx+2,1,1,ORDER_HEADERS.length).getValues()[0];return {success:true,duplicate:true,orderId:String(row[0]),subtotal:Number(row[6]||0),deliveryFee:Number(row[7]||0),total:Number(row[8]||0)};}}
    }

    const productsSheet=getSheet(PRODUCTS_SHEET); let subtotal=0; const orderProducts=[];
    items.forEach(item=>{
      const id=String(item.id||item.productId||'').trim();const qty=Number(item.quantity||item.qty||0);if(!id)throw new Error('Product ID missing.');if(!Number.isInteger(qty)||qty<=0)throw new Error('Invalid quantity.');
      const row=findProductRow(productsSheet,id);if(row===-1)throw new Error('Product not found: '+id);
      const p=rowToProduct(productsSheet.getRange(row,1,1,PRODUCT_HEADERS.length).getValues()[0]);if(String(p.status).toLowerCase()!=='active')throw new Error(p.productName+' is unavailable.');if(Number(p.stock)<qty)throw new Error('Not enough stock for '+p.productName+'. Only '+Number(p.stock)+' left.');
      const price=Number(p.rp||0),lineTotal=price*qty;subtotal+=lineTotal;orderProducts.push({row,productId:p.productId,productName:p.productName,quantity:qty,price,stock:Number(p.stock),lineTotal});
    });
    const deliveryFee=calculateDeliveryFee(deliveryArea,orderProducts,subtotal),total=subtotal+deliveryFee;
    orderProducts.forEach(item=>productsSheet.getRange(item.row,8).setValue(item.stock-item.quantity));
    invalidateProductCache_();
    const orderId=generateOrderId();
    const productText=orderProducts.map(item=>safeCellText_(item.productName+' x'+item.quantity+' @ '+item.price)).join(' | ');
    ordersSheet.appendRow([safeCellText_(orderId),new Date(),customerName,phone,address,productText,subtotal,deliveryFee,total,safeCellText_(payment),'Pending',safeCellText_(deliveryArea),transactionId,clientReference]);
    notifyNewOrder_(orderId,{customerName,phone,address,deliveryArea,payment,transactionId},orderProducts,subtotal,deliveryFee,total);
    return {success:true,orderId,subtotal,deliveryFee,total,items:orderProducts.map(item=>({id:item.productId,name:item.productName,qty:item.quantity,price:item.price}))};
  }finally{lock.releaseLock();}
}
function calculateDeliveryFee(area,orderProducts,subtotal){const count=orderProducts.reduce((s,i)=>s+Number(i.quantity||0),0);if(area==='Inside Chattogram City'){const unitPrices=[];orderProducts.forEach(i=>{for(let n=0;n<i.quantity;n++)unitPrices.push(Number(i.price||0));});const over1900=unitPrices.some(v=>v>1900);const over1000Count=unitPrices.filter(v=>v>1000).length;return count>=2&&(over1900||over1000Count>=2)?0:50;}return count>=2&&subtotal>6890?0:120;}

function notifyNewOrder_(orderId,customer,items,subtotal,deliveryFee,total){
  const settings=readSettings_(); const email=String(settings['Store Email']||'').trim(); if(!email)return;
  const body=['New FLASH GEAR BD order','',`Order ID: ${orderId}`,`Customer: ${customer.customerName}`,`Phone: ${customer.phone}`,`Address: ${customer.address}`,`Delivery: ${customer.deliveryArea}`,`Payment: ${customer.payment}`,customer.transactionId?`Transaction ID: ${customer.transactionId}`:'', '', 'Products:', ...items.map(i=>`- ${i.productName} × ${i.quantity} @ ৳${i.price}`), '',`Subtotal: ৳${subtotal}`,`Delivery: ৳${deliveryFee}`,`Total: ৳${total}`].filter(Boolean).join('\n');
  try{MailApp.sendEmail({to:email,subject:`FLASH GEAR BD — New Order ${orderId}`,body});}catch(err){console.log('Order email failed: '+err.message);}
}

/* ===================== DASHBOARD / SETTINGS ===================== */
function getDashboard(){const products=getAllProducts_(true);let active=0,low=0,out=0;products.forEach(p=>{if(String(p.status).toLowerCase()==='active')active++;if(Number(p.stock)<=0)out++;else if(Number(p.stock)<=5)low++;});return {totalProducts:products.length,activeProducts:active,lowStock:low,outOfStock:out};}
function readSettings_(){const sheet=getSheet(SETTINGS_SHEET),last=sheet.getLastRow(),settings={};if(last>=2)sheet.getRange(2,1,last-1,2).getValues().forEach(r=>{const k=String(r[0]||'').trim();if(k)settings[k]=r[1];});return settings;}
function getPublicSettings(){const s=readSettings_();return {storeName:s['Store Name']||'FLASH GEAR BD',currency:s['Currency']||'BDT',whatsappNumber:String(s['WhatsApp Number']||'8801601093553'),announcement:s['Announcement']||'FLASH GEAR BD • Good Quality • Best Price • Reliable Service',bkashNumber:String(s['bKash Number']||''),nagadNumber:String(s['Nagad Number']||''),businessAddress:String(s['Business Address']||'Chattogram, Bangladesh'),businessHours:String(s['Business Hours']||'')};}

/* ============================ HELPERS ====================== */
function ensureHeaders(sheet,headers){if(sheet.getMaxColumns()<headers.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),headers.length-sheet.getMaxColumns());const current=sheet.getRange(1,1,1,headers.length).getValues()[0];let changed=false;headers.forEach((h,i)=>{if(String(current[i]||'').trim()!==h){current[i]=h;changed=true;}});if(changed)sheet.getRange(1,1,1,headers.length).setValues([current]);sheet.getRange(1,1,1,headers.length).setFontWeight('bold');}
function getSheet(name){const ss=SpreadsheetApp.openById(SPREADSHEET_ID),sheet=ss.getSheetByName(name);if(!sheet)throw new Error('Sheet not found: '+name);return sheet;}
function findProductRow(sheet,id){id=String(id||'').trim().toLowerCase();if(!id)return -1;const lastRow=sheet.getLastRow();if(lastRow<2)return -1;const ids=sheet.getRange(2,1,lastRow-1,1).getDisplayValues();for(let i=0;i<ids.length;i++)if(String(ids[i][0]||'').trim().toLowerCase()===id)return i+2;return -1;}
function rowToProduct(row){return {productId:String(row[0]||'').trim(),productName:String(row[1]||'').trim(),brand:String(row[2]||'').trim(),category:String(row[3]||'').trim(),description:String(row[4]||'').trim(),rp:Number(row[5]||0),mrp:Number(row[6]||0),stock:Number(row[7]||0),imageUrl:String(row[8]||'').trim(),status:String(row[9]||'Active').trim(),warranty:String(row[10]||'').trim(),color:String(row[11]||'').trim(),featured:Boolean(row[12]),imageUrl2:String(row[13]||'').trim(),imageUrl3:String(row[14]||'').trim()};}
function generateProductId(){const sheet=getSheet(PRODUCTS_SHEET);let number=Math.max(0,sheet.getLastRow()-1)+1,id;do{id='FG-'+String(number).padStart(4,'0');number++;}while(findProductRow(sheet,id)!==-1);return id;}
function generateOrderId(){const stamp=Utilities.formatDate(new Date(),'Asia/Dhaka','yyyyMMdd-HHmmss');return 'FG-'+stamp+'-'+Math.floor(1000+Math.random()*9000);}
function parseItems(items){if(typeof items==='string'){try{items=JSON.parse(items);}catch(_){throw new Error('Invalid order items.');}}if(!Array.isArray(items))throw new Error('Invalid order items.');return items;}
function safeCellText_(value){const s=String(value??'');return /^[=+\-@]/.test(s)?"'"+s:s;}
function invalidateProductCache_(){try{CacheService.getScriptCache().remove(PRODUCT_CACHE_KEY);}catch(_){} }
function secureHash_(pin,salt){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(salt)+'|'+String(pin));return bytes.map(b=>(b<0?b+256:b).toString(16).padStart(2,'0')).join('');}
function randomPin_(){return String(Math.floor(10000000+Math.random()*90000000));}
function ensureAdminPin_(){const props=PropertiesService.getScriptProperties();if(props.getProperty('ADMIN_PIN_HASH'))return {created:false,pin:''};const pin=randomPin_(),salt=Utilities.getUuid();props.setProperties({'ADMIN_PIN_SALT':salt,'ADMIN_PIN_HASH':secureHash_(pin,salt),'ADMIN_FAIL_COUNT':'0','ADMIN_LOCK_UNTIL':'0'});return {created:true,pin};}
function requireAdmin(pin){const props=PropertiesService.getScriptProperties(),lockUntil=Number(props.getProperty('ADMIN_LOCK_UNTIL')||0);if(lockUntil>Date.now())throw new Error('Too many failed PIN attempts. Try again later.');const salt=props.getProperty('ADMIN_PIN_SALT'),hash=props.getProperty('ADMIN_PIN_HASH');if(!salt||!hash)throw new Error('Admin PIN is not configured. Run setupStore() once.');const supplied=secureHash_(String(pin||''),salt);if(supplied!==hash){const fails=Number(props.getProperty('ADMIN_FAIL_COUNT')||0)+1;if(fails>=ADMIN_FAIL_LIMIT){props.setProperties({'ADMIN_FAIL_COUNT':'0','ADMIN_LOCK_UNTIL':String(Date.now()+ADMIN_LOCK_SECONDS*1000)});throw new Error('Too many failed PIN attempts. Try again later.');}props.setProperty('ADMIN_FAIL_COUNT',String(fails));throw new Error('Invalid admin PIN.');}props.setProperties({'ADMIN_FAIL_COUNT':'0','ADMIN_LOCK_UNTIL':'0'});}
function jsonResponse(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}

function sitemap_(){const base='https://gear.flashgearbd.workers.dev/';const urls=['','products.html','warranty.html','delivery.html','contact.html','returns-refunds.html','privacy.html'];const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+base+u+'</loc></url>').join('')+'</urlset>';return ContentService.createTextOutput(xml).setMimeType(ContentService.MimeType.XML);}
