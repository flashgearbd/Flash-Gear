
/* V13 architecture: configuration → data/cache → cart/checkout → rendering → page setup. */
const CONFIG = {
  productsApiUrl: "https://script.google.com/macros/s/AKfycbziRYes9_oZDi3uTAC09R8xo6OVRBq9RRxABkgcnmCW24rWyj5AocJQko_OBofvjaMI/exec",
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
function imageUrl(v){const u=String(v||'').trim();if(!u)return '';const id=driveId(u);if(id){if(CONFIG.imageCdnBase)return CONFIG.imageCdnBase.replace(/\/$/,'')+'/'+encodeURIComponent(id);return `https://drive.google.com/thumbnail?id=${id}&sz=w600`;}return u;}
function imageRetryAttrs(raw){const original=String(raw||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');const id=driveId(raw);const primary=imageUrl(raw).replace(/&/g,'&amp;').replace(/"/g,'&quot;');return `data-original-src="${original}" data-drive-id="${id}" data-retry-src="${primary}" onerror="fgImageRetry(this)"`;}
function fgImageRetry(img){if(!img||img.dataset.retryDone==='1')return;img.dataset.retryDone='1';const id=img.dataset.driveId||driveId(img.dataset.originalSrc||'');if(id){img.src=`https://drive.google.com/uc?export=view&id=${id}`;img.onerror=()=>{img.onerror=null;const ph=img.nextElementSibling;if(ph)ph.hidden=false;img.classList.add('img-broken');};return;}const original=img.dataset.originalSrc||'';if(original&&img.src!==original){img.src=original;return;}img.classList.add('img-broken');const ph=img.nextElementSibling;if(ph)ph.hidden=false;}
function wa(name=""){const t=name?`Hello FLASH GEAR BD, I want to order: ${name}`:`Hello FLASH GEAR BD, I want to know about your products.`;return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(t)}`;}
function buildWaOrder(items, customer={}){const lines=items.map(i=>`• ${i.name} × ${i.qty} — ${money(i.price*i.qty)}`);const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);const fee=Number(customer.deliveryFee||0);const total=subtotal+fee;const details=[customer.name&&`Name: ${customer.name}`,customer.phone&&`Phone: ${customer.phone}`,customer.address&&`Address: ${customer.address}`,customer.deliveryArea&&`Delivery Area: ${customer.deliveryArea}`,customer.payment&&`Payment: ${customer.payment}`,customer.transactionId&&`Transaction ID: ${customer.transactionId}`,customer.orderRef&&`Order Reference: ${customer.orderRef}`].filter(Boolean);return `Hello FLASH GEAR BD, I want to confirm my order:\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal)}\nDelivery: ${money(fee)}\nTotal: ${money(total)}${details.length?'\n\n'+details.join('\n'):''}`;}
function waCart(items,customer={}){return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWaOrder(items,customer))}`;}
async function syncCartPrices(timeoutMs=2500){
  const current=getCart();
  if(!current.length)return [];
  try{
    const fresh=await Promise.race([fetchProducts(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('sync-timeout')),timeoutMs))]);
    if(Array.isArray(fresh)&&fresh.length){
      const map=new Map(fresh.map(p=>[String(p.id),p]));
      const c=current.map(i=>{const p=map.get(String(i.id));return p?{...i,name:p.name,price:Number(p.price||0)}:null;}).filter(Boolean);
      saveCart(c,false);return c;
    }
  }catch{}
  return getCart();
}

