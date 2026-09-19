
/* FLASH GEAR BD — lightweight premium touch layer */
(function(){
  const interactive='button,a,[role="button"],.clickable,.category-pill,.suggest-item,.cart-item';
  const clear=e=>{const t=e.target?.closest?.(interactive);if(t)t.classList.remove('fgbd-touching')};
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const t=e.target.closest?.(interactive);if(!t)return;
    t.classList.add('fgbd-touching');
  },{passive:true});
  document.addEventListener('pointerup',clear,{passive:true});
  document.addEventListener('pointercancel',clear,{passive:true});
  document.addEventListener('pointerout',e=>{if(e.relatedTarget)clear(e)},{passive:true});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const t=e.target.closest?.(interactive);if(!t)return;
    t.classList.add('fgbd-touching');
    setTimeout(()=>t.classList.remove('fgbd-touching'),110);
  });
  let ticking=false;
  const update=()=>{document.querySelector('.header')?.classList.toggle('scrolled',window.scrollY>8);ticking=false};
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
})();

const CONFIG = {
  productsApiUrl: "https://script.google.com/macros/s/AKfycbyRvlz1Dhm6vyQHk554YZ_8k-jfkpPgbmtSuh2WqWuKRScDI49yWVt1E6xYMWNKlSg9/exec",
  whatsappNumber: "8801601093553",
  facebook: "https://www.facebook.com/share/1HyzxwuCR8/",
  instagram: "https://www.instagram.com/flashgearbd/",
  tiktok: "#",
  youtube: "#",
  fallbackProducts: [],
  imageCdnBase: ""
};

const CATEGORY_LIST = [
  "Feature Phone","Mobile Phones","Adapter & Cable","Charger","Earbud","Headphone",
  "Neckband","Earphone","Speaker","Powerbank","Smart watch","Tripod","Boya",
  "Screen Protector","Phone Case"
];

const CATEGORY_ICONS = {
  "Feature Phone":"☎","Mobile Phones":"▯","Adapter & Cable":"⌁","Charger":"✧",
  "Earbud":"◉","Headphone":"◖◗","Neckband":"⌁","Earphone":"♬","Speaker":"◉",
  "Powerbank":"▰","Smart watch":"◷","Tripod":"♜","Boya":"●","Screen Protector":"▱","Phone Case":"▣"
};

