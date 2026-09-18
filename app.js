
/* FLASH GEAR BD — premium touch interaction layer */
(function(){
  const interactive='button,a,[role="button"],.clickable,.product-card,.category-pill,.suggest-item,.cart-item';
  let lastPointer=0;
  function ripple(target,x,y){
    if(!target || target.closest?.('input,textarea,select')) return;
    const cs=getComputedStyle(target);
    if(cs.position==='static') target.style.position='relative';
    if(cs.overflow==='visible') target.style.overflow='hidden';
    const r=document.createElement('span');r.className='fgbd-ripple';
    const rect=target.getBoundingClientRect();
    r.style.left=(x-rect.left)+'px';r.style.top=(y-rect.top)+'px';
    target.appendChild(r);setTimeout(()=>r.remove(),560);
  }
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse' && e.button!==0)return;
    const t=e.target.closest?.(interactive);if(!t)return;
    lastPointer=Date.now();t.classList.add('fgbd-touching');
    ripple(t,e.clientX,e.clientY);
  },{passive:true});
  const clear=e=>{const t=e.target?.closest?.(interactive);if(t)t.classList.remove('fgbd-touching')};
  document.addEventListener('pointerup',clear,{passive:true});
  document.addEventListener('pointercancel',clear,{passive:true});
  document.addEventListener('pointerleave',clear,{passive:true});
  // Keep keyboard activation polished without fighting navigation.
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const t=e.target.closest?.(interactive);if(!t)return;
    t.classList.add('fgbd-touching');
    setTimeout(()=>t.classList.remove('fgbd-touching'),130);
  });
  // Gentle header elevation after scrolling.
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
  fallbackProducts: []
};

const CATEGORY_LIST = [
  "Feature Phone","Mobile Phones","Adapter & Cable","Charger","Earbud","Headphone",
  "Neckband","Earphone","Speaker","Powerbank","Smart watch","Tripod","Boya",
  "Screen Protector","Phone Case"
];

const CATEGORY_ICONS = {
  "Feature Phone":"☎","Mobile Phones":"▯","Adapter & Cable":"⌁","Charger":"⚡",
  "Earbud":"◉","Headphone":"◖◗","Neckband":"⌁","Earphone":"♬","Speaker":"◉",
  "Powerbank":"▰","Smart watch":"◷","Tripod":"♜","Boya":"●","Screen Protector":"▱","Phone Case":"▣"
};