function getCart(){try{return JSON.parse(localStorage.getItem("fg_cart")||"[]")}catch{return []}}
function saveCart(c,resetReference=true){localStorage.setItem("fg_cart",JSON.stringify(c));if(resetReference){try{localStorage.removeItem("fg_order_client_reference")}catch{}}updateCartUI()}
function getClientReference(){try{let r=localStorage.getItem("fg_order_client_reference");if(!r){r="FGREF-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem("fg_order_client_reference",r);}return r}catch{return "FGREF-"+Date.now().toString(36).toUpperCase()}}
function stockQty(v){if(typeof v==='number')return Number.isFinite(v)?Math.max(0,v):0;const raw=String(v??'').trim(),t=raw.toLowerCase();if(raw==='')return 0;if(t==='in stock'||t==='available')return Infinity;if(t==='out of stock'||t==='unavailable'||t==='sold out')return 0;const m=t.match(/\d+/);return m?Number(m[0]):0}
function hasStock(p){return stockQty(p?.stock)>0}
function stockLabel(v){const n=stockQty(v);if(n===0)return "Out of Stock";if(n===Infinity)return "In Stock";if(n<=3)return `Only ${n} left`;return "In Stock"}
function addToCart(p,qty=1,sourceEl=null){const max=stockQty(p?.stock);if(max===0){showCheckoutError("This product is out of stock.");return;}const c=getCart(),x=c.find(i=>i.id===p.id);qty=Math.max(1,Number(qty)||1);const next=(x?Number(x.qty||0):0)+qty;if(max>0&&next>max){showCheckoutError(`Only ${max} available.`);return;}if(x){x.qty=next;x.stock=p.stock;}else c.push({id:p.id,name:p.name,price:Number(p.price||0),mrp:Number(p.mrp||0),qty,stock:p.stock,image:p.image,brand:p.brand});saveCart(c);flyToCart(sourceEl);showCartAddedToast(p)}
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
function changeQty(id,d){const c=getCart(),x=c.find(i=>i.id===id);if(!x)return;if(d>0){const max=stockQty(x.stock);if(max>0&&Number(x.qty||0)>=max){showCheckoutError(`Only ${max} available.`);return;}}x.qty+=d;if(x.qty<=0)return removeFromCart(id);saveCart(c);openCart()}
function clearCartAfterOrder(){localStorage.removeItem('fg_cart');try{localStorage.removeItem('fg_order_client_reference')}catch{}['#checkoutName','#checkoutPhone','#checkoutAddress','#checkoutArea','#checkoutPayment','#checkoutTransaction'].forEach(sel=>{const el=document.querySelector(sel);if(el){if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';el.classList.remove('fg-phone-invalid','fg-input-error');}});const msg=document.querySelector('#checkoutPhoneError');if(msg){msg.hidden=true;msg.textContent='';}updateCartUI();updateCheckoutButtonState();}
function updateCartUI(){
  const c=getCart(),count=c.reduce((s,i)=>s+i.qty,0),subtotal=c.reduce((s,i)=>s+i.price*i.qty,0),fee=checkoutDeliveryFee(),total=subtotal+(c.length?fee:0);
  document.querySelectorAll("[data-cart-count]").forEach(e=>e.textContent=count);
  document.querySelectorAll("[data-cart-total]").forEach(e=>e.textContent=money(total));
  document.querySelectorAll("[data-cart-subtotal]").forEach(e=>e.textContent=money(subtotal));
  document.querySelectorAll("[data-cart-delivery]").forEach(e=>e.textContent=(c.length&&fee===0)?"FREE":money(c.length?fee:0));
  const b=document.querySelector("#cartBody");if(!b)return;
  if(!c.length){b.classList.add('is-empty');b.innerHTML=`<div class="cart-empty"><div><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i></div><h3>Your cart is empty</h3><p>Add a product to start your order.</p><a class="btn btn-blue" href="products.html">Browse Products</a></div>`;document.querySelector("#cartCheckout")?.setAttribute("hidden","");document.querySelector('#cartCheckoutSummary')?.setAttribute('hidden','');document.querySelector(".cart-checkout-form")?.setAttribute("hidden","");return;}
  b.classList.remove('is-empty');document.querySelector(".cart-checkout-form")?.removeAttribute("hidden");document.querySelector("#cartCheckout")?.removeAttribute("hidden");document.querySelector('#cartCheckoutSummary')?.removeAttribute('hidden');
  b.innerHTML=c.map(i=>`<div class="cart-item"><div><strong>${escapeHtml(i.name)}</strong><span>${money(i.price)} each</span></div><div class="cart-item-actions"><button data-cart-minus="${escapeHtml(i.id)}" aria-label="Decrease ${escapeHtml(i.name)}">−</button><b>${i.qty}</b><button data-cart-plus="${escapeHtml(i.id)}" aria-label="Increase ${escapeHtml(i.name)}">+</button><button class="cart-remove" data-cart-remove="${escapeHtml(i.id)}" aria-label="Remove ${escapeHtml(i.name)}">×</button></div></div>`).join("");
  updateCheckoutButtonState();
}
function normalizeBdPhone(v){let x=String(v||'').replace(/[\s()-]/g,'');if(/^\+?88/.test(x))x=x.replace(/^\+?88/,'');return x;}
function checkoutPhoneIsValid(v){return /^01[3-9]\d{8}$/.test(normalizeBdPhone(v));}
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
function checkoutFormIsValid(){
  const name=document.querySelector('#checkoutName')?.value.trim()||'';
  const phone=(document.querySelector('#checkoutPhone')?.value||'').replace(/\s+/g,'');
  const address=document.querySelector('#checkoutAddress')?.value.trim()||'';
  const payment=document.querySelector('#checkoutPayment')?.value||'';
  const tx=document.querySelector('#checkoutTransaction')?.value.trim()||'';
  return Boolean(name&&checkoutPhoneIsValid(phone)&&address&&payment&&((payment==='COD')||tx));
}
function updateCheckoutButtonState(){
  const btn=document.querySelector('#cartCheckout'); if(!btn)return;
  const hasCart=getCart().length>0;
  const valid=checkoutFormIsValid()&&hasCart;
  btn.disabled=!valid || btn.dataset.submitting==='1';
  btn.setAttribute('aria-disabled',String(btn.disabled));
  if(btn.dataset.submitting!=='1') btn.textContent=valid?'Confirm Order →':'Complete details to confirm';
}
function toggleTransactionField(){
  const p=document.querySelector('#checkoutPayment'),tx=document.querySelector('#checkoutTransaction'),info=document.querySelector('#paymentInstructions'); if(!p||!tx)return;
  const show=p.value!=='COD'; tx.hidden=!show; tx.required=show;
  if(!show){tx.value='';if(info){info.hidden=true;info.innerHTML='';}}
  else if(info){const s=window.FG_SETTINGS||{};const number=p.value==='bKash'?s.bkashNumber:s.nagadNumber;info.hidden=false;info.innerHTML=number?`<strong>${p.value}</strong><br><span>Send payment to <b>${escapeHtml(number)}</b></span><br><small>Complete payment, then enter the Transaction ID below. We verify the transaction with your order.</small>`:`<strong>${p.value}</strong><br><small>Payment number is not configured yet. Please contact FLASH GEAR BD before paying.</small>`;}
}
function bindCheckoutValidation(){
  ['#checkoutName','#checkoutPhone','#checkoutAddress','#checkoutArea','#checkoutPayment','#checkoutTransaction'].forEach(sel=>{
    const el=document.querySelector(sel); if(!el||el._fgCheckoutBound)return;
    el._fgCheckoutBound=true;
    ['input','change'].forEach(ev=>el.addEventListener(ev,()=>{
      if(sel==='#checkoutPhone')validateCheckoutPhone(false);
      if(sel==='#checkoutPayment')toggleTransactionField();
      updateCartUI(); updateCheckoutButtonState();
    }));
  });
  toggleTransactionField(); updateCheckoutButtonState();
}
function validateCheckoutPhone(showError=true){
  const el=document.querySelector('#checkoutPhone'),msg=document.querySelector('#checkoutPhoneError');
  if(!el||!msg)return false;
  const value=el.value.replace(/\s+/g,''); el.value=value;
  const valid=checkoutPhoneIsValid(value),hasInput=value.length>0;
  if(hasInput&&!valid){el.classList.add('fg-phone-invalid');msg.hidden=false;msg.textContent='Enter a valid Bangladesh mobile number (01XXXXXXXXX or +8801XXXXXXXXX).';}
  else{el.classList.remove('fg-phone-invalid');msg.hidden=true;msg.textContent='';}
  if(showError&&hasInput&&!valid)el.focus(); return valid;
}
function ensureCartDrawer(){
  if(document.querySelector('#cartDrawer')){bindCheckoutValidation();return;}
  document.body.insertAdjacentHTML('beforeend',`<div id="cartDrawer" class="cart-drawer" hidden>
    <div class="cart-backdrop" data-close-cart></div>
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
      <div class="cart-head"><div><span class="eyebrow">YOUR ORDER</span><h2 id="cartTitle">Cart</h2></div><button class="drawer-close" data-close-cart aria-label="Close cart">×</button></div>
      <div id="cartBody" class="cart-body"></div>
      <div class="cart-checkout-form">
        <div class="checkout-section-title">Customer information</div>
        <label class="sr-only" for="checkoutName">Name</label><input id="checkoutName" placeholder="Full Name" autocomplete="name" maxlength="80">
        <label class="sr-only" for="checkoutPhone">Phone</label><input id="checkoutPhone" name="fg-customer-phone" placeholder="Phone — 11 digits" inputmode="numeric" autocomplete="tel" maxlength="14" pattern="(?:\+?88)?01[3-9][0-9]{8}" aria-describedby="checkoutPhoneError">
        <div id="checkoutPhoneError" class="fg-phone-error" role="alert" hidden></div>
        <label class="sr-only" for="checkoutAddress">Address</label><textarea id="checkoutAddress" name="fg-delivery-address" placeholder="Delivery Address" autocomplete="street-address" maxlength="180" rows="2"></textarea>
        <label class="sr-only" for="checkoutArea">Delivery Area</label><select id="checkoutArea"><option value="Inside Chattogram City">Inside Chattogram City — ৳50</option><option value="Outside Chattogram">Outside Chattogram — ৳120</option></select>
        <label class="sr-only" for="checkoutPayment">Payment</label><select id="checkoutPayment"><option value="COD">Cash on Delivery</option><option value="bKash">bKash</option><option value="Nagad">Nagad</option></select>
        <div id="paymentInstructions" class="payment-instructions" hidden></div><input id="checkoutTransaction" placeholder="Transaction ID (bKash/Nagad only)" maxlength="60" autocomplete="off" hidden>
        <p class="checkout-help">Your final delivery charge and stock are verified when you confirm.</p>
      </div>
      <div class="cart-foot">
        <div id="cartCheckoutSummary" class="cart-summary"><div><span>Subtotal</span><strong data-cart-subtotal>৳0</strong></div><div><span>Delivery</span><strong data-cart-delivery>৳0</strong></div></div>
        <div class="cart-total"><span>Total</span><strong data-cart-total>৳0</strong></div>
        <button id="cartCheckout" class="btn btn-blue btn-block" type="button" disabled aria-disabled="true">Complete details to confirm</button>
        <small class="checkout-secure-note"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Secure order confirmation • Your order is saved before you leave checkout</small>
      </div>
    </aside>
  </div>`);
  bindCheckoutValidation(); updateCartUI();
}
function showOrderSuccess(result){
  let el=document.querySelector('#fgOrderSuccess');
  if(!el){document.body.insertAdjacentHTML('beforeend',`<div id="fgOrderSuccess" class="fg-order-success" role="status" aria-live="polite"><div class="fg-order-success-card"><div class="fg-success-icon">✓</div><span class="eyebrow">FLASH GEAR BD</span><h2>Order Confirmed</h2><p>Your order has been saved successfully.</p><strong class="fg-order-id"></strong><span class="fg-order-total"></span><div class="fg-success-actions"><a class="btn btn-blue" href="products.html">Continue Shopping</a></div><small>Your order has been saved successfully.</small></div></div>`);el=document.querySelector('#fgOrderSuccess');}
  el.querySelector('.fg-order-id').textContent='Order ID: '+(result?.orderId||'Confirmed');
  el.querySelector('.fg-order-total').textContent='Total: '+money(result?.total||0);
  el.hidden=false; requestAnimationFrame(()=>el.classList.add('show'));
  return el;
}

function openCart(){ensureCartDrawer();const d=document.querySelector("#cartDrawer");d.hidden=false;document.body.classList.add("drawer-open");requestAnimationFrame(()=>d.classList.add("is-open"));updateCartUI();syncCartPrices(1800).catch(()=>{});}
function closeCart(){const d=document.querySelector("#cartDrawer");if(!d)return;d.classList.remove("is-open");setTimeout(()=>{d.hidden=true},180);document.body.classList.remove("drawer-open")}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.querySelector("#cartDrawer.is-open"))closeCart()});

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


function setupProductRail(trackSelector, prevSelector, nextSelector, interval=7200){
  const track=document.querySelector(trackSelector);
  const viewport=track?.parentElement;
  if(!track||!viewport)return;
  if(track._productRailCleanup){track._productRailCleanup();track._productRailCleanup=null;}

  const originals=Array.from(track.children).filter(el=>el.classList.contains('product-card'));
  if(!originals.length)return;
  const count=originals.length;
  const source=originals.map(el=>el.cloneNode(true));

  // Three copies create a finite buffer around the user's position. Touch is
  // entirely native: the browser owns the horizontal/vertical gesture.
  track.replaceChildren();
  const appendSet=()=>source.forEach(el=>track.appendChild(el.cloneNode(true)));
  if(count<2) appendSet();
  else { appendSet(); appendSet(); appendSet(); }

  let timer=null, resizeTimer=null;
  const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stepWidth=()=>{
    const card=track.querySelector('.product-card');
    if(!card)return 0;
    const gap=parseFloat(getComputedStyle(track).gap)||0;
    return card.getBoundingClientRect().width+gap;
  };
  const setWidth=()=>stepWidth()*count;

  const normalize=()=>{
    if(count<2)return;
    const w=setWidth();
    if(!w)return;
    const x=viewport.scrollLeft;
    let y=x;
    while(y < w*0.5) y += w;
    while(y >= w*2.5) y -= w;
    if(y !== x) viewport.scrollLeft=y;
  };
  const stop=()=>{if(timer){clearTimeout(timer);timer=null;}};
  const schedule=()=>{
    stop();
    if(reduced||document.hidden||count<2)return;
    timer=setTimeout(()=>{
      const w=stepWidth();
      if(w) viewport.scrollBy({left:w,behavior:'smooth'});
      schedule();
    },interval);
  };
  const move=dir=>{
    const w=stepWidth();
    if(!w)return;
    stop();
    viewport.scrollBy({left:dir*w,behavior:reduced?'auto':'smooth'});
    schedule();
  };
  const prev=document.querySelector(prevSelector), next=document.querySelector(nextSelector);
  prev?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));
  const onScroll=()=>normalize();
  const onVisibility=()=>document.hidden?stop():schedule();
  const onResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(normalize,120);};
  viewport.addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('resize',onResize,{passive:true});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const w=setWidth();
    viewport.scrollLeft=(count>=2&&w)?w:0;
    schedule();
  }));
  track._productRailCleanup=()=>{
    stop();clearTimeout(resizeTimer);
    prev?.replaceWith(prev.cloneNode(true));
    next?.replaceWith(next.cloneNode(true));
    viewport.removeEventListener('scroll',onScroll);
    document.removeEventListener('visibilitychange',onVisibility);
    window.removeEventListener('resize',onResize);
  };
}