const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
function driveId(v){const u=String(v||'').trim();const m=u.match(/drive\.google\.com\/(?:uc\?(?:[^#]*?&)?id=|file\/d\/|open\?id=)([A-Za-z0-9_-]+)/)||u.match(/[?&]id=([A-Za-z0-9_-]+)/);return m?m[1]:'';}
function imageUrl(v){const u=String(v||'').trim();if(!u)return '';const id=driveId(u);if(id){if(CONFIG.imageCdnBase)return CONFIG.imageCdnBase.replace(/\/$/,'')+'/'+encodeURIComponent(id);return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;}return u;}
function imageRetryAttrs(raw){const original=String(raw||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');const id=driveId(raw);const primary=imageUrl(raw).replace(/&/g,'&amp;').replace(/"/g,'&quot;');return `data-original-src="${original}" data-drive-id="${id}" data-retry-src="${primary}" onerror="fgImageRetry(this)"`;}
function fgImageRetry(img){if(!img||img.dataset.retryDone==='1')return;img.dataset.retryDone='1';const id=img.dataset.driveId||driveId(img.dataset.originalSrc||'');if(id){img.src=`https://drive.google.com/uc?export=view&id=${id}`;img.onerror=()=>{img.onerror=null;const ph=img.nextElementSibling;if(ph)ph.hidden=false;img.classList.add('img-broken');};return;}const original=img.dataset.originalSrc||'';if(original&&img.src!==original){img.src=original;return;}img.classList.add('img-broken');const ph=img.nextElementSibling;if(ph)ph.hidden=false;}
function wa(name=""){const t=name?`Hello FLASH GEAR BD, I want to order: ${name}`:`Hello FLASH GEAR BD, I want to know about your products.`;return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(t)}`;}
function buildWaOrder(items, customer={}){const lines=items.map(i=>`• ${i.name} × ${i.qty} — ${money(i.price*i.qty)}`);const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);const fee=Number(customer.deliveryFee||0);const total=subtotal+fee;const details=[customer.name&&`Name: ${customer.name}`,customer.phone&&`Phone: ${customer.phone}`,customer.address&&`Address: ${customer.address}`,customer.deliveryArea&&`Delivery Area: ${customer.deliveryArea}`,customer.payment&&`Payment: ${customer.payment}`,customer.transactionId&&`Transaction ID: ${customer.transactionId}`].filter(Boolean);return `Hello FLASH GEAR BD, I want to confirm my order:\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal)}\nDelivery: ${money(fee)}\nTotal: ${money(total)}${details.length?'\n\n'+details.join('\n'):''}`;}
function waCart(items,customer={}){return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWaOrder(items,customer))}`;}
async function syncCartPrices(timeoutMs=2500){
  const current=getCart();
  if(!current.length)return [];
  try{
    const fresh=await Promise.race([fetchProducts(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('sync-timeout')),timeoutMs))]);
    if(Array.isArray(fresh)&&fresh.length){
      const map=new Map(fresh.map(p=>[String(p.id),p]));
      const c=current.map(i=>{const p=map.get(String(i.id));return p?{...i,name:p.name,price:Number(p.price||0)}:null;}).filter(Boolean);
      saveCart(c);return c;
    }
  }catch{}
  return getCart();
}

function getCart(){try{return JSON.parse(localStorage.getItem("fg_cart")||"[]")}catch{return []}}
function saveCart(c){localStorage.setItem("fg_cart",JSON.stringify(c));updateCartUI()}
function addToCart(p,qty=1,sourceEl=null){const c=getCart(),x=c.find(i=>i.id===p.id);qty=Math.max(1,Number(qty)||1);if(x)x.qty+=qty;else c.push({id:p.id,name:p.name,price:Number(p.price||0),qty});saveCart(c);flyToCart(sourceEl);showCartAddedToast(p)}
function flyToCart(source){try{const img=source?.closest?.('.product-card,.detail-summary')?.querySelector?.('img')||document.querySelector('.detail-main-image');const cart=document.querySelector('[data-cart-open]');if(!img||!cart)return;const a=img.getBoundingClientRect(),b=cart.getBoundingClientRect();const clone=img.cloneNode(true);clone.className='fg-fly-img';clone.style.cssText=`left:${a.left}px;top:${a.top}px;width:${Math.min(96,a.width)}px;height:${Math.min(96,a.height)}px`;document.body.appendChild(clone);requestAnimationFrame(()=>{clone.style.transform=`translate(${b.left-a.left+b.width/2-Math.min(96,a.width)/2}px,${b.top-a.top+b.height/2-Math.min(96,a.height)/2}px) scale(.18)`;clone.style.opacity='0';});setTimeout(()=>clone.remove(),520)}catch{}}
function getRecentViewed(){try{return JSON.parse(localStorage.getItem('fg_recent_viewed')||'[]')}catch{return []}}
function rememberViewed(p){if(!p?.id)return;const list=getRecentViewed().filter(x=>String(x.id)!==String(p.id));list.unshift({id:p.id,name:p.name,price:p.price,mrp:p.mrp,stock:p.stock,brand:p.brand,category:p.category,image:p.image,featured:p.featured,color:p.color});localStorage.setItem('fg_recent_viewed',JSON.stringify(list.slice(0,10)));}

function showCheckoutError(message){
  let t=document.querySelector('#fgCheckoutError');
  if(!t){document.body.insertAdjacentHTML('beforeend',`<div id="fgCheckoutError" class="fg-checkout-error" role="alert"></div>`);t=document.querySelector('#fgCheckoutError');}
  t.textContent=message; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(window.FG_CHECKOUT_ERROR_TIMER); window.FG_CHECKOUT_ERROR_TIMER=setTimeout(()=>t.classList.remove('show'),2200);
}
function showCartAddedToast(p){
  let t=document.querySelector("#fgCartToast");
  if(!t){document.body.insertAdjacentHTML("beforeend",`<div id="fgCartToast" class="fg-cart-toast" role="status" aria-live="polite"><span>✓</span><div><strong>Added to cart</strong><small></small></div></div>`);t=document.querySelector("#fgCartToast");}
  const small=t.querySelector("small"); if(small) small.textContent=p?.name||"Product";
  t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  clearTimeout(window.FG_CART_TOAST_TIMER); window.FG_CART_TOAST_TIMER=setTimeout(()=>t.classList.remove("show"),1800);
}
function removeFromCart(id){saveCart(getCart().filter(i=>i.id!==id));openCart()}
function changeQty(id,d){const c=getCart(),x=c.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)return removeFromCart(id);saveCart(c);openCart()}
function clearCartAfterOrder(){localStorage.removeItem('fg_cart');['#checkoutName','#checkoutPhone','#checkoutAddress','#checkoutArea','#checkoutPayment','#checkoutTransaction'].forEach(sel=>{const el=document.querySelector(sel);if(el){if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';el.classList.remove('fg-phone-invalid','fg-input-error');}});const msg=document.querySelector('#checkoutPhoneError');if(msg){msg.hidden=true;msg.textContent='';}updateCartUI();updateCheckoutButtonState();}
function updateCartUI(){
  const c=getCart(),count=c.reduce((s,i)=>s+i.qty,0),subtotal=c.reduce((s,i)=>s+i.price*i.qty,0),fee=checkoutDeliveryFee(),total=subtotal+(c.length?fee:0);
  document.querySelectorAll("[data-cart-count]").forEach(e=>e.textContent=count);
  document.querySelectorAll("[data-cart-total]").forEach(e=>e.textContent=money(total));
  document.querySelectorAll("[data-cart-subtotal]").forEach(e=>e.textContent=money(subtotal));
  document.querySelectorAll("[data-cart-delivery]").forEach(e=>e.textContent=(c.length&&fee===0)?"FREE":money(c.length?fee:0));
  const b=document.querySelector("#cartBody");if(!b)return;
  if(!c.length){b.innerHTML=`<div class="cart-empty"><div><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i></div><h3>Your cart is empty</h3><p>Add a product to start your order.</p><a class="btn btn-blue" href="products.html">Browse Products</a></div>`;document.querySelector("#cartCheckout")?.setAttribute("hidden","");document.querySelector('#cartCheckoutSummary')?.setAttribute('hidden','');return;}
  document.querySelector("#cartCheckout")?.removeAttribute("hidden");document.querySelector('#cartCheckoutSummary')?.removeAttribute('hidden');
  b.innerHTML=c.map(i=>`<div class="cart-item"><div><strong>${escapeHtml(i.name)}</strong><span>${money(i.price)} each</span></div><div class="cart-item-actions"><button data-cart-minus="${escapeHtml(i.id)}" aria-label="Decrease ${escapeHtml(i.name)}">−</button><b>${i.qty}</b><button data-cart-plus="${escapeHtml(i.id)}" aria-label="Increase ${escapeHtml(i.name)}">+</button><button class="cart-remove" data-cart-remove="${escapeHtml(i.id)}" aria-label="Remove ${escapeHtml(i.name)}">×</button></div></div>`).join("");
  updateCheckoutButtonState();
}
function checkoutPhoneIsValid(v){return /^01\d{9}$/.test(String(v||'').replace(/\s+/g,''));}
function checkoutDeliveryFee(){
  const c=getCart(), count=c.reduce((s,i)=>s+Number(i.qty||0),0), subtotal=c.reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||0),0);
  const area=document.querySelector('#checkoutArea')?.value||'Inside Chattogram City';
  if(!c.length)return 0;
  if(area==='Inside Chattogram City'){
    const unitPrices=c.flatMap(i=>Array.from({length:Math.max(0,Number(i.qty||0))},()=>Number(i.price||0)));
    const over1900=unitPrices.some(v=>v>1900);
    const over1000Count=unitPrices.filter(v=>v>1000).length;
    return count>=2 && (over1900 || over1000Count>=2) ? 0 : 50;
  }
  return count>=2 && subtotal>6890 ? 0 : 120;
}
function checkoutFormIsValid(){const name=document.querySelector('#checkoutName')?.value.trim()||'';const phone=(document.querySelector('#checkoutPhone')?.value||'').replace(/\s+/g,'');const address=document.querySelector('#checkoutAddress')?.value.trim()||'';const payment=document.querySelector('#checkoutPayment')?.value||'';const tx=document.querySelector('#checkoutTransaction')?.value.trim()||'';return Boolean(name&&checkoutPhoneIsValid(phone)&&address&&payment&&((payment==='COD')||tx));}
function updateCheckoutButtonState(){const btn=document.querySelector('#cartCheckout');if(!btn)return;const valid=checkoutFormIsValid()&&getCart().length>0;btn.disabled=!valid;btn.setAttribute('aria-disabled',String(!valid));if(!valid&&btn.dataset.submitting!=='1')btn.textContent='Confirm Order on WhatsApp →';}
function toggleTransactionField(){const p=document.querySelector('#checkoutPayment'),tx=document.querySelector('#checkoutTransaction');if(!p||!tx)return;const show=p.value!=='COD';tx.hidden=!show;if(!show)tx.value='';}
function bindCheckoutValidation(){['#checkoutName','#checkoutPhone','#checkoutAddress','#checkoutArea','#checkoutPayment','#checkoutTransaction'].forEach(sel=>{const el=document.querySelector(sel);if(!el||el._fgCheckoutBound)return;el._fgCheckoutBound=true;['input','change'].forEach(ev=>el.addEventListener(ev,()=>{if(sel==='#checkoutPhone')validateCheckoutPhone(false);if(sel==='#checkoutPayment')toggleTransactionField();if(sel==='#checkoutArea')updateCartUI();updateCheckoutButtonState();}));});updateCheckoutButtonState();}
function validateCheckoutPhone(showError=true){const el=document.querySelector('#checkoutPhone');const msg=document.querySelector('#checkoutPhoneError');if(!el||!msg)return false;const value=el.value.replace(/\s+/g,'');el.value=value;const valid=checkoutPhoneIsValid(value);const hasInput=value.length>0;if(hasInput&&!valid){el.classList.add('fg-phone-invalid');msg.hidden=false;msg.textContent='Check Number — enter exactly 11 digits.';}else{el.classList.remove('fg-phone-invalid');msg.hidden=true;msg.textContent='';}if(showError&&hasInput&&!valid){el.focus();}return valid;}
function ensureCartDrawer(){if(document.querySelector("#cartDrawer")){bindCheckoutValidation();return;}document.body.insertAdjacentHTML("beforeend",`<div id="cartDrawer" class="cart-drawer" hidden><div class="cart-backdrop" data-close-cart></div><aside class="cart-panel"><div class="cart-head"><div><span class="eyebrow">YOUR ORDER</span><h2>Cart</h2></div><button class="drawer-close" data-close-cart aria-label="Close cart">×</button></div><div id="cartBody" class="cart-body"></div><div class="cart-checkout-form"><label class="sr-only" for="checkoutName">Name</label><input id="checkoutName" placeholder="Name" autocomplete="name" maxlength="80"><label class="sr-only" for="checkoutPhone">Phone</label><input id="checkoutPhone" name="fg-customer-phone" placeholder="Phone — 11 digits" inputmode="numeric" autocomplete="off" autocapitalize="none" maxlength="11" pattern="01[0-9]{9}" aria-describedby="checkoutPhoneError"><div id="checkoutPhoneError" class="fg-phone-error" role="alert" hidden></div><label class="sr-only" for="checkoutAddress">Address</label><input id="checkoutAddress" name="fg-delivery-address" placeholder="Delivery Address" autocomplete="street-address" maxlength="180"><label class="sr-only" for="checkoutArea">Delivery Area</label><select id="checkoutArea"><option value="Inside Chattogram City">Inside Chattogram City — ৳50</option><option value="Outside Chattogram">Outside Chattogram — ৳120</option></select><label class="sr-only" for="checkoutPayment">Payment</label><select id="checkoutPayment"><option value="COD">Cash on Delivery</option><option value="bKash">bKash</option><option value="Nagad">Nagad</option></select><input id="checkoutTransaction" placeholder="Transaction ID (bKash/Nagad only)" maxlength="60" autocomplete="off" hidden></div><div class="cart-foot"><div id="cartCheckoutSummary" class="cart-summary"><div><span>Subtotal</span><strong data-cart-subtotal>৳0</strong></div><div><span>Delivery</span><strong data-cart-delivery>৳0</strong></div></div><div class="cart-total"><span>Total</span><strong data-cart-total>৳0</strong></div><button id="cartCheckout" class="btn btn-blue btn-block" type="button" disabled aria-disabled="true">Confirm Order on WhatsApp →</button></div></aside></div>`);bindCheckoutValidation();updateCartUI()}
function openCart(){ensureCartDrawer();const d=document.querySelector("#cartDrawer");d.hidden=false;document.body.classList.add("drawer-open");requestAnimationFrame(()=>d.classList.add("is-open"));updateCartUI();syncCartPrices(1800).catch(()=>{});}
function closeCart(){const d=document.querySelector("#cartDrawer");if(!d)return;d.classList.remove("is-open");setTimeout(()=>{d.hidden=true},180);document.body.classList.remove("drawer-open")}

function openProductPage(p){
  if(!p || !p.id)return;
  closeSearchSuggestions();
  document.activeElement?.blur?.();
  try{const raw=JSON.stringify(p);sessionStorage.setItem('fg_open_product',raw);localStorage.setItem('fg_open_product_fast',raw);}catch{}
  const url='product.html?id='+encodeURIComponent(p.id);
  if(window.location.pathname.endsWith('/product.html') || window.location.pathname.endsWith('product.html')){
    history.pushState({productId:p.id},'',url);
    renderProductPage(p);
    window.scrollTo({top:0,behavior:'smooth'});
  }else{
    location.href=url;
  }
}


function setupRailSlider(trackId,prevSel,nextSel,interval=4400){const track=document.querySelector(trackId),viewport=track?.parentElement;if(!track||!viewport||track._railBound)return;track._railBound=true;const prev=document.querySelector(prevSel),next=document.querySelector(nextSel);let pos=0,timer=null,drag=false,moved=false,startX=0,startPos=0;const cards=()=>track.querySelectorAll('.product-card');const width=()=>{const c=track.querySelector('.product-card');return c?c.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||16):0};const max=()=>Math.max(0,cards().length-Math.max(1,Math.floor(viewport.clientWidth/(width()||1))));const apply=()=>track.style.transform=`translate3d(${-pos*(width()||1)}px,0,0)`;const move=d=>{const m=max();if(!m)return;pos+=d;if(pos>m)pos=0;if(pos<0)pos=m;track.style.transition='transform .48s cubic-bezier(.22,1,.36,1)';apply()};const stop=()=>{if(timer)clearInterval(timer);timer=null};const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const start=()=>{stop();if(reduce||document.hidden||drag)return;timer=setInterval(()=>move(1),interval)};prev?.addEventListener('click',()=>{move(-1);start()});next?.addEventListener('click',()=>{move(1);start()});viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag=true;moved=false;startX=e.clientX;startPos=pos;stop();track.style.transition='none';viewport.setPointerCapture?.(e.pointerId)},{passive:true});viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-startX;if(Math.abs(dx)>8)moved=true;const w=width();if(!w)return;pos=Math.max(0,Math.min(max(),startPos-dx/w));apply()},{passive:true});viewport.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-startX;drag=false;const w=width();if(Math.abs(dx)>=Math.max(34,w*.15))pos=startPos+(dx<0?1:-1);else pos=Math.round(pos);pos=Math.max(0,Math.min(max(),pos));track.style.transition='transform .48s cubic-bezier(.22,1,.36,1)';apply();if(moved)window.FG_SUPPRESS_CARD_CLICK_UNTIL=Date.now()+180;start()},{passive:true});viewport.addEventListener('pointercancel',()=>{drag=false;start()},{passive:true});viewport.addEventListener('mouseenter',stop);viewport.addEventListener('mouseleave',start);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('resize',()=>{pos=Math.max(0,Math.min(max(),Math.round(pos)));track.style.transition='none';apply()},{passive:true});setTimeout(start,700)}
function renderHomeRows(products=[]){const valid=Array.isArray(products)?products.filter(p=>p&&p.name):[];const newest=valid.slice().reverse().slice(0,10);const hot=valid.slice().sort((a,b)=>{const da=Number(a.mrp||0)>Number(a.price||0)?1-Number(a.price||0)/Number(a.mrp||1):0;const db=Number(b.mrp||0)>Number(b.price||0)?1-Number(b.price||0)/Number(b.mrp||1):0;return db-da}).slice(0,10);for(const [id,list] of [['#newArrivals',newest],['#hotDeals',hot]]){const el=document.querySelector(id);if(el){el._products=list;el.innerHTML=list.length?list.map((x,i)=>productCard(x,i)).join(''):'<div class="no-results">No products available yet.</div>';}}setupRailSlider('#newArrivals','[data-new-prev]','[data-new-next]',4700);setupRailSlider('#hotDeals','[data-hot-prev]','[data-hot-next]',3900)}
async function loadAnnouncement(){const el=document.querySelector('#announcementText');if(!el)return;if(window.FG_ANNOUNCEMENT){el.textContent=window.FG_ANNOUNCEMENT;return;}el.textContent=el.textContent||'FLASH GEAR BD • Original Products • Fair Price • WhatsApp Ordering';}
function setupAnnouncement(){const bar=document.querySelector('#announcementBar'),close=document.querySelector('#announcementClose');if(!bar)return;try{if(localStorage.getItem('fg_announcement_dismissed')==='1')bar.hidden=true;}catch{}close?.addEventListener('click',()=>{bar.hidden=true;try{localStorage.setItem('fg_announcement_dismissed','1')}catch{}});}
function showProductNotFound(){const root=document.querySelector('#productDetail');if(!root)return;root.innerHTML=`<div class="product-not-found"><div class="not-found-icon">⌕</div><h1>Product Not Found</h1><p>This product may have been removed or the link is no longer valid.</p><a class="btn btn-blue" href="products.html">Browse All Products</a></div>`;document.title='Product Not Found | FLASH GEAR BD';}
function updateProductSEO(p){if(!p)return;document.title=`${p.name} | FLASH GEAR BD`;let canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.href;let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}m.content=(p.description||`Buy ${p.name} from FLASH GEAR BD with clear pricing, warranty and WhatsApp ordering.`).slice(0,155);['og:title','og:description'].forEach((prop,i)=>{let el=document.querySelector(`meta[property=\"${prop}\"]`);if(!el){el=document.createElement('meta');el.setAttribute('property',prop);document.head.appendChild(el);}el.content=i===0?`${p.name} | FLASH GEAR BD`:m.content;});let og=document.querySelector('meta[property=\"og:image\"]');if(og)og.content=p.image?imageUrl(p.image):'hero-tech.webp';let tw=document.querySelector('meta[name=\"twitter:title\"]');if(tw)tw.content=`${p.name} | FLASH GEAR BD`;let td=document.querySelector('meta[name=\"twitter:description\"]');if(td)td.content=m.content;let ti=document.querySelector('meta[name=\"twitter:image\"]');if(ti)ti.content=p.image?imageUrl(p.image):'hero-tech.webp';let old=document.querySelector('#product-jsonld');if(old)old.remove();const ld=document.createElement('script');ld.type='application/ld+json';ld.id='product-jsonld';ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:p.name,brand:p.brand?{"@type":"Brand",name:p.brand}:undefined,offers:{"@type":"Offer",price:Number(p.price||0),priceCurrency:"BDT",availability:String(p.stock||'').toLowerCase()==='out of stock'?"https://schema.org/OutOfStock":"https://schema.org/InStock",url:location.href}});document.head.appendChild(ld);}
function renderProductPage(p){
  const root=document.querySelector('#productDetail'); if(!root||!p)return; updateProductSEO(p); rememberViewed(p);
  const price=Number(p.price||0), mrp=Number(p.mrp||0), discount=mrp>price?Math.round((1-price/mrp)*100):0;
  const isPhone=['Mobile Phones','Feature Phone'].includes(String(p.category||''));
  const label=isPhone?'Specifications':'Product Description';
  const imgs=[p.image,p.image2,p.image3].filter(Boolean);
  const main=p.image||'';
  const mainHtml=main?`<img id="detailMainImage" class="detail-main-image" src="${escapeHtml(imageUrl(main))}" alt="${escapeHtml(p.name||'Product')}" decoding="async" fetchpriority="high" ${imageRetryAttrs(main)}><span class="detail-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span>`:`<span class="detail-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span>`;
  root.innerHTML=`
    <div class="product-breadcrumb"><a href="index.html">Home</a><span>›</span><a href="products.html?cat=${encodeURIComponent(p.category||'')}">${escapeHtml(p.category||'Gadgets')}</a><span>›</span><strong>${escapeHtml(p.name||'Product')}</strong></div>
    <div class="detail-layout">
      <section class="detail-gallery"><div class="detail-image-shell">${mainHtml}</div>${imgs.length>1?`<div class="detail-thumbs" role="list">${imgs.map((src,i)=>`<button type="button" class="detail-thumb ${i===0?'active':''}" data-detail-image="${escapeHtml(src)}" aria-label="View image ${i+1}"><img src="${escapeHtml(imageUrl(src))}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>`:''}</section>
      <section class="detail-summary">
        <div class="product-kicker">${escapeHtml(p.category||'Gadgets')}</div><h1>${escapeHtml(p.name||'Product')}</h1>${p.brand?`<div class="detail-brand">${escapeHtml(p.brand)}</div>`:''}
        <div class="detail-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del><span class="save-pill">-${discount}%</span>`:''}</div>
        <div class="detail-stock"><span></span>${escapeHtml(p.stock||'In Stock')}</div>
        <div class="detail-meta">${p.brand?`<div><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>`:''}<div><span>Category</span><strong>${escapeHtml(p.category||'Gadgets')}</strong></div>${String(p.color||'').trim()?`<div class="detail-colour-row"><span>Colour</span><strong><i class="colour-dot" aria-hidden="true"></i>${escapeHtml(String(p.color).trim())}</strong></div>`:''}${p.warranty?`<div><span>Warranty</span><strong>${escapeHtml(p.warranty)}</strong></div>`:''}</div>
        <div class="detail-qty"><button type="button" data-detail-minus aria-label="Decrease quantity">−</button><input id="detailQty" value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-detail-plus aria-label="Increase quantity">+</button></div>
        <div class="detail-actions"><button class="btn btn-blue btn-large" data-add-product="${escapeHtml(p.id)}" ${String(p.stock).toLowerCase()==='out of stock'?'disabled':''}>Add to Cart</button><button class="btn btn-soft btn-large" data-buy-now="${escapeHtml(p.id)}" ${String(p.stock).toLowerCase()==='out of stock'?'disabled':''}>Buy Now</button></div>
        <div class="payment-trust"><span>bKash</span><span>Nagad</span><span>COD</span></div><a class="detail-wa-link" href="${wa(p.name)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp Order</a>
        <div class="detail-benefits"><span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Original</span><span><i class="fa-solid fa-rotate" aria-hidden="true"></i> Warranty</span><span><i class="fa-solid fa-truck-fast" aria-hidden="true"></i> Delivery</span><span><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Support</span></div>
      </section>
    </div>
    <section class="detail-info-card"><div class="detail-tabs"><button class="detail-tab active" type="button" data-detail-tab="info">${label}</button></div><div class="detail-tab-panel" id="detailInfoPanel">${escapeHtml(p.description||'Product information will be updated soon.').replace(/\n/g,'<br>')}</div></section>
    <section class="section recent-viewed-section"><div class="section-head"><div><span class="eyebrow">YOUR HISTORY</span><h2>Recently Viewed</h2></div><a href="products.html">View All →</a></div><div class="featured-slider"><button class="featured-arrow prev" type="button" data-recent-prev aria-label="Previous recently viewed">‹</button><div class="featured-viewport"><div id="recentViewed" class="featured-track"></div></div><button class="featured-arrow next" type="button" data-recent-next aria-label="Next recently viewed">›</button></div></section>
    <section class="similar-section"><div class="section-head"><div><span class="eyebrow">YOU MAY ALSO LIKE</span><h2>Similar Products</h2></div><a href="products.html?cat=${encodeURIComponent(p.category||'')}">See All →</a></div><div class="similar-viewport"><div id="similarTrack" class="similar-track"></div><button class="similar-arrow prev" type="button" data-similar-prev aria-label="Previous">‹</button><button class="similar-arrow next" type="button" data-similar-next aria-label="Next">›</button></div></section>`;
  root.querySelectorAll('[data-detail-image]').forEach(btn=>btn.addEventListener('click',()=>{const img=root.querySelector('#detailMainImage');if(!img)return;img.src=imageUrl(btn.dataset.detailImage);img.dataset.originalSrc=btn.dataset.detailImage;img.dataset.driveId=driveId(btn.dataset.detailImage);root.querySelectorAll('.detail-thumb').forEach(x=>x.classList.remove('active'));btn.classList.add('active');}));
  const recent=getRecentViewed().filter(x=>String(x.id)!==String(p.id)).slice(0,10);const rt=document.querySelector('#recentViewed');if(rt){rt.innerHTML=recent.length?recent.map((x,i)=>productCard(x,i)).join(''):'<div class="no-results">Products you open will appear here.</div>';rt._products=recent;setupRailSlider('#recentViewed','[data-recent-prev]','[data-recent-next]',4800);}
  setupSimilarProducts(p); window.scrollTo({top:0,behavior:'instant'});
}
function setupSimilarProducts(current){
  const track=document.querySelector('#similarTrack'); if(!track)return;
  const all=Array.isArray(window.FG_PRODUCTS)?window.FG_PRODUCTS:[];
  const sameBrand=all.filter(x=>x.id!==current.id && current.brand && String(x.brand).toLowerCase()===String(current.brand).toLowerCase());
  const sameCat=all.filter(x=>x.id!==current.id && String(x.category||'').toLowerCase()===String(current.category||'').toLowerCase() && !sameBrand.some(b=>b.id===x.id));
  const rest=all.filter(x=>x.id!==current.id && !sameBrand.some(b=>b.id===x.id) && !sameCat.some(c=>c.id===x.id));
  const list=[...sameBrand,...sameCat,...rest].slice(0,10);
  if(!list.length){track.innerHTML='<div class="similar-empty">More similar products will appear here.</div>';return;}
  const cards=list.map((p,i)=>similarCard(p,i)).join('');
  track.innerHTML=cards+cards;
  track.querySelectorAll('.similar-card').forEach((el,i)=>{if(i>=list.length){el.setAttribute('aria-hidden','true');el.setAttribute('tabindex','-1');}});
  const viewport=track.parentElement; let pos=0,timer=null,dragging=false,startX=0,startPos=0,moved=false;
  const card=()=>track.querySelector('.similar-card');
  const width=()=>{const c=card();return c?c.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||14):0};
  const max=()=>Math.max(0,list.length-1);
  const apply=()=>{const w=width();track.style.transform=`translate3d(${-pos*w}px,0,0)`};
  const move=dir=>{const w=width();if(!w)return;pos+=dir;if(pos>max())pos=0;if(pos<0)pos=max();track.style.transition='transform .72s var(--ease-premium)';apply();};
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stop=()=>{if(timer)clearInterval(timer);timer=null;};
  const start=()=>{stop();if(reduce||document.hidden||dragging)return;timer=setInterval(()=>move(1),5200);};
  const down=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;moved=false;startX=e.clientX;startPos=pos;stop();track.style.transition='none';viewport.setPointerCapture?.(e.pointerId);};
  const moveDrag=e=>{if(!dragging)return;const dx=e.clientX-startX;if(Math.abs(dx)>8)moved=true;const w=width();if(!w)return;let raw=startPos-dx/w;const m=max();if(raw<0)raw*=.18;if(raw>m)raw=m+(raw-m)*.18;pos=raw;apply();};
  const up=e=>{if(!dragging)return;const dx=e.clientX-startX;dragging=false;const w=width();const threshold=Math.max(36,w*.15);if(Math.abs(dx)>=threshold)pos=startPos+(dx<0?1:-1);else pos=Math.round(pos);pos=Math.max(0,Math.min(max(),pos));track.style.transition='transform .72s var(--ease-premium)';apply();if(moved)window.FG_SUPPRESS_CARD_CLICK_UNTIL=Date.now()+120;start();};
  viewport.addEventListener('pointerdown',down,{passive:true});viewport.addEventListener('pointermove',moveDrag,{passive:true});viewport.addEventListener('pointerup',up,{passive:true});viewport.addEventListener('pointercancel',up,{passive:true});
  viewport.addEventListener('mouseenter',stop);viewport.addEventListener('mouseleave',start);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  document.querySelector('[data-similar-next]')?.addEventListener('click',()=>{move(1);start()});
  document.querySelector('[data-similar-prev]')?.addEventListener('click',()=>{move(-1);start()});
  window.addEventListener('resize',()=>{pos=Math.max(0,Math.min(max(),Math.round(pos)));track.style.transition='none';apply();},{passive:true});
  track.style.transition='transform .72s var(--ease-premium)';
  setTimeout(start,900);
}
function similarCard(p,i){const img=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||'Product')}" loading="lazy" decoding="async" ${imageRetryAttrs(p.image)}>`:'';return `<article class="similar-card" data-similar-id="${escapeHtml(p.id)}"><a href="product.html?id=${encodeURIComponent(p.id)}" class="similar-link"><div class="similar-image">${img||escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</div><div class="similar-copy"><small>${escapeHtml(p.brand||p.category||'')}</small><strong>${escapeHtml(p.name||'Product')}</strong><b>${money(p.price)}</b></div></a></article>`}

function categoryPill(cat){return `<a class="category-pill" href="products.html?cat=${encodeURIComponent(cat)}"><span class="cat-icon">${escapeHtml(CATEGORY_ICONS[cat]||"✦")}</span><span>${escapeHtml(cat)}</span><span class="pill-arrow">›</span></a>`}
const HOME_ACCESSORY_CATEGORIES=["Adapter & Cable","Charger","Earbud","Headphone","Neckband","Earphone","Speaker","Powerbank","Smart watch","Tripod","Boya","Screen Protector","Phone Case"];
const CATEGORY_DISPLAY={"Adapter & Cable":"Adapters & Cables","Charger":"Chargers","Earbud":"Earbuds","Headphone":"Headphones","Neckband":"Neckbands","Earphone":"Earphones","Speaker":"Speakers","Powerbank":"Power Banks","Smart watch":"Smart Watches","Tripod":"Tripods","Boya":"Boya","Screen Protector":"Screen Protectors","Phone Case":"Phone Cases","Feature Phone":"Feature Phones","Mobile Phones":"Smartphones"};
const categoryLabel=cat=>CATEGORY_DISPLAY[String(cat)]||String(cat);
function homeSubItem(label,cat,icon,extra=""){
  return `<a class="home-subitem ${extra}" href="products.html?cat=${encodeURIComponent(cat)}"><span>${escapeHtml(icon||CATEGORY_ICONS[cat]||"✦")}</span><strong>${escapeHtml(categoryLabel(label))}</strong><b>›</b></a>`;
}
function renderCategories(products=[]){
  const target=document.querySelector("#homeCategories");if(!target)return;
  const available=new Set(products.map(p=>String(p.category||"").trim()).filter(Boolean));
  const accessories=[...HOME_ACCESSORY_CATEGORIES,...[...available].filter(c=>!HOME_ACCESSORY_CATEGORIES.includes(c)&&c!=="Mobile Phones"&&c!=="Feature Phone")].filter((x,i,a)=>x&&a.indexOf(x)===i&&available.has(x));
  const mobileAvailable=available.has('Mobile Phones')||available.has('Feature Phone');
  if(!mobileAvailable&&!accessories.length){target.innerHTML='';return;}
  let html='';
  if(mobileAvailable){html+=`<article class="home-shop-card" data-home-shop="mobile"><button class="home-shop-trigger" type="button" aria-expanded="false"><span class="home-shop-icon">▯</span><span class="home-shop-copy"><strong>Mobile</strong><small>Smartphone &amp; Feature Phone</small></span><span class="home-shop-chevron">›</span></button><div class="home-shop-panel"><div class="home-shop-panel-inner"><div class="home-subgrid">${available.has('Mobile Phones')?homeSubItem('Smartphone','Mobile Phones','▯','home-mobile-option'):''}${available.has('Feature Phone')?homeSubItem('Feature Phone','Feature Phone','☎','home-mobile-option'):''}</div></div></div></article>`;}
  if(accessories.length){html+=`<article class="home-shop-card" data-home-shop="accessories"><button class="home-shop-trigger" type="button" aria-expanded="false"><span class="home-shop-icon">✦</span><span class="home-shop-copy"><strong>Accessories &amp; Gadgets</strong><small>All mobile accessories &amp; everyday gadgets</small></span><span class="home-shop-chevron">›</span></button><div class="home-shop-panel"><div class="home-shop-panel-inner"><div class="home-subgrid">${accessories.map(c=>homeSubItem(c,c,CATEGORY_ICONS[c]||"✦")).join("")}</div></div></div></article>`;}
  target.innerHTML=html;
  target.querySelectorAll('.home-shop-trigger').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.home-shop-card');const willOpen=!card.classList.contains('open');target.querySelectorAll('.home-shop-card.open').forEach(other=>{if(other!==card){other.classList.remove('open');other.querySelector('.home-shop-trigger')?.setAttribute('aria-expanded','false')}});card.classList.toggle('open',willOpen);btn.setAttribute('aria-expanded',String(willOpen));}));
}
function renderFeaturedProducts(list=[]){
  const track=document.querySelector('#featured');if(!track)return;
  const items=(list||[]).slice(0,10);
  track._products=items;
  track.innerHTML=items.length?items.map((p,i)=>{const html=productCard(p,i);return html.replace('data-product-index="'+i+'"','data-product-index="'+i+'" style="--i:'+i+'"')}).join(''):'<div class="no-results"><div>⌛</div><p>Featured products will appear here.</p></div>';
  setupFeaturedSlider();
}
function setupFeaturedSlider(){
  const track=document.querySelector('#featured'),viewport=track?.parentElement;if(!track||!viewport||track._featuredBound)return;
  track._featuredBound=true;
  const prev=document.querySelector('[data-featured-prev]'),next=document.querySelector('[data-featured-next]');
  let pos=0,timer=null,paused=false,dragging=false,startX=0,startPos=0,moved=false;
  const cards=()=>track.querySelectorAll('.product-card');
  const stepWidth=()=>{const card=track.querySelector('.product-card');if(!card)return 0;return card.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||16)};
  const maxStep=()=>{const n=cards().length;if(!n)return 0;const w=stepWidth();const visible=Math.max(1,Math.floor(viewport.clientWidth/w));return Math.max(0,n-visible)};
  const applyPos=()=>{const w=stepWidth();track.style.transform=`translate3d(${-pos*w}px,0,0)`};
  const move=(dir=1)=>{const w=stepWidth();if(!w)return;const max=maxStep();if(max<=0)return;track.style.transition='transform .72s var(--ease-premium)';pos+=dir;if(pos>max)pos=0;if(pos<0)pos=max;applyPos()};
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; const start=()=>{clearInterval(timer);if(reduce||document.hidden)return;timer=setInterval(()=>{if(!paused&&!dragging)move(1)},4200)};document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
  const stop=()=>clearInterval(timer);
  prev?.addEventListener('click',()=>{move(-1);start()});next?.addEventListener('click',()=>{move(1);start()});
  viewport.addEventListener('mouseenter',()=>{paused=true});viewport.addEventListener('mouseleave',()=>{paused=false});
  // True touch/mouse dragging: swipe the featured rail itself, not only the arrows.
  const onDown=e=>{
    if(e.pointerType==='mouse' && e.button!==0)return;
    dragging=true;moved=false;paused=true;stop();startX=e.clientX;startPos=pos;
    track.style.transition='none';
    viewport.setPointerCapture?.(e.pointerId);
  };
  const onMove=e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>6)moved=true;
    const w=stepWidth();if(!w)return;
    const max=maxStep();
    let raw=startPos-(dx/w);
    if(raw<0)raw=raw*.18;if(raw>max)raw=max+(raw-max)*.18;
    pos=raw;track.style.transform=`translate3d(${-pos*w}px,0,0)`;
  };
  const onUp=e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;dragging=false;track.style.transition='transform .72s var(--ease-premium)';
    const w=stepWidth();const threshold=Math.max(38,w*.16);
    if(Math.abs(dx)>=threshold){pos=startPos+(dx<0?1:-1)}else{pos=Math.round(pos)}
    const max=maxStep();pos=Math.max(0,Math.min(max,pos));applyPos();
    if(moved)window.FG_SUPPRESS_CARD_CLICK_UNTIL=Date.now()+120;
    paused=false;start();
  };
  viewport.addEventListener('pointerdown',onDown,{passive:true});
  viewport.addEventListener('pointermove',onMove,{passive:true});
  viewport.addEventListener('pointerup',onUp,{passive:true});
  viewport.addEventListener('pointercancel',onUp,{passive:true});
  viewport.addEventListener('touchstart',stop,{passive:true});
  viewport.addEventListener('touchend',start,{passive:true});
  window.addEventListener('resize',()=>{pos=0;track.style.transition='none';applyPos()},{passive:true});
  setTimeout(start,900);
}
function productCard(p,index){
  const price=Number(p.price||0),mrp=Number(p.mrp||0),discount=mrp>price?Math.round((1-price/mrp)*100):0;
  const image=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||"Product")}" loading="lazy" decoding="async" width="640" height="640" ${imageRetryAttrs(p.image)}><span class="product-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`:`<span class="product-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`;
  return `<article class="product-card" data-product-index="${index}"><a class="product-card-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${escapeHtml(p.name||"product")}"><div class="product-visual">${discount?`<span class="discount-badge">-${discount}%</span>`:""}${p.featured?`<span class="featured-badge">Featured</span>`:""}${image}</div><div class="product-body"><div class="product-category">${escapeHtml(p.category||"Gadgets")}</div><h3>${escapeHtml(p.name||"Product")}</h3>${p.brand?`<div class="product-brand">${escapeHtml(p.brand)}</div>`:""}<div class="product-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del>`:""}</div></div></a><div class="product-bottom"><span class="stock-dot"></span>${escapeHtml(p.stock||"In Stock")}<button class="quick-add" data-add-product="${escapeHtml(p.id)}" ${String(p.stock||'In Stock').toLowerCase()==='out of stock'?'disabled aria-disabled="true"':''}>Add +</button></div></article>`;
}
function renderProducts(list,id){const el=document.querySelector(id);if(!el)return;el._products=list;el.innerHTML=list.length?list.map((p,i)=>productCard(p,i)).join(""):`<div class="no-results"><div>⌕</div><h3>No products found</h3><p>Try another category or search.</p></div>`}

function normalizeApiPayload(payload){if(Array.isArray(payload))return {products:payload,announcement:''};if(payload&&Array.isArray(payload.products))return {products:payload.products,announcement:String(payload.announcement||'')};return {products:[],announcement:''};}
const CACHE_KEY="fg_products_cache_v6", CACHE_TTL=30*60*1000;
function readCachedProducts(){try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(x&&Array.isArray(x.data)&&Number(x.time)>0){if(Date.now()-Number(x.time)<CACHE_TTL)return x.data;localStorage.removeItem(CACHE_KEY)}}catch{}return null}
function writeCachedProducts(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data}))}catch{}}
async function fetchProducts(){
  if(!CONFIG.productsApiUrl||CONFIG.productsApiUrl.includes("PASTE_"))return CONFIG.fallbackProducts;
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),2200);
  try{const r=await fetch(CONFIG.productsApiUrl,{cache:"no-store",signal:controller.signal});if(!r.ok)throw Error(r.status);const raw=await r.json();const payload=normalizeApiPayload(raw);writeCachedProducts(payload.products);if(payload.announcement){window.FG_ANNOUNCEMENT=payload.announcement;}return payload.products}catch(e){return readCachedProducts()||CONFIG.fallbackProducts}finally{clearTimeout(timer)}
}
async function loadProductsFast(onData){
  const cached=readCachedProducts();
  if(cached?.length)onData(cached,true);
  const fresh=await fetchProducts();
  if(Array.isArray(fresh)&&fresh.length)onData(fresh,false);
  return fresh;
}

function closeSearchSuggestions(except=null){
  document.querySelectorAll('.search-suggestions').forEach(box=>{if(box!==except){box.hidden=true;box.innerHTML='';}});
}
function setupSearchSuggestions(products){
  // Bind once. Always read the latest product list so suggestions work after
  // cached/fresh API refreshes on every page.
  if(window.FG_SEARCH_SUGGESTIONS_READY){ window.FG_REFRESH_SUGGESTIONS?.(); return; }
  window.FG_SEARCH_SUGGESTIONS_READY=true;

  const getProducts=()=>Array.isArray(window.FG_PRODUCTS)?window.FG_PRODUCTS:(Array.isArray(products)?products:[]);
  const sources=[];
  document.querySelectorAll('.search').forEach(form=>{
    const input=form.querySelector('input[name="q"]');
    if(input) sources.push({input,host:form});
  });
  const catalogInput=document.querySelector('#catalogSearch');
  if(catalogInput) sources.push({input:catalogInput,host:catalogInput.parentElement||catalogInput});

  sources.forEach(({input,host})=>{
    const box=document.createElement('div');
    box.className='search-suggestions';
    box.hidden=true;
    host.appendChild(box);

    const render=()=>{
      const q=String(input.value||'').toLowerCase().trim();
      if(!q){box.hidden=true;box.innerHTML='';return;}
      const terms=q.split(/\s+/).filter(Boolean);
      const all=getProducts();
      const selectedCategory=document.querySelector('#category')?.value||'All';
      const matches=all.filter(p=>{
        if(input.id==='catalogSearch' && selectedCategory!=='All' && String(p.category)!==String(selectedCategory))return false;
        const hay=[p.name,p.brand,p.category,p.description].map(v=>String(v||'').toLowerCase()).join(' ');
        return terms.every(t=>hay.includes(t));
      }).sort((a,b)=>{
        const an=String(a.name||'').toLowerCase(),bn=String(b.name||'').toLowerCase();
        const ap=an===q?0:an.startsWith(q)?1:an.includes(q)?2:3;
        const bp=bn===q?0:bn.startsWith(q)?1:bn.includes(q)?2:3;
        return ap-bp || Number(b.featured)-Number(a.featured);
      }).slice(0,5);

      if(!matches.length){
        if(q&&all.length&&CONFIG.productsApiUrl){try{fetch(CONFIG.productsApiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({type:'search',query:q}),mode:'no-cors',keepalive:true}).catch(()=>{});}catch{}}
        box.innerHTML=all.length?'<div class="suggest-empty">No matching product</div>':'<div class="suggest-empty">Finding products…</div>';
        box.hidden=false;
        return;
      }
      box.innerHTML=matches.map(p=>`<button type="button" class="suggest-item" data-suggest-product="${escapeHtml(p.id)}"><span class="suggest-thumb">${p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="" loading="lazy" decoding="async">`:escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span><span class="suggest-copy"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.brand||p.category||'')}</small></span><b>${money(p.price)}</b></button>`).join('');
      box.hidden=false;
    };

    input.addEventListener('input',()=>{render(); clearTimeout(input._fgSuggestTimer); input._fgSuggestTimer=setTimeout(render,80);});
    input.addEventListener('compositionend',render);
    input.addEventListener('focus',()=>{if(input.value.trim())render()});
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.innerHTML='';}});
    if(input.form) input.form.addEventListener('submit',()=>closeSearchSuggestions());

    box.addEventListener('mousedown',e=>e.preventDefault());
    box.addEventListener('click',e=>{
      const item=e.target.closest('[data-suggest-product]');
      if(!item)return;
      e.preventDefault();
      e.stopPropagation();
      const p=getProducts().find(x=>String(x.id)===String(item.dataset.suggestProduct));
      closeSearchSuggestions();
      if(!p)return;
      input.value=p.name||'';
      // Hide the mobile/Android keyboard before opening Product Info.
      input.blur();
      if(document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
      setTimeout(()=>{
        if(document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
        openProductPage(p);
      },80);
    });
  });
  window.FG_REFRESH_SUGGESTIONS=()=>document.querySelectorAll('.search input[name="q"],#catalogSearch').forEach(inp=>{if(inp.value.trim()) inp.dispatchEvent(new Event('input',{bubbles:true}));});

  if(!window.FG_SEARCH_OUTSIDE_BOUND){
    window.FG_SEARCH_OUTSIDE_BOUND=true;
    document.addEventListener('click',e=>{
      if(!e.target.closest('.search')&&!e.target.closest('#catalogSearch')&&!e.target.closest('.search-suggestions'))closeSearchSuggestions();
    });
  }
}
function setupInteractions(products){
  if(window.FG_INTERACTIONS_BOUND)return;
  window.FG_INTERACTIONS_BOUND=true;
  document.addEventListener("click",e=>{
    // Intercept real product links so the cached product snapshot is saved before navigation.
    // This makes product pages open immediately instead of waiting for the Google Apps Script API.
    const productLink=e.target.closest?.(".product-card-link,.similar-link");
    if(productLink && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey){
      const id=productLink.getAttribute("href")?.match(/[?&]id=([^&]+)/)?.[1];
      const list=window.FG_PRODUCTS||products||[];
      const p=list.find(x=>String(x.id)===decodeURIComponent(id||""));
      if(p){e.preventDefault();e.stopPropagation();openProductPage(p);return;}
    }
    if(window.FG_SUPPRESS_CARD_CLICK_UNTIL && Date.now()<window.FG_SUPPRESS_CARD_CLICK_UNTIL){window.FG_SUPPRESS_CARD_CLICK_UNTIL=0;if(e.target.closest('.product-card-link,.similar-link')){e.preventDefault();e.stopPropagation();return;}}
    const buy=e.target.closest("[data-buy-now]");
    if(buy){e.preventDefault();e.stopPropagation();const p=(window.FG_PRODUCTS||products).find(x=>String(x.id)===String(buy.dataset.buyNow));const q=Math.max(1,parseInt(document.querySelector("#detailQty")?.value||"1",10)||1);if(p&&String(p.stock||"").toLowerCase()!=="out of stock"){addToCart(p,q,buy);openCart();}return;}
    const dminus=e.target.closest("[data-detail-minus]"),dplus=e.target.closest("[data-detail-plus]");
    if(dminus||dplus){const inp=document.querySelector("#detailQty");if(inp){let q=Math.max(1,parseInt(inp.value||"1",10)||1);q+=dplus?1:-1;inp.value=Math.max(1,q)}return;}
    const add=e.target.closest("[data-add-product]");
    if(add){
      e.preventDefault();e.stopPropagation();
      const list=window.FG_PRODUCTS||products;
      const p=list.find(x=>String(x.id)===String(add.dataset.addProduct));
      if(p&&String(p.stock||"").toLowerCase()!=="out of stock"){const q=Math.max(1,parseInt(document.querySelector("#detailQty")?.value||"1",10)||1);addToCart(p,q,add);} 
      return;
    }
    const minus=e.target.closest("[data-cart-minus]");
    if(minus){e.preventDefault();e.stopPropagation();changeQty(minus.dataset.cartMinus,-1);return;}
    const plus=e.target.closest("[data-cart-plus]");
    if(plus){e.preventDefault();e.stopPropagation();changeQty(plus.dataset.cartPlus,1);return;}
    const remove=e.target.closest("[data-cart-remove]");
    if(remove){e.preventDefault();e.stopPropagation();removeFromCart(remove.dataset.cartRemove);return;}
    if(e.target.closest("[data-cart-open]")){openCart();return;}
    if(e.target.closest("#cartCheckout")){
      e.preventDefault(); e.stopPropagation();
      const btn=e.target.closest("#cartCheckout");
      const name=document.querySelector("#checkoutName")?.value.trim()||"";
      const phone=(document.querySelector("#checkoutPhone")?.value||"").replace(/\s+/g,"");
      const address=document.querySelector("#checkoutAddress")?.value.trim()||"";
      const area=document.querySelector("#checkoutArea")?.value||"Dhaka";
      const payment=document.querySelector("#checkoutPayment")?.value||"";
      const transactionId=document.querySelector("#checkoutTransaction")?.value.trim()||"";
      if(!name||!phone||!address||!payment||!checkoutPhoneIsValid(phone)||(payment!=="COD"&&!transactionId)){
        ["#checkoutName","#checkoutPhone","#checkoutAddress"].forEach(sel=>{const el=document.querySelector(sel);if(el&&!el.value.trim()){el.classList.add("fg-input-error");setTimeout(()=>el.classList.remove("fg-input-error"),900);}});
        if(!checkoutPhoneIsValid(phone))validateCheckoutPhone(true);
        showCheckoutError(!checkoutPhoneIsValid(phone)?"Check Number — use exactly 11 digits.":"Please complete all checkout fields.");
        updateCheckoutButtonState();
        return;
      }
      const deliveryFee=checkoutDeliveryFee();const customer={name,phone,address,deliveryArea:area,payment,transactionId,deliveryFee};
      btn.disabled=true; btn.dataset.submitting='1'; btn.textContent="Opening WhatsApp…";
      const current=getCart();
      // Build the order immediately so checkout never waits on the network.
      // A fresh price sync continues in the background when possible.
      if(current.length){
        const immediateUrl=waCart(current,customer);
        try{fetch(CONFIG.productsApiUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({type:"order",name,phone,address,deliveryArea:area,payment,transactionId,deliveryFee,subtotal:current.reduce((a,i)=>a+i.price*i.qty,0),total:current.reduce((a,i)=>a+i.price*i.qty,0)+deliveryFee,items:current}),keepalive:true,mode:"no-cors"}).catch(()=>{});}catch{}
        clearCartAfterOrder();
        window.location.assign(immediateUrl);
        syncCartPrices(1200).catch(()=>{});
      }else{
        btn.dataset.submitting=''; btn.disabled=false; btn.textContent="Confirm Order on WhatsApp →"; updateCheckoutButtonState();
        showCheckoutError("Your cart is empty.");
      }
      return;
    }
    if(e.target.closest("[data-close-cart]")){closeCart();return;}
        const card=e.target.closest(".product-card");
    if(Date.now() < (window.FG_SUPPRESS_CARD_CLICK_UNTIL||0)) return;
    if(card&&!e.target.closest("a,button,input,select")){
      const p=card.parentElement?._products?.[Number(card.dataset.productIndex)];
      if(p)openProductPage(p);
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeCart();}
    const card=e.target.closest?.(".product-card");
    if(card&&(e.key==="Enter"||e.key===" ")){
      e.preventDefault();
      const p=card.parentElement?._products?.[Number(card.dataset.productIndex)];
      if(p)openProductPage(p);
    }
  });
}