const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
function imageUrl(v){const u=String(v||"").trim();if(!u)return "";let m=u.match(/drive\.google\.com\/(?:uc\?(?:[^#]*?&)?id=|file\/d\/|open\?id=)([A-Za-z0-9_-]+)/);if(!m)m=u.match(/[?&]id=([A-Za-z0-9_-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`:u;}
function wa(name=""){const t=name?`Hello FLASH GEAR BD, I want to order: ${name}`:`Hello FLASH GEAR BD, I want to know about your products.`;return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(t)}`;}
function waCart(items){const lines=items.map(i=>`• ${i.name} × ${i.qty} — ${money(i.price*i.qty)}`);const total=items.reduce((s,i)=>s+i.price*i.qty,0);return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello FLASH GEAR BD, I want to order:\n${lines.join("\n")}\n\nTotal: ${money(total)}`)}`;}

function getCart(){try{return JSON.parse(localStorage.getItem("fg_cart")||"[]")}catch{return []}}
function saveCart(c){localStorage.setItem("fg_cart",JSON.stringify(c));updateCartUI()}
function addToCart(p){const c=getCart(),x=c.find(i=>i.id===p.id);if(x)x.qty++;else c.push({id:p.id,name:p.name,price:Number(p.price||0),qty:1});saveCart(c);showCartAddedToast(p)}
function showCartAddedToast(p){
  let t=document.querySelector("#fgCartToast");
  if(!t){document.body.insertAdjacentHTML("beforeend",`<div id="fgCartToast" class="fg-cart-toast" role="status" aria-live="polite"><span>✓</span><div><strong>Added to cart</strong><small></small></div></div>`);t=document.querySelector("#fgCartToast");}
  const small=t.querySelector("small"); if(small) small.textContent=p?.name||"Product";
  t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  clearTimeout(window.FG_CART_TOAST_TIMER); window.FG_CART_TOAST_TIMER=setTimeout(()=>t.classList.remove("show"),1800);
}
function removeFromCart(id){saveCart(getCart().filter(i=>i.id!==id));openCart()}
function changeQty(id,d){const c=getCart(),x=c.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)return removeFromCart(id);saveCart(c);openCart()}
function updateCartUI(){
  const c=getCart(),count=c.reduce((s,i)=>s+i.qty,0),total=c.reduce((s,i)=>s+i.price*i.qty,0);
  document.querySelectorAll("[data-cart-count]").forEach(e=>e.textContent=count);
  document.querySelectorAll("[data-cart-total]").forEach(e=>e.textContent=money(total));
  const b=document.querySelector("#cartBody");if(!b)return;
  if(!c.length){b.innerHTML=`<div class="cart-empty"><div>🛒</div><h3>Your cart is empty</h3><p>Add a product to start your order.</p><a class="btn btn-blue" href="products.html">Browse Products</a></div>`;document.querySelector("#cartCheckout")?.setAttribute("hidden","");return;}
  document.querySelector("#cartCheckout")?.removeAttribute("hidden");
  b.innerHTML=c.map(i=>`<div class="cart-item"><div><strong>${escapeHtml(i.name)}</strong><span>${money(i.price)} each</span></div><div class="cart-item-actions"><button data-cart-minus="${escapeHtml(i.id)}">−</button><b>${i.qty}</b><button data-cart-plus="${escapeHtml(i.id)}">+</button><button class="cart-remove" data-cart-remove="${escapeHtml(i.id)}">×</button></div></div>`).join("");
  const co=document.querySelector("#cartCheckout");if(co)co.href=waCart(c);
}
function ensureCartDrawer(){if(document.querySelector("#cartDrawer"))return;document.body.insertAdjacentHTML("beforeend",`<div id="cartDrawer" class="cart-drawer" hidden><div class="cart-backdrop" data-close-cart></div><aside class="cart-panel"><div class="cart-head"><div><span class="eyebrow">YOUR ORDER</span><h2>Cart</h2></div><button class="drawer-close" data-close-cart>×</button></div><div id="cartBody" class="cart-body"></div><div class="cart-foot"><div class="cart-total"><span>Total</span><strong data-cart-total>৳0</strong></div><a id="cartCheckout" class="btn btn-blue btn-block" href="#" target="_blank" rel="noopener">Order on WhatsApp →</a></div></aside></div>`);updateCartUI()}
function openCart(){ensureCartDrawer();const d=document.querySelector("#cartDrawer");d.hidden=false;document.body.classList.add("drawer-open");requestAnimationFrame(()=>d.classList.add("is-open"));updateCartUI()}
function closeCart(){const d=document.querySelector("#cartDrawer");if(!d)return;d.classList.remove("is-open");setTimeout(()=>{d.hidden=true},180);document.body.classList.remove("drawer-open")}

function openProductPage(p){
  if(!p || !p.id)return;
  closeSearchSuggestions();
  document.activeElement?.blur?.();
  try{sessionStorage.setItem('fg_open_product',JSON.stringify(p));}catch{}
  const url='product.html?id='+encodeURIComponent(p.id);
  if(window.location.pathname.endsWith('/product.html') || window.location.pathname.endsWith('product.html')){
    history.pushState({productId:p.id},'',url);
    renderProductPage(p);
    window.scrollTo({top:0,behavior:'smooth'});
  }else{
    location.href=url;
  }
}
function renderProductPage(p){
  const root=document.querySelector('#productDetail'); if(!root||!p)return;
  const price=Number(p.price||0), mrp=Number(p.mrp||0), discount=mrp>price?Math.round((1-price/mrp)*100):0;
  const isPhone=['Mobile Phones','Feature Phone'].includes(String(p.category||''));
  const label=isPhone?'Specifications':'Product Description';
  const image=p.image?`<img class="detail-main-image" src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||'Product')}" decoding="async" fetchpriority="high" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="detail-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span>`:`<span class="detail-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span>`;
  root.innerHTML=`
    <div class="product-breadcrumb"><a href="index.html">Home</a><span>›</span><a href="products.html?cat=${encodeURIComponent(p.category||'')}">${escapeHtml(p.category||'Gadgets')}</a><span>›</span><strong>${escapeHtml(p.name||'Product')}</strong></div>
    <div class="detail-layout">
      <section class="detail-gallery"><div class="detail-image-shell">${image}</div></section>
      <section class="detail-summary">
        <div class="product-kicker">${escapeHtml(p.category||'Gadgets')}</div>
        <h1>${escapeHtml(p.name||'Product')}</h1>
        ${p.brand?`<div class="detail-brand">${escapeHtml(p.brand)}</div>`:''}
        <div class="detail-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del><span class="save-pill">-${discount}%</span>`:''}</div>
        <div class="detail-stock"><span></span>${escapeHtml(p.stock||'In Stock')}</div>
        <div class="detail-meta">${p.brand?`<div><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>`:''}<div><span>Category</span><strong>${escapeHtml(p.category||'Gadgets')}</strong></div>${p.warranty?`<div><span>Warranty</span><strong>${escapeHtml(p.warranty)}</strong></div>`:''}</div>
        <div class="detail-actions"><button class="btn btn-blue btn-large" data-add-product="${escapeHtml(p.id)}">Add to Cart</button><a class="btn btn-soft btn-large" href="${wa(p.name)}" target="_blank" rel="noopener">WhatsApp Order</a></div>
        <div class="detail-benefits"><span>🛡️ Original</span><span>↻ Warranty</span><span>🚚 Delivery</span><span>💬 Support</span></div>
      </section>
    </div>
    <section class="detail-info-card"><div class="detail-tabs"><button class="detail-tab active" type="button" data-detail-tab="info">${label}</button></div><div class="detail-tab-panel" id="detailInfoPanel">${escapeHtml(p.description||'Product information will be updated soon.').replace(/\n/g,'<br>')}</div></section>
    <section class="similar-section"><div class="section-head"><div><span class="eyebrow">YOU MAY ALSO LIKE</span><h2>Similar Products</h2></div><a href="products.html?cat=${encodeURIComponent(p.category||'')}">See All →</a></div><div class="similar-viewport"><div id="similarTrack" class="similar-track"></div><button class="similar-arrow prev" type="button" data-similar-prev aria-label="Previous">‹</button><button class="similar-arrow next" type="button" data-similar-next aria-label="Next">›</button></div></section>`;
  setupSimilarProducts(p);
  window.scrollTo({top:0,behavior:'instant'});
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
  const viewport=track.parentElement; let pos=0, timer;
  const step=()=>{const card=track.querySelector('.similar-card');if(!card)return;const gap=parseFloat(getComputedStyle(track).gap)||14;const w=card.getBoundingClientRect().width+gap;pos+=w;if(pos>=w*list.length){track.style.transition='none';pos=0;track.style.transform='translate3d(0,0,0)';requestAnimationFrame(()=>requestAnimationFrame(()=>{track.style.transition='transform .75s var(--ease-premium)';pos=w;track.style.transform=`translate3d(${-pos}px,0,0)`;}));}else{track.style.transform=`translate3d(${-pos}px,0,0)`;}};
  const start=()=>{clearInterval(timer);timer=setInterval(step,3800)}; const stop=()=>clearInterval(timer);
  viewport.addEventListener('mouseenter',stop);viewport.addEventListener('mouseleave',start);viewport.addEventListener('touchstart',stop,{passive:true});viewport.addEventListener('touchend',start,{passive:true});
  document.querySelector('[data-similar-next]')?.addEventListener('click',()=>{step();start()});
  document.querySelector('[data-similar-prev]')?.addEventListener('click',()=>{const card=track.querySelector('.similar-card');if(!card)return;const gap=parseFloat(getComputedStyle(track).gap)||14;const w=card.getBoundingClientRect().width+gap;pos=Math.max(0,pos-w);track.style.transform=`translate3d(${-pos}px,0,0)`;start()});
  track.style.transition='transform .75s var(--ease-premium)'; start();
}
function similarCard(p,i){const img=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||'Product')}" loading="lazy" decoding="async">`:'';return `<article class="similar-card" data-similar-id="${escapeHtml(p.id)}"><a href="product.html?id=${encodeURIComponent(p.id)}" class="similar-link"><div class="similar-image">${img||escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</div><div class="similar-copy"><small>${escapeHtml(p.brand||p.category||'')}</small><strong>${escapeHtml(p.name||'Product')}</strong><b>${money(p.price)}</b></div></a></article>`}