function renderHomeRows(products=[]){const valid=Array.isArray(products)?products.filter(p=>p&&p.name):[];const newest=valid.slice().reverse().slice(0,10);const hot=valid.slice().sort((a,b)=>{const da=Number(a.mrp||0)>Number(a.price||0)?1-Number(a.price||0)/Number(a.mrp||1):0;const db=Number(b.mrp||0)>Number(b.price||0)?1-Number(b.price||0)/Number(b.mrp||1):0;return db-da}).slice(0,10);for(const [id,list] of [['#newArrivals',newest],['#hotDeals',hot]]){const el=document.querySelector(id);if(el){el._products=list;el.innerHTML=list.length?list.map((x,i)=>productCard(x,i)).join(''):'<div class="no-results">No products available yet.</div>';}}setupProductRail('#newArrivals','[data-new-prev]','[data-new-next]',7200);setupProductRail('#hotDeals','[data-hot-prev]','[data-hot-next]',7600)}
async function loadAnnouncement(){const el=document.querySelector('#announcementText');if(!el)return;if(window.FG_ANNOUNCEMENT){el.textContent=window.FG_ANNOUNCEMENT;return;}el.textContent=el.textContent||'FLASH GEAR BD • Good Quality • Best Price • Reliable Service';}
function setupAnnouncement(){const bar=document.querySelector('#announcementBar'),close=document.querySelector('#announcementClose');if(!bar)return;try{if(localStorage.getItem('fg_announcement_dismissed')==='1')bar.hidden=true;}catch{}close?.addEventListener('click',()=>{bar.hidden=true;try{localStorage.setItem('fg_announcement_dismissed','1')}catch{}});}
function showProductNotFound(){const root=document.querySelector('#productDetail');if(!root)return;root.innerHTML=`<div class="product-not-found"><div class="not-found-icon">⌕</div><h1>Product Not Found</h1><p>This product may have been removed or the link is no longer valid.</p><a class="btn btn-blue" href="products.html">Browse All Products</a></div>`;document.title='Product Not Found | FLASH GEAR BD';}
function updateProductSEO(p){if(!p)return;document.title=`${p.name} | FLASH GEAR BD`;let canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.href;let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}m.content=(p.description||`Buy ${p.name} from FLASH GEAR BD with clear pricing, warranty and WhatsApp ordering.`).slice(0,155);['og:title','og:description'].forEach((prop,i)=>{let el=document.querySelector(`meta[property=\"${prop}\"]`);if(!el){el=document.createElement('meta');el.setAttribute('property',prop);document.head.appendChild(el);}el.content=i===0?`${p.name} | FLASH GEAR BD`:m.content;});let og=document.querySelector('meta[property=\"og:image\"]');if(og)og.content=p.image?imageUrl(p.image):'https://gear.flashgearbd.workers.dev/hero-tech.webp';let tw=document.querySelector('meta[name=\"twitter:title\"]');if(tw)tw.content=`${p.name} | FLASH GEAR BD`;let td=document.querySelector('meta[name=\"twitter:description\"]');if(td)td.content=m.content;let ti=document.querySelector('meta[name=\"twitter:image\"]');if(ti)ti.content=p.image?imageUrl(p.image):'https://gear.flashgearbd.workers.dev/hero-tech.webp';let old=document.querySelector('#product-jsonld');if(old)old.remove();const ld=document.createElement('script');ld.type='application/ld+json';ld.id='product-jsonld';ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:p.name,brand:p.brand?{"@type":"Brand",name:p.brand}:undefined,offers:{"@type":"Offer",price:Number(p.price||0),priceCurrency:"BDT",availability:hasStock(p)?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:location.href}});document.head.appendChild(ld);}
function renderProductPage(p){
  const root=document.querySelector('#productDetail'); if(!root||!p)return; window.FG_CURRENT_PRODUCT=p; updateProductSEO(p); rememberViewed(p);
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
        <div class="detail-stock"><span></span>${escapeHtml(stockLabel(p.stock))}</div>
        <div class="detail-meta">${p.brand?`<div><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>`:''}<div><span>Category</span><strong>${escapeHtml(p.category||'Gadgets')}</strong></div>${String(p.color||'').trim()?`<div class="detail-colour-row"><span>Colour</span><strong><i class="colour-dot" aria-hidden="true"></i>${escapeHtml(String(p.color).trim())}</strong></div>`:''}${p.warranty?`<div><span>Warranty</span><strong>${escapeHtml(p.warranty)}</strong></div>`:''}</div>
        <div class="detail-qty"><button type="button" data-detail-minus aria-label="Decrease quantity">−</button><input id="detailQty" value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-detail-plus aria-label="Increase quantity">+</button></div>
        <div class="detail-actions"><button class="btn btn-blue btn-large" data-add-product="${escapeHtml(p.id)}" ${!hasStock(p)?'disabled':''}>Add to Cart</button><button class="btn btn-soft btn-large" data-buy-now="${escapeHtml(p.id)}" ${!hasStock(p)?'disabled':''}>Buy Now</button></div>
        <div class="payment-trust"><span>bKash</span><span>Nagad</span><span>COD</span></div><a class="detail-wa-link" href="${wa(p.name)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp Order</a>
        <div class="detail-benefits"><span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Original</span><span><i class="fa-solid fa-rotate" aria-hidden="true"></i> Warranty</span><span><i class="fa-solid fa-truck-fast" aria-hidden="true"></i> Delivery</span><span><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Support</span></div>
      </section>
    </div>
    <section class="detail-info-card"><div class="detail-tabs"><button class="detail-tab active" type="button" data-detail-tab="info">${label}</button></div><div class="detail-tab-panel" id="detailInfoPanel">${escapeHtml(p.description||'Product information will be updated soon.').replace(/\n/g,'<br>')}</div></section>
    <section class="section recent-viewed-section"><div class="section-head"><div><span class="eyebrow">YOUR HISTORY</span><h2>Recently Viewed</h2></div><a href="products.html">View All →</a></div><div class="featured-slider"><button class="featured-arrow prev" type="button" data-recent-prev aria-label="Previous recently viewed">‹</button><div class="featured-viewport"><div id="recentViewed" class="featured-track"></div></div><button class="featured-arrow next" type="button" data-recent-next aria-label="Next recently viewed">›</button></div></section>
    <section class="similar-section"><div class="section-head"><div><span class="eyebrow">YOU MAY ALSO LIKE</span><h2>Similar Products</h2></div><a href="products.html?cat=${encodeURIComponent(p.category||'')}">See All →</a></div><div class="similar-viewport"><div id="similarTrack" class="similar-track"></div><button class="similar-arrow prev" type="button" data-similar-prev aria-label="Previous">‹</button><button class="similar-arrow next" type="button" data-similar-next aria-label="Next">›</button></div></section>`;
  root.querySelectorAll('[data-detail-image]').forEach(btn=>btn.addEventListener('click',()=>{const img=root.querySelector('#detailMainImage');if(!img)return;img.src=imageUrl(btn.dataset.detailImage);img.dataset.originalSrc=btn.dataset.detailImage;img.dataset.driveId=driveId(btn.dataset.detailImage);root.querySelectorAll('.detail-thumb').forEach(x=>x.classList.remove('active'));btn.classList.add('active');}));
  const sticky=document.querySelector('#fgMobileBuyBar'); if(sticky) sticky.remove();
  if(hasStock(p)){ document.body.insertAdjacentHTML('beforeend',`<div id="fgMobileBuyBar" class="fg-product-buybar" aria-label="Quick purchase"><div class="fg-buy-price"><strong>${money(price)}</strong><small class="fg-buy-stock">${escapeHtml(stockLabel(p.stock))}</small></div><button type="button" class="btn btn-soft" data-add-product="${escapeHtml(p.id)}">Add</button><button type="button" class="btn btn-blue" data-buy-now="${escapeHtml(p.id)}">Buy Now</button></div>`); }
  const recent=getRecentViewed().filter(x=>String(x.id)!==String(p.id)).slice(0,10);const rt=document.querySelector('#recentViewed');if(rt){rt.innerHTML=recent.length?recent.map((x,i)=>productCard(x,i)).join(''):'<div class="no-results">Products you open will appear here.</div>';rt._products=recent;setupProductRail('#recentViewed','[data-recent-prev]','[data-recent-next]',4800);}
  setupSimilarProducts(p); window.scrollTo({top:0,behavior:'auto'});
}
function setupSimilarProducts(current){
  const track=document.querySelector('#similarTrack'); if(!track)return;
  const all=Array.isArray(window.FG_PRODUCTS)?window.FG_PRODUCTS:[];
  const sameBrand=all.filter(x=>x.id!==current.id && current.brand && String(x.brand).toLowerCase()===String(current.brand).toLowerCase());
  const sameCat=all.filter(x=>x.id!==current.id && String(x.category||'').toLowerCase()===String(current.category||'').toLowerCase() && !sameBrand.some(b=>b.id===x.id));
  const rest=all.filter(x=>x.id!==current.id && !sameBrand.some(b=>b.id===x.id) && !sameCat.some(c=>c.id===x.id));
  const list=[...sameBrand,...sameCat,...rest].slice(0,10);
  if(!list.length){track.innerHTML='<div class="similar-empty">More similar products will appear here.</div>';return;}
  track.innerHTML=list.map((p,i)=>similarCard(p,i)).join('');
  setupProductRail('#similarTrack','[data-similar-prev]','[data-similar-next]',5200);
}

function similarCard(p,i){const img=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||'Product')}" loading="lazy" decoding="async" ${imageRetryAttrs(p.image)}>`:'';return `<article class="similar-card" data-similar-id="${escapeHtml(p.id)}"><a href="product.html?id=${encodeURIComponent(p.id)}" class="similar-link"><div class="similar-image">${img||escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</div><div class="similar-copy"><small>${escapeHtml(p.brand||p.category||'')}</small><strong>${escapeHtml(p.name||'Product')}</strong><b>${money(p.price)}</b></div></a></article>`}

