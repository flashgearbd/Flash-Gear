const SPREADSHEET_ID = '1NN14H7-mlcQeNQw4VLBpg0vjETmQCrwUPQo4lbN9Lh0';
const SHEET_NAME = 'Products';
const SETTINGS_SHEET = 'Settings';
const DRIVE_FOLDER_NAME = 'FLASH GEAR BD Product Images';
const ADMIN_PIN = '583741926';

function getSheet_(){
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet=ss.getSheetByName(SHEET_NAME);
  if(!sheet) throw new Error('Products sheet not found.');
  return sheet;
}
function doGet(e){
  if(e&&e.parameter&&e.parameter.admin==='1') return HtmlService.createHtmlOutputFromFile('product-manager').setTitle('FLASH GEAR BD — Product Manager').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  if(e&&e.parameter&&e.parameter.meta==='1') return json({announcement:getSetting_('Announcement','FLASH GEAR BD • Original Products • Fair Price • WhatsApp Ordering')});
  const sheet=getSheet_(),values=sheet.getDataRange().getDisplayValues();
  if(values.length<2)return json([]);
  const headers=values[0].map(h=>String(h).trim());
  const products=values.slice(1).filter(r=>r.some(c=>String(c).trim()!=='')).map(row=>{
    const o={};headers.forEach((h,i)=>o[h]=String(row[i]??'').trim());
    const active=String(o.Active||'').toLowerCase();if(active&&!['yes','true','1','active'].includes(active))return null;
    return {id:o['Product ID']||'',name:o['Product Name']||'',category:o['Category']||'Gadgets',brand:o['Brand']||'',price:number(o['Price']),mrp:number(o['MRP']),stock:o['Stock']||'In Stock',warranty:o['Warranty']||'',image:o['Image URL']||'',description:o['Description']||'',color:o['Color']||o['Colour']||'',featured:['yes','true','1'].includes(String(o['Featured']).toLowerCase())};
  }).filter(Boolean);
  return json(products);
}
function getSetting_(key,fallback){try{const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);if(!sh)return fallback;const v=sh.getDataRange().getDisplayValues();for(let i=1;i<v.length;i++)if(String(v[i][0]).trim().toLowerCase()===String(key).toLowerCase())return String(v[i][1]||fallback).trim()||fallback;}catch(e){}return fallback;}
function saveProduct(form){
  if(!form||String(form.pin||'')!==ADMIN_PIN)throw new Error('Incorrect PIN.');
  const sheet=getSheet_();
  let headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].map(h=>String(h).trim());
  const required=['Product ID','Product Name','Category','Brand','Price','MRP','Stock','Warranty','Image URL','Description','Featured','Active'];
  const missing=required.filter(h=>!headers.includes(h));
  if(missing.length)throw new Error('Missing columns: '+missing.join(', '));
  // Add a Color column automatically for the new product-colour system.
  if(!headers.includes('Color')&&!headers.includes('Colour')){
    sheet.getRange(1,headers.length+1).setValue('Color');
    headers.push('Color');
  }
  if(!String(form.name||'').trim())throw new Error('Product name is required.');
  if(!String(form.category||'').trim())throw new Error('Category is required.');
  let imageUrl=String(form.imageUrl||'').trim();
  if(form.imageData&&String(form.imageData).includes(','))imageUrl=saveImage_(form.imageData,form.imageName||'product.webp');
  const id=String(form.id||'').trim()||createProductId_(form.name);
  const values={
    'Product ID':id,
    'Product Name':String(form.name||'').trim(),
    'Category':String(form.category||'').trim(),
    'Brand':String(form.brand||'').trim(),
    'Price':cleanNumber_(form.price),
    'MRP':cleanNumber_(form.mrp),
    'Stock':String(form.stock||'In Stock').trim(),
    'Warranty':String(form.warranty||'').trim(),
    'Image URL':imageUrl,
    'Description':String(form.description||'').trim(),
    'Featured':form.featured?'Yes':'No',
    'Active':form.active===false?'No':'Yes',
    'Color':String(form.color||'').trim(),
    'Colour':String(form.color||'').trim()
  };
  sheet.appendRow(headers.map(h=>values[h]??''));
  return {ok:true,id,imageUrl};
}
function saveImage_(dataUrl,originalName){const m=String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);if(!m)throw new Error('Invalid image data.');const bytes=Utilities.base64Decode(m[2]);const mime=m[1]||'image/webp';const ext=mime.includes('png')?'png':mime.includes('jpeg')||mime.includes('jpg')?'jpg':'webp';const safe=String(originalName||'product').replace(/[^a-zA-Z0-9._-]/g,'_').replace(/\.[^.]+$/,'');const blob=Utilities.newBlob(bytes,mime,safe+'_'+Date.now()+'.'+ext);const folder=getOrCreateFolder_();const file=folder.createFile(blob);file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);return 'https://drive.google.com/uc?export=view&id='+file.getId();}
function getOrCreateFolder_(){const fs=DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);return fs.hasNext()?fs.next():DriveApp.createFolder(DRIVE_FOLDER_NAME);}
function createProductId_(name){const base=String(name||'PRODUCT').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)||'PRODUCT';return base+'-'+Utilities.getUuid().slice(0,8).toUpperCase();}
function cleanNumber_(v){const n=Number(String(v||'').replace(/[^0-9.]/g,''));return isNaN(n)?0:n;}
function number(v){const n=Number(String(v).replace(/[৳,\s]/g,''));return isNaN(n)?0:n;}
function json(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
