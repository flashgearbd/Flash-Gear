
/* FLASH GEAR BD — fluid interaction helpers */
(function(){
  document.addEventListener('click', function(e){
    const target = e.target.closest('button, a, [role="button"], .clickable');
    if (!target) return;
    target.classList.remove('fgbd-click-pop');
    void target.offsetWidth;
    target.classList.add('fgbd-click-pop');
    setTimeout(() => target.classList.remove('fgbd-click-pop'), 260);
  }, {passive:true});
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
function imageUrl(v){const u=String(v||"").trim();if(!u)return "";const m=u.match(/drive\.google\.com\/(?:uc\?(?:export=[^&]+&)?id=|file\/d\/)([A-Za-z0-9_-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`:u;}
function wa(name=""){const t=name?`Hello FLASH GEAR BD, I want to order: ${name}`:`Hello FLASH GEAR BD, I want to know about your products.`;return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(t)}`;}
function waCart(items){const lines=items.map(i=>`• ${i.name} × ${i.qty} — ${money(i.price*i.qty)}`);const total=items.reduce((s,i)=>s+i.price*i.qty,0);return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello FLASH GEAR BD, I want to order:\n${lines.join("\n")}\n\nTotal: ${money(total)}`)}`;}

function getCart(){try{return JSON.parse(localStorage.getItem("fg_cart")||"[]")}catch{return []}}
function saveCart(c){localStorage.setItem("fg_cart",JSON.stringify(c));updateCartUI()}
function addToCart(p){const c=getCart(),x=c.find(i=>i.id===p.id);if(x)x.qty++;else c.push({id:p.id,name:p.name,price:Number(p.price||0),qty:1});saveCart(c);openCart()}
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

function ensureProductModal(){if(document.querySelector("#productModal"))return;document.body.insertAdjacentHTML("beforeend",`<div id="productModal" class="product-modal" hidden><div class="product-modal-backdrop" data-close-modal></div><div class="product-modal-dialog" role="dialog" aria-modal="true"><button class="modal-close" data-close-modal aria-label="Close">×</button><div id="modalProductContent"></div></div></div>`)}
function showProduct(p){
  ensureProductModal();const m=document.querySelector("#productModal"),c=document.querySelector("#modalProductContent");
  const img=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||"Product")}" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="modal-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`:`<span class="modal-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`;
  const price=Number(p.price||0),mrp=Number(p.mrp||0),discount=mrp>price?Math.round((1-price/mrp)*100):0;
  c.innerHTML=`<div class="modal-product"><div class="modal-product-image">${img}</div><div class="modal-product-info"><div class="product-kicker">${escapeHtml(p.category||"Gadgets")}</div><h2>${escapeHtml(p.name||"Product")}</h2>${p.brand?`<div class="modal-brand">${escapeHtml(p.brand)}</div>`:""}<div class="modal-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del><span class="save-pill">-${discount}%</span>`:""}</div><div class="product-meta">${p.brand?`<div><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>`:""}<div><span>Category</span><strong>${escapeHtml(p.category||"Gadgets")}</strong></div><div><span>Availability</span><strong>${escapeHtml(p.stock||"In Stock")}</strong></div>${p.warranty?`<div><span>Warranty</span><strong>${escapeHtml(p.warranty)}</strong></div>`:""}</div><div class="modal-actions"><button class="btn btn-blue" data-add-product="${escapeHtml(p.id)}">Add to Cart</button><a class="btn btn-soft" href="${wa(p.name)}" target="_blank" rel="noopener">WhatsApp Order</a></div>${p.description?`<section class="modal-section"><h3>Product Description</h3><p>${escapeHtml(p.description)}</p></section>`:""}</div></div>`;
  m.hidden=false;requestAnimationFrame(()=>m.classList.add("is-open"));document.body.classList.add("modal-open");
}
function closeProductModal(){const m=document.querySelector("#productModal");if(!m)return;m.classList.remove("is-open");setTimeout(()=>{m.hidden=true},180);document.body.classList.remove("modal-open")}

function categoryPill(cat){return `<a class="category-pill" href="products.html?cat=${encodeURIComponent(cat)}"><span class="cat-icon">${escapeHtml(CATEGORY_ICONS[cat]||"✦")}</span><span>${escapeHtml(cat)}</span><span class="pill-arrow">›</span></a>`}
function renderCategories(products=[]){
  const target=document.querySelector("#homeCategories");if(!target)return;
  const extras=[...new Set(products.map(p=>String(p.category||"").trim()).filter(Boolean))].filter(c=>!CATEGORY_LIST.includes(c));
  target.innerHTML=[...CATEGORY_LIST,...extras].map(categoryPill).join("");
}
function productCard(p,index){
  const price=Number(p.price||0),mrp=Number(p.mrp||0),discount=mrp>price?Math.round((1-price/mrp)*100):0;
  const image=p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="${escapeHtml(p.name||"Product")}" loading="lazy" decoding="async" width="640" height="640" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="product-placeholder" hidden>${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`:`<span class="product-placeholder">${escapeHtml(CATEGORY_ICONS[p.category]||"✦")}</span>`;
  return `<article class="product-card" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${escapeHtml(p.name||"product")}"><div class="product-visual">${discount?`<span class="discount-badge">-${discount}%</span>`:""}${p.featured?`<span class="featured-badge">Featured</span>`:""}${image}</div><div class="product-body"><div class="product-category">${escapeHtml(p.category||"Gadgets")}</div><h3>${escapeHtml(p.name||"Product")}</h3>${p.brand?`<div class="product-brand">${escapeHtml(p.brand)}</div>`:""}<div class="product-price">${money(price)} ${mrp>price?`<del>${money(mrp)}</del>`:""}</div><div class="product-bottom"><span class="stock-dot"></span>${escapeHtml(p.stock||"In Stock")}<button class="quick-add" data-add-product="${escapeHtml(p.id)}">Add +</button></div></div></article>`;
}
function renderProducts(list,id){const el=document.querySelector(id);if(!el)return;el._products=list;el.innerHTML=list.length?list.map((p,i)=>productCard(p,i)).join(""):`<div class="no-results"><div>⌕</div><h3>No products found</h3><p>Try another category or search.</p></div>`}

const CACHE_KEY="fg_products_cache_v2", CACHE_TTL=5*60*1000;
function readCachedProducts(){try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(x&&Array.isArray(x.data))return x.data}catch{}return null}
function writeCachedProducts(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data}))}catch{}}
async function fetchProducts(){
  if(!CONFIG.productsApiUrl||CONFIG.productsApiUrl.includes("PASTE_"))return CONFIG.fallbackProducts;
  try{const r=await fetch(CONFIG.productsApiUrl,{cache:"no-store"});if(!r.ok)throw Error(r.status);const d=await r.json();if(!Array.isArray(d))throw Error("Invalid data");writeCachedProducts(d);return d}catch(e){console.warn("Product API unavailable",e);return readCachedProducts()||CONFIG.fallbackProducts}
}
async function loadProductsFast(onData){
  const cached=readCachedProducts();
  if(cached?.length){onData(cached,true);}
  const fresh=await fetchProducts();
  if(!cached||JSON.stringify(fresh)!==JSON.stringify(cached))onData(fresh,false);
  return fresh;
}