function categoryPill(cat){return `<a class="category-pill" href="products.html?cat=${encodeURIComponent(cat)}"><span class="cat-icon">${escapeHtml(CATEGORY_ICONS[cat]||"✦")}</span><span>${escapeHtml(cat)}</span><span class="pill-arrow">›</span></a>`}
const HOME_ACCESSORY_CATEGORIES=["Adapter & Cable","Charger","Earbud","Headphone","Neckband","Earphone","Speaker","Powerbank","Smart watch","Tripod","Boya","Screen Protector","Phone Case"];
const CATEGORY_DISPLAY={"Adapter & Cable":"Adapters & Cables","Charger":"Chargers","Earbud":"Earbuds","Headphone":"Headphones","Neckband":"Neckbands","Earphone":"Earphones","Speaker":"Speakers","Powerbank":"Power Banks","Smart watch":"Smart Watches","Tripod":"Tripods","Boya":"Boya","Screen Protector":"Screen Protectors","Phone Case":"Phone Cases","Feature Phone":"Feature Phones","Mobile Phones":"Smartphones"};
const categoryLabel=cat=>CATEGORY_DISPLAY[String(cat)]||String(cat);
function homeSubItem(label,cat,icon,extra=""){
  return `<a class="home-subitem ${extra}" href="products.html?cat=${encodeURIComponent(cat)}"><span>${escapeHtml(icon||CATEGORY_ICONS[cat]||"✦")}</span><strong>${escapeHtml(categoryLabel(label))}</strong><b>›</b></a>`;
}