function buildCategoryMenu(products=[]){
  const wrap=document.querySelector(".category-nav");
  const host=document.querySelector("#categoryMenu");
  const btn=wrap?.querySelector(":scope > button");
  if(!wrap||!host||!btn)return;

  const available=new Set(products.map(p=>String(p.category||'').trim()).filter(Boolean));
  const extras=[...available].filter(c=>!CATEGORY_LIST.includes(c));
  host.innerHTML=[...CATEGORY_LIST.filter(c=>available.has(c)),...extras].map(categoryPill).join("");

  // Re-bind safely after every product refresh. The menu stays open on mobile
  // until the customer chooses a category or taps outside it.
  btn.onclick=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    const open=!host.classList.contains("open");
    host.classList.toggle("open",open);
    btn.setAttribute("aria-expanded",String(open));
  };
  btn.setAttribute("aria-haspopup","true");
  btn.setAttribute("aria-expanded",host.classList.contains("open")?"true":"false");

  host.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    host.classList.remove("open");
    btn.setAttribute("aria-expanded","false");
  }));

  if(!window.FG_CATEGORY_OUTSIDE_BOUND){
    window.FG_CATEGORY_OUTSIDE_BOUND=true;
    document.addEventListener("click",(e)=>{
      const currentWrap=document.querySelector(".category-nav");
      const currentHost=document.querySelector("#categoryMenu");
      const currentBtn=currentWrap?.querySelector(":scope > button");
      if(currentHost?.classList.contains("open") && currentWrap && !currentWrap.contains(e.target)){
        currentHost.classList.remove("open");
        currentBtn?.setAttribute("aria-expanded","false");
      }
    });
  }
}

