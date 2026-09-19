const SPREADSHEET_ID = '1NN14H7-mlcQeNQw4VLBpg0vjETmQCrwUPQo4lbN9Lh0';
const SHEET_NAME = 'Products';
const SETTINGS_SHEET = 'Settings';
const ORDERS_SHEET = 'Orders';
const DRIVE_FOLDER_NAME = 'FLASH GEAR BD Product Images';
const ADMIN_PIN = '583741926';
const CACHE_KEY = 'fg_products_v6';
const CACHE_TTL = 300; // 5 minutes

function getSheet_(){
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet=ss.getSheetByName(SHEET_NAME);
  if(!sheet) throw new Error('Products sheet not found.');
  return sheet;
}
function getSettings_(){
  return {announcement:getSetting_('Announcement','FLASH GEAR BD • Original Products • Fair Price • WhatsApp Ordering')};
}
function doGet(e){
  if(e&&e.parameter&&e.parameter.admin==='1') return HtmlService.createHtmlOutputFromFile('product-manager').setTitle('FLASH GEAR BD — Product Manager').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  if(e&&e.parameter&&e.parameter.sitemap==='1') return sitemap_();
  if(e&&e.parameter&&e.parameter.meta==='1') return json(getSettings_());
  const cache=CacheService.getScriptCache();
  const cached=cache.get(CACHE_KEY);
  if(cached) return json(JSON.parse(cached));
  const payload={products:readProducts_(),announcement:getSettings_().announcement};
  try{cache.put(CACHE_KEY,JSON.stringify(payload),CACHE_TTL);}catch(e){}
  return json(payload);
}
function readProducts_(){
  const sheet=getSheet_(),values=sheet.getDataRange().getDisplayValues();
  if(values.length<2)return [];
  const headers=values[0].map(h=>String(h).trim());
  return values.slice(1).filter(r=>r.some(c=>String(c).trim()!=='')).map(row=>{
    const o={};headers.forEach((h,i)=>o[h]=String(row[i]??'').trim());
    const field=(...names)=>{for(const name of names){const key=headers.find(h=>String(h).trim().toLowerCase()===String(name).toLowerCase());if(key&&String(o[key]||'').trim())return String(o[key]).trim();}return '';};
    const active=String(field('Active')).toLowerCase();
    if(active&&!['yes','true','1','active'].includes(active))return null;
    return {id:field('Product ID'),name:field('Product Name'),category:field('Category')||'Gadgets',brand:field('Brand'),price:number(field('Price')),mrp:number(field('MRP')),stock:field('Stock')||'In Stock',warranty:field('Warranty'),image:field('Image URL'),image2:field('Image 2'),image3:field('Image 3'),description:field('Description'),color:field('Color','Colour'),featured:['yes','true','1'].includes(String(field('Featured')).toLowerCase())};
  }).filter(Boolean);
}
function getSetting_(key,fallback){try{const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);if(!sh)return fallback;const v=sh.getDataRange().getDisplayValues();for(let i=1;i<v.length;i++)if(String(v[i][0]).trim().toLowerCase()===String(key).toLowerCase())return String(v[i][1]||fallback).trim()||fallback;}catch(e){}return fallback;}
function saveProduct(form){
  if(!form||String(form.pin||'')!==ADMIN_PIN)throw new Error('Incorrect PIN.');
  const sheet=getSheet_();
  let headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].map(h=>String(h).trim());
  const required=['Product ID','Product Name','Category','Brand','Price','MRP','Stock','Warranty','Image URL','Description','Featured','Active'];
  const missing=required.filter(h=>!headers.includes(h));
  if(missing.length)throw new Error('Missing columns: '+missing.join(', '));
  const ensureColumn=(name)=>{if(!headers.some(h=>h.toLowerCase()===name.toLowerCase())){sheet.getRange(1,headers.length+1).setValue(name);headers.push(name);}};
  ensureColumn('Colour'); ensureColumn('Image 2'); ensureColumn('Image 3');
  if(!String(form.name||'').trim())throw new Error('Product name is required.');
  if(!String(form.category||'').trim())throw new Error('Category is required.');
  const id=String(form.id||'').trim()||createProductId_(form.name);
  const lastRow=sheet.getLastRow();
  const idCol=headers.findIndex(h=>h.toLowerCase()==='product id'.toLowerCase())+1;
  let existingRow=0;
  if(idCol&&lastRow>1){const ids=sheet.getRange(2,idCol,lastRow-1,1).getDisplayValues().flat();const idx=ids.findIndex(v=>String(v).trim().toLowerCase()===id.toLowerCase());if(idx>=0)existingRow=idx+2;}
  const existing=existingRow?sheet.getRange(existingRow,1,1,headers.length).getDisplayValues()[0]:[];
  const oldByHeader={};headers.forEach((h,i)=>oldByHeader[h]=existing[i]||'');
  let imageUrl=String(form.imageUrl||'').trim()||oldByHeader['Image URL']||'';
  let image2=oldByHeader['Image 2']||'';
  let image3=oldByHeader['Image 3']||'';
  if(form.imageData&&String(form.imageData).includes(','))imageUrl=saveImage_(form.imageData,form.imageName||'product.webp');
  if(form.imageData2&&String(form.imageData2).includes(','))image2=saveImage_(form.imageData2,form.imageName2||'product-2.webp');
  if(form.imageData3&&String(form.imageData3).includes(','))image3=saveImage_(form.imageData3,form.imageName3||'product-3.webp');
  const values={'Product ID':id,'Product Name':String(form.name||'').trim(),'Category':String(form.category||'').trim(),'Brand':String(form.brand||'').trim(),'Price':cleanNumber_(form.price),'MRP':cleanNumber_(form.mrp),'Stock':String(form.stock||'In Stock').trim(),'Warranty':String(form.warranty||'').trim(),'Image URL':imageUrl,'Image 2':image2,'Image 3':image3,'Description':String(form.description||'').trim(),'Featured':form.featured?'Yes':'No','Active':form.active===false?'No':'Yes','Colour':String(form.color||'').trim()};
  const row=headers.map(h=>values[h]!==undefined?values[h]:(oldByHeader[h]||''));
  if(existingRow) sheet.getRange(existingRow,1,1,headers.length).setValues([row]);
  else sheet.getRange(sheet.getLastRow()+1,1,1,headers.length).setValues([row]);
  CacheService.getScriptCache().remove(CACHE_KEY);
  return {ok:true,id,imageUrl,updated:Boolean(existingRow)};
}
function doPost(e){
  try{
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(body.type==='search'){return json({ok:true});}
    if(body.type!=='order')return json({ok:false,error:'Unknown request'});
    const ss=SpreadsheetApp.openById(SPREADSHEET_ID);let sh=ss.getSheetByName(ORDERS_SHEET);
    if(!sh){sh=ss.insertSheet(ORDERS_SHEET);sh.appendRow(['Order ID','Timestamp','Name','Phone','Address','Delivery Area','Payment','Transaction ID','Items','Subtotal','Delivery Fee','Total','Status']);}
    const orderId='FG-'+String(Math.floor(Math.random()*9000)+1000);
    const items=Array.isArray(body.items)?body.items:[];const subtotal=Number(body.subtotal||0);const fee=Number(body.deliveryFee||0);const total=Number(body.total||subtotal+fee);
    sh.appendRow([orderId,new Date(),String(body.name||''),String(body.phone||''),String(body.address||''),String(body.deliveryArea||''),String(body.payment||''),String(body.transactionId||''),JSON.stringify(items),subtotal,fee,total,'New']);
    return json({ok:true,orderId});
  }catch(err){return json({ok:false,error:String(err&&err.message||err)});}
}
function sitemap_(){
  const base='https://gear.flashgearbd.workers.dev/product.html?id=';const products=readProducts_();let xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';products.forEach(p=>{if(p.id)xml+='<url><loc>'+xmlEscape_(base+encodeURIComponent(p.id))+'</loc></url>';});xml+='</urlset>';return ContentService.createTextOutput(xml).setMimeType(ContentService.MimeType.XML);
}
function xmlEscape_(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function saveImage_(dataUrl,originalName){const m=String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);if(!m)throw new Error('Invalid image data.');const bytes=Utilities.base64Decode(m[2]);const mime=m[1]||'image/webp';const ext=mime.includes('png')?'png':mime.includes('jpeg')||mime.includes('jpg')?'jpg':'webp';const safe=String(originalName||'product').replace(/[^a-zA-Z0-9._-]/g,'_').replace(/\.[^.]+$/,'');const blob=Utilities.newBlob(bytes,mime,safe+'_'+Date.now()+'.'+ext);const folder=getOrCreateFolder_();const file=folder.createFile(blob);file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);return 'https://drive.google.com/uc?export=view&id='+file.getId();}
function getOrCreateFolder_(){const fs=DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);return fs.hasNext()?fs.next():DriveApp.createFolder(DRIVE_FOLDER_NAME);}
function createProductId_(name){const base=String(name||'PRODUCT').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)||'PRODUCT';return base+'-'+Utilities.getUuid().slice(0,8).toUpperCase();}
function cleanNumber_(v){const n=Number(String(v||'').replace(/[^0-9.]/g,''));return isNaN(n)?0:n;}
function number(v){const n=Number(String(v).replace(/[৳,\s]/g,''));return isNaN(n)?0:n;}
function json(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