function renderV9CategoryRail(products=[]){
  const target=document.querySelector('#v9CategoryRail'); if(!target)return;
  const available=[...new Set(products.map(p=>String(p.category||'').trim()).filter(Boolean))];
  const preferred=['Mobile Phones','Feature Phone','Charger','Adapter & Cable','Earbud','Headphone','Neckband','Powerbank','Smart watch','Speaker','Phone Case','Screen Protector','Tripod','Boya'];
  const cats=[...preferred.filter(c=>available.includes(c)),...available.filter(c=>!preferred.includes(c))].slice(0,12);
  if(!cats.length){target.innerHTML='<a class="v9-category-card" href="products.html"><span class="v9-cat-icon">✦</span><strong>All Products</strong><small>Browse the store</small></a>';return;}
  target.innerHTML=cats.map(cat=>`<a class="v9-category-card" href="products.html?cat=${encodeURIComponent(cat)}"><span class="v9-cat-icon">${escapeHtml(CATEGORY_ICONS[cat]||'✦')}</span><strong>${escapeHtml(categoryLabel(cat))}</strong><small>Shop now <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></small></a>`).join('');
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
  setupProductRail('#featured','[data-featured-prev]','[data-featured-next]',7200);
}
function productCard(p,index){
  const price=Number(p.price||0),mrp=Number(p.mrp||0),discount=mrp>price?Math.round((1-price/mrp)*100):0;
  const image=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||"Product")}" loading="lazy" decoding="async" width="640" height="640" ${imageRetryAttrs(p.image)}><span class="product-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`:`<span class="product-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`;
  return `<article class="product-card" data-product-index="${index}"><a class="product-card-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${escapeHtml(p.name||"product")}"><div class="product-visual">${discount?`<span class="discount-badge">-${discount}%</span>`:""}${p.featured?`<span class="featured-badge">Featured</span>`:""}${image}</div><div class="product-body"><div class="product-category">${escapeHtml(p.category||"Gadgets")}</div><h3>${escapeHtml(p.name||"Product")}</h3>${p.brand?`<div class="product-brand">${escapeHtml(p.brand)}</div>`:""}<div class="product-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del>`:""}</div></div></a><div class="product-bottom"><span class="stock-dot"></span>${escapeHtml(stockLabel(p.stock))}<button class="quick-add" data-add-product="${escapeHtml(p.id)}" ${!hasStock(p)?'disabled aria-disabled="true"':''}>Add +</button></div></article>`;
}
function renderProducts(list,id){const el=document.querySelector(id);if(!el)return;el._products=list;el.innerHTML=list.length?list.map((p,i)=>productCard(p,i)).join(""):`<div class="no-results"><div>⌕</div><h3>No products found</h3><p>Try another category or search.</p></div>`}

function normalizeApiPayload(payload){
  if(Array.isArray(payload))return {products:payload,announcement:''};
  if(payload&&payload.success===false)throw new Error(String(payload.error||'Product API returned an error.'));
  if(payload&&Array.isArray(payload.products))return {products:payload.products,announcement:String(payload.announcement||'')};
  throw new Error('Product API returned an invalid response.');
}
const CACHE_KEY="fg_products_cache_v8", CACHE_TTL=60*1000;
function readCachedProducts(){try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(x&&Array.isArray(x.data)&&Number(x.time)>0){if(Date.now()-Number(x.time)<CACHE_TTL)return x.data;localStorage.removeItem(CACHE_KEY)}}catch{}return null}
function writeCachedProducts(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data}))}catch{}}
async function fetchProducts(){
  if(!CONFIG.productsApiUrl||CONFIG.productsApiUrl.includes("PASTE_"))return CONFIG.fallbackProducts;
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),10000);
  try{const r=await fetch(CONFIG.productsApiUrl,{cache:"no-store",signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);const raw=await r.json();const payload=normalizeApiPayload(raw);window.FG_PRODUCTS_LOAD_ERROR=null;writeCachedProducts(payload.products);if(payload.announcement){window.FG_ANNOUNCEMENT=payload.announcement;}return payload.products}catch(e){window.FG_PRODUCTS_LOAD_ERROR=e;return readCachedProducts()||CONFIG.fallbackProducts}finally{clearTimeout(timer)}
}
async function loadProductsFast(onData,onDone){
  const cached=readCachedProducts();
  if(cached)onData(cached,true);
  const fresh=await fetchProducts();
  if(Array.isArray(fresh))onData(fresh,false);
  if(onDone)onDone({products:fresh,error:window.FG_PRODUCTS_LOAD_ERROR||null,hadCache:Array.isArray(cached)});
  return fresh;
}
function showProductLoadError(){const root=document.querySelector('#productDetail');if(!root)return;root.innerHTML=`<div class="product-not-found product-load-error"><div class="not-found-icon">↻</div><h1>Couldn't load products</h1><p>The store connection took too long or failed. Your link is still valid.</p><button class="btn btn-blue" type="button" id="retryProducts">Tap to Retry</button></div>`;document.getElementById('retryProducts')?.addEventListener('click',()=>{const apply=window.FG_APPLY_PRODUCTS;if(apply){root.innerHTML='<div class="product-loading">Loading product…</div>';apply.retry();}});}