function setupMobileBottomNav(){if(document.querySelector('#fgBottomNav'))return;document.body.insertAdjacentHTML('beforeend',`<nav id="fgBottomNav" class="fg-bottom-nav" aria-label="Mobile navigation"><a data-bottom="home" href="index.html"><i class="fa-solid fa-house"></i><span>Home</span></a><a data-bottom="categories" href="products.html"><i class="fa-solid fa-layer-group"></i><span>Categories</span></a><button data-bottom="cart" type="button"><i class="fa-solid fa-cart-shopping"></i><span>Cart</span><b data-cart-count>0</b></button><a data-bottom="whatsapp" class="wa-link" href="https://wa.me/8801601093553" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span></a></nav>`);document.querySelector('[data-bottom="cart"]')?.addEventListener('click',openCart);const path=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('#fgBottomNav [data-bottom]').forEach(a=>{if((path==='index.html'||path==='')&&a.dataset.bottom==='home')a.classList.add('active');if(path==='products.html'&&a.dataset.bottom==='categories')a.classList.add('active');if(path==='product.html'&&a.dataset.bottom==='categories')a.classList.add('active');});}
function renderCategoryHeroCount(products){const params=new URLSearchParams(location.search),cat=params.get('cat');if(!cat)return;const count=products.filter(p=>String(p.category)===String(cat)).length;const hero=document.querySelector('.catalog-hero');if(hero){hero.classList.add('category-hero-active');const h=hero.querySelector('#catalogTitle');if(h)h.textContent=categoryLabel(cat);const intro=hero.querySelector('#catalogIntro');if(intro)intro.textContent=`${count} product${count===1?'':'s'} available in ${categoryLabel(cat)}.`;}}
function setActiveNav(){const path=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.nav a[href],#fgSidebar a[href]').forEach(a=>{const href=a.getAttribute('href')||'';const target=href.split('?')[0].split('/').pop();a.classList.toggle('active',target===path||(path===''&&target==='index.html'));});}
function setupSidebar(){
  if(document.querySelector('#fgSidebar'))return;
  const cats=[...CATEGORY_LIST];
  document.body.insertAdjacentHTML('beforeend',`<div id="fgSidebarOverlay" class="fg-sidebar-overlay" hidden></div><aside id="fgSidebar" class="fg-sidebar" aria-hidden="true"><div class="fg-sidebar-head"><a class="fg-sidebar-brand" href="index.html"><img src="flash-gear-logo.webp" alt="FLASH GEAR BD"></a><button type="button" class="fg-sidebar-close" data-sidebar-close aria-label="Close menu">×</button></div><div class="fg-sidebar-menu"><a href="index.html">⌂ <span>Home</span><b>›</b></a><a href="products.html">▦ <span>All Products</span><b>›</b></a><div class="fg-sidebar-label">Categories</div>${cats.map(c=>`<a data-category="${escapeHtml(c)}" href="products.html?cat=${encodeURIComponent(c)}"><span class="fg-cat-icon">${escapeHtml(CATEGORY_ICONS[c]||'✦')}</span><span>${escapeHtml(c)}</span><b>›</b></a>`).join('')}<div class="fg-sidebar-label">Support</div><a href="warranty.html">♢ <span>Warranty</span><b>›</b></a><a href="delivery.html">⌁ <span>Delivery</span><b>›</b></a><a href="contact.html">◎ <span>Contact</span><b>›</b></a></div><div class="fg-sidebar-social"><a data-facebook target="_blank">f</a><a data-instagram target="_blank">◎</a><a class="wa-link" href="https://wa.me/8801601093553?text=Hello%20FLASH%20GEAR%20BD%2C%20I%20want%20to%20know%20about%20your%20products." target="_blank"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a></div></aside>`);
  const head=document.querySelector('.header-main');
  if(head && !head.querySelector('.fg-menu-trigger')){const b=document.createElement('button');b.className='fg-menu-trigger';b.type='button';b.setAttribute('aria-label','Open menu');b.innerHTML='<span></span><span></span><span></span>';head.insertBefore(b,head.firstChild);b.addEventListener('click',openSidebar)}
  const close=()=>{const sb=document.querySelector('#fgSidebar'),ov=document.querySelector('#fgSidebarOverlay');sb?.classList.remove('open');sb?.setAttribute('aria-hidden','true');ov?.classList.remove('open');setTimeout(()=>{if(ov)ov.hidden=true},260);document.body.classList.remove('sidebar-open')};
  window.closeSidebar=close;document.querySelector('[data-sidebar-close]')?.addEventListener('click',close);document.querySelector('#fgSidebarOverlay')?.addEventListener('click',close);
  document.querySelectorAll('#fgSidebar a').forEach(a=>a.addEventListener('click',close));
  document.querySelectorAll('#fgSidebar [data-facebook]').forEach(a=>a.href=CONFIG.facebook);
  document.querySelectorAll('#fgSidebar [data-instagram]').forEach(a=>a.href=CONFIG.instagram);
  document.querySelectorAll('#fgSidebar .wa-link').forEach(a=>{a.href=wa();a.target='_blank';a.rel='noopener'});
  function openSidebar(){const sb=document.querySelector('#fgSidebar'),ov=document.querySelector('#fgSidebarOverlay');if(!sb||!ov)return;ov.hidden=false;requestAnimationFrame(()=>{sb.classList.add('open');ov.classList.add('open')});sb.setAttribute('aria-hidden','false');document.body.classList.add('sidebar-open')}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}

function setupCatalog(products){
  const catalog=document.querySelector('#catalog');if(!catalog)return;
  const s=document.querySelector('#catalogSearch'),c=document.querySelector('#category'),sort=document.querySelector('#sort');
  const params=new URLSearchParams(location.search),q0=params.get('q')||'',cat0=params.get('cat')||'';
  if(s&&q0)s.value=q0;
  const cats=[...new Set([...CATEGORY_LIST,...products.map(p=>p.category).filter(Boolean)])].filter(cat=>products.some(p=>String(p.category)===String(cat)));
  if(c)c.innerHTML=`<option value="All">All Categories</option>`+cats.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
  if(c&&cat0)c.value=cat0;
  const catalogNames={'Mobile Phones':'Smartphone','Feature Phone':'Feature Phone'};
  const title=document.querySelector('#catalogTitle'),intro=document.querySelector('#catalogIntro'),kicker=document.querySelector('#catalogKicker');
  if(cat0){const display=catalogNames[cat0]||cat0;if(title)title.textContent=display;if(kicker)kicker.textContent='FLASH GEAR BD · '+display.toUpperCase();if(intro)intro.textContent=`Browse ${display} products, compare prices and open any product for full specifications, warranty and ordering options.`;}
  const filter=()=>{
    const q=(s?.value||q0).toLowerCase().trim(),cat=c?.value||cat0||'All';
    let list=products.filter(p=>(cat==='All'||String(p.category)===String(cat))&&(!q||[p.name,p.category,p.brand,p.description].join(' ').toLowerCase().includes(q)));
    const mode=sort?.value||'featured';
    if(mode==='low')list.sort((a,b)=>a.price-b.price);
    if(mode==='high')list.sort((a,b)=>b.price-a.price);
    if(mode==='name')list.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    if(mode==='featured')list.sort((a,b)=>Number(b.featured)-Number(a.featured));
    renderProducts(list,'#catalog');
    const rc=document.querySelector('#resultCount');if(rc)rc.textContent=`${list.length} product${list.length===1?'':'s'}`;
  };
  s?.addEventListener('input',filter);c?.addEventListener('change',filter);sort?.addEventListener('change',filter);filter();
}

document.addEventListener("DOMContentLoaded",async()=>{
  document.querySelectorAll(".wa-link").forEach(a=>{a.href=wa();a.target="_blank";a.rel="noopener"});
  document.querySelectorAll("[data-facebook]").forEach(a=>a.href=CONFIG.facebook);document.querySelectorAll("[data-instagram]").forEach(a=>a.href=CONFIG.instagram);document.querySelectorAll("#year").forEach(e=>e.textContent=new Date().getFullYear());
  ensureCartDrawer();updateCartUI(); setupSidebar(); setupMobileBottomNav(); setupAnnouncement(); setActiveNav(); loadAnnouncement();
  const earlyParams=new URLSearchParams(location.search);
  if(document.querySelector('#productDetail')){try{const fastRaw=sessionStorage.getItem('fg_open_product')||localStorage.getItem('fg_open_product_fast')||'';const cachedProduct=JSON.parse(fastRaw||'null');if(cachedProduct&&String(cachedProduct.id)===String(earlyParams.get('id')))renderProductPage(cachedProduct)}catch{}}
  let currentProducts=[];
  const apply=data=>{if(window.FG_ANNOUNCEMENT){const a=document.querySelector('#announcementText');if(a)a.textContent=window.FG_ANNOUNCEMENT;}currentProducts=(Array.isArray(data)?data:[]).map(p=>({...p,color:String(p?.color??p?.colour??p?.Colour??p?.Color??'').trim()}));window.FG_PRODUCTS=currentProducts;document.querySelectorAll("#fgSidebar [data-category]").forEach(a=>{a.style.display=currentProducts.some(p=>String(p.category)===String(a.dataset.category))?"":"none"});buildCategoryMenu(currentProducts);renderCategories(currentProducts);renderHomeRows(currentProducts);renderCategoryHeroCount(currentProducts);const featured=currentProducts.filter(p=>p.featured);if(document.querySelector("#featured"))renderFeaturedProducts((featured.length?featured:currentProducts).slice(0,10));setupCatalog(currentProducts);setupSearchSuggestions(currentProducts); window.FG_REFRESH_SUGGESTIONS?.();};
  setupInteractions(currentProducts);
  // Never block first paint on Google Apps Script. Cached/snapshot data renders first;
  // the network refresh updates prices/products in the background.
  const isProductPage=!!document.querySelector('#productDetail');
  loadProductsFast(apply).catch(()=>{});
  const params=new URLSearchParams(location.search);
  if(document.querySelector('#productDetail')){
    const id=params.get('id');
    const findProduct=()=>{const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(id));if(p)renderProductPage(p);return !!p};
    if(!findProduct()){try{const cached=JSON.parse(sessionStorage.getItem('fg_open_product')||localStorage.getItem('fg_open_product_fast')||'null');if(cached&&String(cached.id)===String(id))renderProductPage(cached);else showProductNotFound()}catch{showProductNotFound()}}
  }
});

window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('id');const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(id));if(p)renderProductPage(p)});