function closeSearchSuggestions(except=null){
  document.querySelectorAll('.search-suggestions').forEach(box=>{if(box!==except)box.remove()});
}
function setupSearchSuggestions(products){
  // Bind once. Always read the latest product list so suggestions work after
  // cached/fresh API refreshes on every page.
  if(window.FG_SEARCH_SUGGESTIONS_READY)return;
  window.FG_SEARCH_SUGGESTIONS_READY=true;

  const getProducts=()=>Array.isArray(window.FG_PRODUCTS)?window.FG_PRODUCTS:(products||[]);
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
        box.innerHTML='<div class="suggest-empty">No matching product</div>';
        box.hidden=false;
        return;
      }
      box.innerHTML=matches.map(p=>`<button type="button" class="suggest-item" data-suggest-product="${escapeHtml(p.id)}"><span class="suggest-thumb">${p.image?`<img src="${escapeHtml(imageUrl(p.image))}" alt="" loading="lazy" decoding="async">`:escapeHtml(CATEGORY_ICONS[p.category]||'✦')}</span><span class="suggest-copy"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.brand||p.category||'')}</small></span><b>${money(p.price)}</b></button>`).join('');
      box.hidden=false;
    };

    input.addEventListener('input',render);
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
        showProduct(p);
      },0);
    });
  });

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
    if(card&&!e.target.closest("a,button,input,select")){
      const p=card.parentElement?._products?.[Number(card.dataset.productIndex)];
      if(p)showProduct(p);
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeProductModal();closeCart();}
    const card=e.target.closest?.(".product-card");
    if(card&&(e.key==="Enter"||e.key===" ")){
      e.preventDefault();
      const p=card.parentElement?._products?.[Number(card.dataset.productIndex)];
      if(p)showProduct(p);
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
function setupCatalog(products){const catalog=document.querySelector("#catalog");if(!catalog)return;const s=document.querySelector("#catalogSearch"),c=document.querySelector("#category"),sort=document.querySelector("#sort"),params=new URLSearchParams(location.search),q0=params.get("q"),cat0=params.get("cat");if(s&&q0)s.value=q0;
  const cats=[...new Set([...CATEGORY_LIST,...products.map(p=>p.category).filter(Boolean)])];if(c)c.innerHTML=`<option value="All">All Categories</option>`+cats.map(x=>`<option>${escapeHtml(x)}</option>`).join("");if(c&&cat0)c.value=cat0;
  const filter=()=>{const q=(s?.value||"").toLowerCase().trim(),cat=c?.value||"All";let list=products.filter(p=>(cat==="All"||p.category===cat)&&(!q||[p.name,p.category,p.brand,p.description].join(" ").toLowerCase().includes(q)));const mode=sort?.value||"featured";if(mode==="low")list.sort((a,b)=>a.price-b.price);if(mode==="high")list.sort((a,b)=>b.price-a.price);if(mode==="name")list.sort((a,b)=>String(a.name).localeCompare(String(b.name)));if(mode==="featured")list.sort((a,b)=>Number(b.featured)-Number(a.featured));renderProducts(list,"#catalog");const rc=document.querySelector("#resultCount");if(rc)rc.textContent=`${list.length} product${list.length===1?"":"s"}`};
  s?.addEventListener("input",filter);c?.addEventListener("change",filter);sort?.addEventListener("change",filter);filter();
}

document.addEventListener("DOMContentLoaded",async()=>{
  document.querySelectorAll(".wa-link").forEach(a=>{a.href=wa();a.target="_blank";a.rel="noopener"});
  document.querySelectorAll("[data-facebook]").forEach(a=>a.href=CONFIG.facebook);document.querySelectorAll("[data-instagram]").forEach(a=>a.href=CONFIG.instagram);document.querySelectorAll("#year").forEach(e=>e.textContent=new Date().getFullYear());
  ensureCartDrawer();updateCartUI();
  let currentProducts=[];
  const apply=data=>{currentProducts=data||[];window.FG_PRODUCTS=currentProducts;buildCategoryMenu(currentProducts);renderCategories(currentProducts);const featured=currentProducts.filter(p=>p.featured);if(document.querySelector("#featured"))renderProducts((featured.length?featured:currentProducts).slice(0,8),"#featured");setupCatalog(currentProducts);setupSearchSuggestions(currentProducts)};
  setupInteractions(currentProducts);
  await loadProductsFast(apply);
  // Rebind catalog after background refresh if necessary
  if(window.FG_PRODUCTS!==currentProducts){setupCatalog(window.FG_PRODUCTS)}
});