function closeSearchSuggestions(except=null){
  document.querySelectorAll('.fg-search-suggestions').forEach(box=>{
    if(box!==except){box.hidden=true;box.innerHTML='';}
  });
}

function normalizeSearchText(v){
  return String(v??'').toLowerCase().replace(/[‐‑‒–—]/g,'-').replace(/[^a-z0-9]+/g,' ').trim();
}
function parseCapacityQuery(q){
  const raw=normalizeSearchText(q).replace(/\s+/g,' ');
  const compact=raw.replace(/\s+/g,'');
  let m=compact.match(/(\d+(?:\.\d+)?)(k|mah)*/i);
  if(!m)return null;
  const n=Number(m[1]);
  if(!Number.isFinite(n)||n<=0)return null;
  let mah;
  if(compact.endsWith('mah')) mah=n;
  else if(compact.endsWith('k') || (n<=100 && (raw.includes('powerbank')||raw.includes('power bank')||raw.includes('battery')))) mah=n*1000;
  else if(n>=1000) mah=n;
  else return null;
  return Math.round(mah);
}
function productSearchHaystack(p){
  return normalizeSearchText([p?.name,p?.brand,p?.category,p?.description,p?.color,p?.warranty].join(' '));
}
function productCapacityMatches(p,mah){
  if(!mah)return false;
  const hay=productSearchHaystack(p).replace(/\s+/g,'');
  const k=mah/1000;
  const variants=[String(mah),String(mah).replace(/(\d)(\d{3})$/,'$1,$2'),`${k}k`,`${k}mah`,`${k}000mah`];
  return variants.some(v=>hay.includes(v.replace(/,/g,''))||hay.includes(v));
}
function scoreSearchProduct(p,q){
  const query=normalizeSearchText(q);
  const terms=query.split(/\s+/).filter(Boolean);
  const name=normalizeSearchText(p?.name), brand=normalizeSearchText(p?.brand), cat=normalizeSearchText(p?.category), desc=normalizeSearchText(p?.description);
  const hay=productSearchHaystack(p);
  const capacity=parseCapacityQuery(q);
  let score=0;
  const isPowerbank=/power ?bank/.test(query);
  if(capacity){
    if(productCapacityMatches(p,capacity)) score+=1000;
    if(cat.includes('powerbank')||name.includes('powerbank')||desc.includes('powerbank')) score+=500;
    if(isPowerbank)score+=300;
  }
  for(const t of terms){
    if(!t)continue;
    if(name===t)score+=700;
    if(name.startsWith(t))score+=500;
    if(brand===t)score+=650;
    if(brand.startsWith(t))score+=520;
    if(cat===t)score+=600;
    if(cat.startsWith(t))score+=480;
    if(new RegExp('(^|\\s)'+t.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'($|\\s)').test(name))score+=350;
    if(hay.includes(t))score+=120;
  }
  if(p?.featured)score+=8;
  if(hasStock(p))score+=3;
  return score;
}
function searchProductSuggestions(products,q,limit=3){
  const query=normalizeSearchText(q);
  if(!query)return [];
  const all=Array.isArray(products)?products.filter(p=>p&&p.name):[];
  const capacity=parseCapacityQuery(q);
  const scored=all.map((p,i)=>({p,i,score:scoreSearchProduct(p,q),capacityMatch:capacity?productCapacityMatches(p,capacity):false}));
  let candidates=scored.filter(x=>x.score>0);
  if(capacity){
    const exactCapacity=scored.filter(x=>x.capacityMatch);
    if(exactCapacity.length)candidates=exactCapacity;
  }
  return candidates.sort((a,b)=>b.score-a.score || String(a.p.name).localeCompare(String(b.p.name))).slice(0,limit).map(x=>x.p);
}

function setupHeaderSearchNavigation(){
  document.querySelectorAll('form.fg-top-search').forEach(form=>{
    if(form._fgSearchSubmitBound)return;
    form._fgSearchSubmitBound=true;
    const input=form.querySelector('input[name="q"]');
    const submit=()=>{
      const q=String(input?.value||'').trim();
      const url=new URL('products.html',window.location.href);
      if(q)url.searchParams.set('q',q); else url.searchParams.delete('q');
      window.location.assign(url.href);
    };
    form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();submit();},true);
  });
}