function categoryPill(cat){return `<a class="category-pill" href="products.html?cat=${encodeURIComponent(cat)}"><span class="cat-icon">${escapeHtml(CATEGORY_ICONS[cat]||"✦")}</span><span>${escapeHtml(cat)}</span><span class="pill-arrow">›</span></a>`}
const HOME_ACCESSORY_CATEGORIES=["Adapter & Cable","Charger","Earbud","Headphone","Neckband","Earphone","Speaker","Powerbank","Smart watch","Tripod","Boya","Screen Protector","Phone Case"];
function homeSubItem(label,cat,icon,extra=""){
  return `<a class="home-subitem ${extra}" href="products.html?cat=${encodeURIComponent(cat)}"><span>${escapeHtml(icon||CATEGORY_ICONS[cat]||"✦")}</span><strong>${escapeHtml(label)}</strong><b>›</b></a>`;
}
function renderCategories(products=[]){
  const target=document.querySelector("#homeCategories");if(!target)return;
  const available=new Set(products.map(p=>String(p.category||"").trim()).filter(Boolean));
  const accessories=[...HOME_ACCESSORY_CATEGORIES,...[...available].filter(c=>!HOME_ACCESSORY_CATEGORIES.includes(c)&&c!=="Mobile Phones"&&c!=="Feature Phone")].filter((x,i,a)=>x&&a.indexOf(x)===i);
  target.innerHTML=`
    <article class="home-shop-card" data-home-shop="mobile">
      <button class="home-shop-trigger" type="button" aria-expanded="false">
        <span class="home-shop-icon">▯</span>
        <span class="home-shop-copy"><strong>Mobile</strong><small>Smartphone &amp; Feature Phone</small></span>
        <span class="home-shop-chevron">›</span>
      </button>
      <div class="home-shop-panel"><div class="home-shop-panel-inner"><div class="home-subgrid">
        ${homeSubItem("Smartphone","Mobile Phones","▯","home-mobile-option")}
        ${homeSubItem("Feature Phone","Feature Phone","☎","home-mobile-option")}
      </div></div></div>
    </article>
    <article class="home-shop-card" data-home-shop="accessories">
      <button class="home-shop-trigger" type="button" aria-expanded="false">
        <span class="home-shop-icon">✦</span>
        <span class="home-shop-copy"><strong>Accessories &amp; Gadgets</strong><small>All mobile accessories &amp; everyday gadgets</small></span>
        <span class="home-shop-chevron">›</span>
      </button>
      <div class="home-shop-panel"><div class="home-shop-panel-inner"><div class="home-subgrid">
        ${accessories.map(c=>homeSubItem(c,c,CATEGORY_ICONS[c]||"✦")).join("")}
      </div></div></div>
    </article>`;
  target.querySelectorAll('.home-shop-trigger').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('.home-shop-card');
    const willOpen=!card.classList.contains('open');
    target.querySelectorAll('.home-shop-card.open').forEach(other=>{if(other!==card){other.classList.remove('open');other.querySelector('.home-shop-trigger')?.setAttribute('aria-expanded','false')}});
    card.classList.toggle('open',willOpen);btn.setAttribute('aria-expanded',String(willOpen));
  }));
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
  const start=()=>{clearInterval(timer);timer=setInterval(()=>{if(!paused&&!dragging)move(1)},4200)};
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
    if(moved)window.FG_SUPPRESS_CARD_CLICK_UNTIL=Date.now()+350;
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
  const image=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||"Product")}" loading="lazy" decoding="async" width="640" height="640" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="product-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`:`<span class="product-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`;
  return `<article class="product-card" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${escapeHtml(p.name||"product")}"><div class="product-visual">${discount?`<span class="discount-badge">-${discount}%</span>`:""}${p.featured?`<span class="featured-badge">Featured</span>`:""}${image}</div><div class="product-body"><div class="product-category">${escapeHtml(p.category||"Gadgets")}</div><h3>${escapeHtml(p.name||"Product")}</h3>${p.brand?`<div class="product-brand">${escapeHtml(p.brand)}</div>`:""}<div class="product-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del>`:""}</div><div class="product-bottom"><span class="stock-dot"></span>${escapeHtml(p.stock||"In Stock")}<button class="quick-add" data-add-product="${escapeHtml(p.id)}">Add +</button></div></div></article>`;
}
function renderProducts(list,id){const el=document.querySelector(id);if(!el)return;el._products=list;el.innerHTML=list.length?list.map((p,i)=>productCard(p,i)).join(""):`<div class="no-results"><div>⌕</div><h3>No products found</h3><p>Try another category or search.</p></div>`}

const CACHE_KEY="fg_products_cache_v3", CACHE_TTL=30*60*1000;
function readCachedProducts(){try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(x&&Array.isArray(x.data))return x.data}catch{}return null}
function writeCachedProducts(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data}))}catch{}}
async function fetchProducts(){
  if(!CONFIG.productsApiUrl||CONFIG.productsApiUrl.includes("PASTE_"))return CONFIG.fallbackProducts;
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),7000);
  try{const r=await fetch(CONFIG.productsApiUrl,{cache:"no-store",signal:controller.signal});if(!r.ok)throw Error(r.status);const d=await r.json();if(!Array.isArray(d))throw Error("Invalid data");writeCachedProducts(d);return d}catch(e){console.warn("Product API unavailable",e);return readCachedProducts()||CONFIG.fallbackProducts}finally{clearTimeout(timer)}
}
async function loadProductsFast(onData){
  const cached=readCachedProducts();
  if(cached?.length)onData(cached,true);
  const fresh=await fetchProducts();
  if(!cached||JSON.stringify(fresh)!==JSON.stringify(cached))onData(fresh,false);
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
    const add=e.target.closest("[data-add-product]");
    if(add){
      e.preventDefault();e.stopPropagation();
      const list=window.FG_PRODUCTS||products;
      const p=list.find(x=>String(x.id)===String(add.dataset.addProduct));
      if(p)addToCart(p);
      return;
    }
    const minus=e.target.closest("[data-cart-minus]");
    if(minus){e.preventDefault();e.stopPropagation();changeQty(minus.dataset.cartMinus,-1);return;}
    const plus=e.target.closest("[data-cart-plus]");
    if(plus){e.preventDefault();e.stopPropagation();changeQty(plus.dataset.cartPlus,1);return;}
    const remove=e.target.closest("[data-cart-remove]");
    if(remove){e.preventDefault();e.stopPropagation();removeFromCart(remove.dataset.cartRemove);return;}
    if(e.target.closest("[data-cart-open]")){openCart();return;}
    if(e.target.closest("[data-close-cart]")){closeCart();return;}
    if(e.target.closest("[data-close-modal]")){closeProductModal();return;}
    const card=e.target.closest(".product-card");
    if(Date.now() < (window.FG_SUPPRESS_CARD_CLICK_UNTIL||0)) return;
    if(card&&!e.target.closest("a,button,input,select")){
      const p=card.parentElement?._products?.[Number(card.dataset.productIndex)];
      if(p)openProductPage(p);
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeProductModal();closeCart();}
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

  const extras=[...new Set(products.map(p=>p.category).filter(Boolean))].filter(c=>!CATEGORY_LIST.includes(c));
  host.innerHTML=[...CATEGORY_LIST,...extras].map(categoryPill).join("");

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
function setupSidebar(){
  if(document.querySelector('#fgSidebar'))return;
  const cats=[...CATEGORY_LIST];
  document.body.insertAdjacentHTML('beforeend',`<div id="fgSidebarOverlay" class="fg-sidebar-overlay" hidden></div><aside id="fgSidebar" class="fg-sidebar" aria-hidden="true"><div class="fg-sidebar-head"><a class="fg-sidebar-brand" href="index.html"><img src="flash-gear-logo.webp" alt="FLASH GEAR BD"></a><button type="button" class="fg-sidebar-close" data-sidebar-close aria-label="Close menu">×</button></div><div class="fg-sidebar-menu"><a href="index.html">⌂ <span>Home</span><b>›</b></a><a href="products.html">▦ <span>All Products</span><b>›</b></a><div class="fg-sidebar-label">Categories</div>${cats.map(c=>`<a href="products.html?cat=${encodeURIComponent(c)}"><span class="fg-cat-icon">${escapeHtml(CATEGORY_ICONS[c]||'✦')}</span><span>${escapeHtml(c)}</span><b>›</b></a>`).join('')}<div class="fg-sidebar-label">Support</div><a href="warranty.html">♢ <span>Warranty</span><b>›</b></a><a href="delivery.html">⌁ <span>Delivery</span><b>›</b></a><a href="contact.html">◎ <span>Contact</span><b>›</b></a></div><div class="fg-sidebar-social"><a data-facebook target="_blank">f</a><a data-instagram target="_blank">◎</a><a class="wa-link" href="#" target="_blank">◉</a></div></aside>`);
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
  const cats=[...new Set([...CATEGORY_LIST,...products.map(p=>p.category).filter(Boolean)])];
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
  ensureCartDrawer();updateCartUI(); setupSidebar();
  const earlyParams=new URLSearchParams(location.search);
  if(document.querySelector('#productDetail')){try{const cachedProduct=JSON.parse(sessionStorage.getItem('fg_open_product')||'null');if(cachedProduct&&String(cachedProduct.id)===String(earlyParams.get('id')))renderProductPage(cachedProduct)}catch{}}
  let currentProducts=[];
  const apply=data=>{currentProducts=data||[];window.FG_PRODUCTS=currentProducts;buildCategoryMenu(currentProducts);renderCategories(currentProducts);const featured=currentProducts.filter(p=>p.featured);if(document.querySelector("#featured"))renderFeaturedProducts((featured.length?featured:currentProducts).slice(0,10));setupCatalog(currentProducts);setupSearchSuggestions(currentProducts); window.FG_REFRESH_SUGGESTIONS?.();};
  setupInteractions(currentProducts);
  await loadProductsFast(apply);
  // Rebind catalog after background refresh if necessary
  if(window.FG_PRODUCTS!==currentProducts){setupCatalog(window.FG_PRODUCTS)}
  const params=new URLSearchParams(location.search);
  if(document.querySelector('#productDetail')){
    const id=params.get('id');
    const findProduct=()=>{const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(id));if(p)renderProductPage(p);return !!p};
    if(!findProduct()){try{const cached=JSON.parse(sessionStorage.getItem('fg_open_product')||'null');if(cached&&String(cached.id)===String(id))renderProductPage(cached)}catch{}}
  }
});

window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('id');const p=(window.FG_PRODUCTS||[]).find(x=>String(x.id)===String(id));if(p)renderProductPage(p)});