function setupSearchSuggestions(products){
  const getProducts=()=>Array.isArray(window.FG_PRODUCTS)?window.FG_PRODUCTS:(Array.isArray(products)?products:[]);
  document.querySelectorAll('.fg-top-search').forEach(form=>{
    if(form._fgSuggestionBound)return;
    form._fgSuggestionBound=true;
    const input=form.querySelector('input[name="q"]');
    if(!input)return;
    let box=form.querySelector('.fg-search-suggestions');
    if(!box){box=document.createElement('div');box.className='fg-search-suggestions';box.hidden=true;box.setAttribute('role','listbox');form.appendChild(box);}
    const render=()=>{
      const q=String(input.value||'').trim();
      if(!q){box.hidden=true;box.innerHTML='';return;}
      const matches=searchProductSuggestions(getProducts(),q,3);
      if(!matches.length){box.innerHTML='<div class="fg-search-empty">No matching products yet</div>';box.hidden=false;return;}
      box.innerHTML=matches.map(p=>`<button type="button" class="fg-search-item" role="option" data-suggest-product="${escapeHtml(p.id)}"><span class="fg-search-thumb">${p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="" loading="lazy" decoding="async">`:escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span><span class="fg-search-copy"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml([p.brand,p.category].filter(Boolean).join(' • '))}</small></span><b>${money(p.price)}</b></button>`).join('');
      box.hidden=false;
    };
    input.addEventListener('input',render,{passive:true});
    input.addEventListener('compositionend',render);
    input.addEventListener('focus',()=>{if(input.value.trim())render();});
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;} });
    box.addEventListener('pointerdown',e=>{const item=e.target.closest('[data-suggest-product]');if(item)e.preventDefault();},{passive:false});
    box.addEventListener('click',e=>{
      const item=e.target.closest('[data-suggest-product]'); if(!item)return;
      e.preventDefault(); e.stopPropagation();
      const p=getProducts().find(x=>String(x.id)===String(item.dataset.suggestProduct));
      closeSearchSuggestions();
      if(p)openProductPage(p);
    });
  });
  if(!window.FG_SEARCH_OUTSIDE_BOUND){
    window.FG_SEARCH_OUTSIDE_BOUND=true;
    document.addEventListener('click',e=>{if(!e.target.closest('.fg-top-search')&&!e.target.closest('.fg-search-suggestions'))closeSearchSuggestions();});
  }
}

function setupInteractions(products){
  if(window.FG_INTERACTIONS_BOUND)return;
  window.FG_INTERACTIONS_BOUND=true;
  document.addEventListener("click",async e=>{
    // Intercept real product links so the cached product snapshot is saved before navigation.
    // This makes product pages open immediately instead of waiting for the Google Apps Script API.
    const productLink=e.target.closest?.(".product-card-link,.similar-link");
    if(window.FG_SUPPRESS_CARD_CLICK_UNTIL && Date.now()<window.FG_SUPPRESS_CARD_CLICK_UNTIL){window.FG_SUPPRESS_CARD_CLICK_UNTIL=0;if(e.target.closest('.product-card-link,.similar-link')){e.preventDefault();e.stopPropagation();return;}}
    if(productLink && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey){
      const id=productLink.getAttribute("href")?.match(/[?&]id=([^&]+)/)?.[1];
      const list=window.FG_PRODUCTS||products||[];
      const p=list.find(x=>String(x.id)===decodeURIComponent(id||""));
      if(p){e.preventDefault();e.stopPropagation();openProductPage(p);return;}
    }
    const buy=e.target.closest("[data-buy-now]");
    if(buy){e.preventDefault();e.stopPropagation();const p=[...(window.FG_PRODUCTS||products||[]),window.FG_CURRENT_PRODUCT].filter(Boolean).find(x=>String(x.id)===String(buy.dataset.buyNow));const q=Math.max(1,parseInt(document.querySelector("#detailQty")?.value||"1",10)||1);if(p&&hasStock(p)){addToCart(p,q,buy);openCart();}return;}
    const dminus=e.target.closest("[data-detail-minus]"),dplus=e.target.closest("[data-detail-plus]");
    if(dminus||dplus){const inp=document.querySelector("#detailQty");if(inp){let q=Math.max(1,parseInt(inp.value||"1",10)||1);q+=dplus?1:-1;inp.value=Math.max(1,q)}return;}
    const add=e.target.closest("[data-add-product]");
    if(add){
      e.preventDefault();e.stopPropagation();
      const owner=add.closest('#recentViewed,#featured,#newArrivals,#hotDeals,#catalog,#similarTrack');
      const localList=owner?owner._products:[];
      const candidates=[...localList,...(window.FG_PRODUCTS||[]),window.FG_CURRENT_PRODUCT].filter(Boolean);
      const p=candidates.find(x=>String(x.id)===String(add.dataset.addProduct));
      if(p&&hasStock(p)){const detailAction=!!add.closest('.detail-actions');const q=detailAction?Math.max(1,parseInt(document.querySelector('#detailQty')?.value||'1',10)||1):1;addToCart(p,q,add);}
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
      if(btn.dataset.submitting==='1')return;
      const name=document.querySelector('#checkoutName')?.value.trim()||'';
      const phone=(document.querySelector('#checkoutPhone')?.value||'').replace(/\s+/g,'');
      const address=document.querySelector('#checkoutAddress')?.value.trim()||'';
      const area=document.querySelector('#checkoutArea')?.value||'Inside Chattogram City';
      const payment=document.querySelector('#checkoutPayment')?.value||'COD';
      const transactionId=document.querySelector('#checkoutTransaction')?.value.trim()||'';
      if(!name||!checkoutPhoneIsValid(phone)||!address||!payment||(payment!=='COD'&&!transactionId)){
        ['#checkoutName','#checkoutPhone','#checkoutAddress','#checkoutPayment'].forEach(sel=>{const el=document.querySelector(sel);if(el&&!String(el.value||'').trim()){el.classList.add('fg-input-error');setTimeout(()=>el.classList.remove('fg-input-error'),1200);}});
        if(!checkoutPhoneIsValid(phone))validateCheckoutPhone(true);
        showCheckoutError(!checkoutPhoneIsValid(phone)?'Check Number — use a valid Bangladesh mobile number.':'Please complete the highlighted checkout fields.');
        updateCheckoutButtonState(); return;
      }
      const current=getCart(); if(!current.length){showCheckoutError('Your cart is empty.');updateCheckoutButtonState();return;}
      const clientReference=getClientReference();
      btn.dataset.submitting='1'; btn.disabled=true; btn.textContent='Confirming Order…';
      const payload={action:'createOrder',clientReference,customerName:name,phone,address,deliveryArea:area,payment,transactionId,items:current.map(i=>({id:i.id,quantity:Number(i.qty||1)}))};
      try{
        const controller=new AbortController();const orderTimer=setTimeout(()=>controller.abort(),25000);let res;try{res=await fetch(CONFIG.productsApiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal});}finally{clearTimeout(orderTimer);}
        const text=await res.text(); let result=null; try{result=JSON.parse(text);}catch{throw new Error('The order service returned an invalid response.');}
        if(!res.ok||!result?.success)throw new Error(result?.error||'We could not save your order.');
        clearCartAfterOrder();
        showOrderSuccess(result);
      }catch(err){
        btn.dataset.submitting=''; btn.disabled=false; btn.textContent='Confirm Order →';
        updateCheckoutButtonState();
        showCheckoutError(err?.message||'Order failed. Your cart is still saved.');
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

function setupHeaderSearch(){
  // Do not intercept the search form. The browser's native GET submission
  // navigates to products.html?q=... and setupCatalog() applies the filter.
  document.querySelectorAll('form.search').forEach(form=>{
    form.method='get';
    form.action='products.html';
  });
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

function setupPremiumMobileNav(){if(document.querySelector('#fgMobileNav'))return;const path=location.pathname.toLowerCase();const active=path.includes('products')||path.includes('product.html')?'shop':'home';document.body.insertAdjacentHTML('beforeend',`<nav id="fgMobileNav" class="fg-mobile-nav" aria-label="Mobile navigation"><a class="${active==='home'?'is-active':''}" href="index.html"><span><i class="fa-solid fa-house" aria-hidden="true"></i></span><small>Home</small></a><a class="${active==='shop'?'is-active':''}" href="products.html"><span><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span><small>Categories</small></a><button type="button" data-cart-open aria-label="Open cart"><span><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><b data-cart-count>0</b></span><small>Cart</small></button></nav>`);}

async function loadPublicSettings(){try{const r=await fetch(CONFIG.productsApiUrl+'?action=settings',{cache:'no-store'});if(!r.ok)return;const j=await r.json();window.FG_SETTINGS=j.settings||{};if(window.FG_SETTINGS.whatsappNumber)CONFIG.whatsappNumber=String(window.FG_SETTINGS.whatsappNumber).replace(/^\+/,'');document.querySelectorAll('.wa-link').forEach(a=>{a.href=wa();a.target='_blank';a.rel='noopener'});const a=document.querySelector('#announcementText');if(a&&window.FG_SETTINGS.announcement)a.textContent=window.FG_SETTINGS.announcement;toggleTransactionField();document.querySelectorAll('[data-store-address]').forEach(e=>e.textContent=window.FG_SETTINGS.businessAddress||'Chattogram, Bangladesh');document.querySelectorAll('[data-store-hours]').forEach(e=>e.textContent=window.FG_SETTINGS.businessHours||'Contact us on WhatsApp for current support hours.');document.querySelectorAll('[data-store-phone]').forEach(e=>e.textContent=window.FG_SETTINGS.whatsappNumber||'');}catch{}}

document.addEventListener("DOMContentLoaded",async()=>{
  setupPremiumMobileNav();
  setupHeaderSearch();
  document.querySelectorAll(".wa-link").forEach(a=>{a.href=wa();a.target="_blank";a.rel="noopener"});
  document.querySelectorAll("[data-facebook]").forEach(a=>a.href=CONFIG.facebook);document.querySelectorAll("[data-instagram]").forEach(a=>a.href=CONFIG.instagram);document.querySelectorAll("#year").forEach(e=>e.textContent=new Date().getFullYear());
  ensureCartDrawer();updateCartUI(); setupSidebar(); setupAnnouncement(); setActiveNav(); loadAnnouncement(); loadPublicSettings();
  const earlyParams=new URLSearchParams(location.search);
  if(document.querySelector('#productDetail')){try{const fastRaw=sessionStorage.getItem('fg_open_product')||localStorage.getItem('fg_open_product_fast')||'';const cachedProduct=JSON.parse(fastRaw||'null');if(cachedProduct&&String(cachedProduct.id)===String(earlyParams.get('id')))renderProductPage(cachedProduct)}catch{}}
  let currentProducts=[];
  const productPageId=new URLSearchParams(location.search).get('id');
  const syncProductPage=()=>{if(!document.querySelector('#productDetail')||!productPageId)return false;const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(productPageId));if(p){renderProductPage(p);return true;}return false;};
  const apply=data=>{if(window.FG_ANNOUNCEMENT){const a=document.querySelector('#announcementText');if(a)a.textContent=window.FG_ANNOUNCEMENT;}currentProducts=(Array.isArray(data)?data:[]).map(p=>({...p,color:String(p?.color??p?.colour??p?.Colour??p?.Color??'').trim()}));window.FG_PRODUCTS=currentProducts;document.querySelectorAll("#fgSidebar [data-category]").forEach(a=>{a.style.display=currentProducts.some(p=>String(p.category)===String(a.dataset.category))?"":"none"});buildCategoryMenu(currentProducts);renderCategories(currentProducts);renderV9CategoryRail(currentProducts);renderHomeRows(currentProducts);renderCategoryHeroCount(currentProducts);const featured=currentProducts.filter(p=>p.featured);if(document.querySelector("#featured"))renderFeaturedProducts((featured.length?featured:currentProducts).slice(0,10));setupCatalog(currentProducts);setupHeaderSearchNavigation();setupSearchSuggestions(currentProducts);window.FG_REFRESH_SUGGESTIONS?.();syncProductPage();};
  window.FG_APPLY_PRODUCTS={retry:()=>loadProductsFast(apply,finishProductLoad)};
  const finishProductLoad=info=>{if(!document.querySelector('#productDetail')||!productPageId)return;if(syncProductPage())return;if(info?.error){showProductLoadError();return;}showProductNotFound();};
  setupInteractions(currentProducts);
  const isProductPage=!!document.querySelector('#productDetail');
  if(isProductPage){try{const fastRaw=sessionStorage.getItem('fg_open_product')||localStorage.getItem('fg_open_product_fast')||'';const cachedProduct=JSON.parse(fastRaw||'null');if(cachedProduct&&String(cachedProduct.id)===String(productPageId))renderProductPage(cachedProduct);}catch{}}
  loadProductsFast(apply,finishProductLoad).catch(()=>{if(isProductPage)showProductLoadError();});
});

window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('id');const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(id));if(p)renderProductPage(p)});
