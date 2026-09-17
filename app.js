
const CONFIG = {
  productsApiUrl: "https://script.google.com/macros/s/AKfycbzgXkfRQxkfDj8N6h1JM9NbmGWirseH1aPHyJ_jeuWPkmPw4CFiEcGZws_hqYbunRdedA/exec",
  whatsappNumber: "8801601093553",
  facebook: "https://www.facebook.com/share/1HyzxwuCR8/",
  instagram: "https://www.instagram.com/flashgearbd/",
  tiktok: "#",
  youtube: "#",
  fallbackProducts: []
};

const CATEGORY_LIST = [
  "Feature Phone",
  "Mobile Phones",
  "Adapter & Cable",
  "Charger",
  "Earbud",
  "Headphone",
  "Neckband",
  "Earphone",
  "Speaker",
  "Powerbank",
  "Smart watch",
  "Tripod",
  "Boya",
  "Screen Protector",
  "Phone Case"
];

const CATEGORY_ICONS = {
  "Feature Phone":"☎",
  "Mobile Phones":"▯",
  "Adapter & Cable":"⌁",
  "Charger":"⚡",
  "Earbud":"◉",
  "Headphone":"◖◗",
  "Neckband":"⌁",
  "Earphone":"♬",
  "Speaker":"◉",
  "Powerbank":"▰",
  "Smart watch":"◷",
  "Tripod":"♜",
  "Boya":"●",
  "Screen Protector":"▱",
  "Phone Case":"▣"
};

const CATEGORY_SPRITE_POS = {
  "Feature Phone":"0% 0%",
  "Mobile Phones":"33.333% 0%",
  "Adapter & Cable":"66.666% 0%",
  "Charger":"100% 0%",
  "Earbud":"0% 33.333%",
  "Headphone":"33.333% 33.333%",
  "Neckband":"66.666% 33.333%",
  "Earphone":"100% 33.333%",
  "Speaker":"0% 66.666%",
  "Powerbank":"33.333% 66.666%",
  "Smart watch":"66.666% 66.666%",
  "Tripod":"100% 66.666%",
  "Boya":"0% 100%",
  "Screen Protector":"33.333% 100%",
  "Phone Case":"66.666% 100%"
};

const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"
  }[c]));
}

function wa(name = "") {
  const text = name
    ? `Hello FLASH GEAR BD, I want to order: ${name}`
    : `Hello FLASH GEAR BD, I want to know about your products.`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function waCart(items) {
  const lines = items.map(i => `• ${i.name} × ${i.qty} — ${money(i.price * i.qty)}`);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const text = `Hello FLASH GEAR BD, I want to order:\n${lines.join("\n")}\n\nTotal: ${money(total)}`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("fg_cart") || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("fg_cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({id: product.id, name: product.name, price: Number(product.price || 0), qty: 1});
  saveCart(cart);
  openCart();
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  openCart();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(id);
  saveCart(cart);
  openCart();
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.querySelectorAll("[data-cart-total]").forEach(el => el.textContent = money(total));
  const body = document.querySelector("#cartBody");
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><h3>Your cart is empty</h3><p>Add products and they will appear here.</p><a class="btn btn-blue" href="products.html">Start Shopping</a></div>`;
    const checkout = document.querySelector("#cartCheckout");
    if (checkout) checkout.style.display = "none";
    return;
  }

  body.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-main">
        <strong>${escapeHtml(i.name)}</strong>
        <span>${money(i.price)} each</span>
      </div>
      <div class="cart-item-actions">
        <button data-cart-minus="${escapeHtml(i.id)}">−</button>
        <b>${i.qty}</b>
        <button data-cart-plus="${escapeHtml(i.id)}">+</button>
        <button class="cart-remove" data-cart-remove="${escapeHtml(i.id)}">×</button>
      </div>
    </div>`).join("");

  const checkout = document.querySelector("#cartCheckout");
  if (checkout) {
    checkout.style.display = "";
    checkout.href = waCart(cart);
  }
}

function ensureCartDrawer() {
  if (document.querySelector("#cartDrawer")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="cartDrawer" class="cart-drawer" hidden>
      <div class="cart-backdrop" data-close-cart></div>
      <aside class="cart-panel">
        <div class="cart-head"><div><span class="eyebrow">YOUR SHOPPING BAG</span><h2>Cart</h2></div><button class="drawer-close" data-close-cart>×</button></div>
        <div id="cartBody" class="cart-body"></div>
        <div class="cart-foot">
          <div class="cart-total"><span>Total</span><strong data-cart-total>৳0</strong></div>
          <a id="cartCheckout" class="btn btn-blue btn-block" href="#" target="_blank" rel="noopener">Order Cart on WhatsApp →</a>
        </div>
      </aside>
    </div>`);
  updateCartUI();
}

function openCart() {
  ensureCartDrawer();
  const drawer = document.querySelector("#cartDrawer");
  drawer.hidden = false;
  document.body.classList.add("drawer-open");
  updateCartUI();
}

function closeCart() {
  const drawer = document.querySelector("#cartDrawer");
  if (!drawer) return;
  drawer.hidden = true;
  document.body.classList.remove("drawer-open");
}

function ensureProductModal() {
  if (document.querySelector("#productModal")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="productModal" class="product-modal" hidden aria-hidden="true">
      <div class="product-modal-backdrop" data-close-modal></div>
      <div class="product-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalProductName">
        <button class="modal-close" type="button" aria-label="Close" data-close-modal>×</button>
        <div id="modalProductContent"></div>
      </div>
    </div>`);
}

function showProduct(p) {
  ensureProductModal();
  const modal = document.querySelector("#productModal");
  const content = document.querySelector("#modalProductContent");
  const image = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name || "Product")}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="modal-placeholder" style="display:none">${escapeHtml(CATEGORY_ICONS[p.category] || "✦")}</span>`
    : `<span class="modal-placeholder">${escapeHtml(CATEGORY_ICONS[p.category] || "✦")}</span>`;
  const price = Number(p.price || 0), mrp = Number(p.mrp || 0);
  content.innerHTML = `
    <div class="modal-product">
      <div class="modal-product-image">${image}</div>
      <div class="modal-product-info">
        <div class="product-kicker">${escapeHtml(p.category || "Gadgets")}</div>
        <h2 id="modalProductName">${escapeHtml(p.name || "Product")}</h2>
        ${p.brand ? `<div class="modal-brand">${escapeHtml(p.brand)}</div>` : ""}
        <div class="modal-price">${money(price)}${mrp > price ? ` <del>${money(mrp)}</del><span class="save-pill">Save ${money(mrp-price)}</span>` : ""}</div>
        ${p.description ? `<div class="modal-section"><h3>Product Description</h3><p>${escapeHtml(p.description)}</p></div>` : ""}
        <div class="product-meta">
          ${p.category ? `<div><span>Category</span><strong>${escapeHtml(p.category)}</strong></div>` : ""}
          ${p.brand ? `<div><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>` : ""}
          <div><span>Availability</span><strong>${escapeHtml(p.stock || "In Stock")}</strong></div>
          ${p.warranty ? `<div><span>Warranty</span><strong>${escapeHtml(p.warranty)}</strong></div>` : ""}
        </div>
        <div class="modal-actions">
          <button class="btn btn-blue" data-add-product="${escapeHtml(p.id)}">Add to Cart</button>
          <a class="btn btn-outline" href="${wa(p.name)}" target="_blank" rel="noopener">WhatsApp Order</a>
        </div>
      </div>
    </div>`;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal._product = p;
}

function closeProductModal() {
  const modal = document.querySelector("#productModal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function categorySprite(category) {
  const pos = CATEGORY_SPRITE_POS[category] || "100% 100%";
  return `<div class="cat-sprite" style="background-position:${pos}" aria-hidden="true"></div>`;
}

function renderCategories(products = []) {
  const target = document.querySelector("#homeCategories");
  if (!target) return;

  const productCats = [...new Set(products.map(p => String(p.category || "").trim()).filter(Boolean))];
  const extras = productCats.filter(c => !CATEGORY_LIST.includes(c));
  const cats = [...CATEGORY_LIST, ...extras];

  target.innerHTML = cats.map(cat => `
    <a class="cat-card" href="products.html?cat=${encodeURIComponent(cat)}">
      <div class="cat-image">${categorySprite(cat)}</div>
      <div class="cat-card-foot"><strong>${escapeHtml(cat)}</strong><span>→</span></div>
    </a>`).join("");
}

function productCard(p, index) {
  const image = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name || "Product")}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="product-placeholder" style="display:none">${escapeHtml(CATEGORY_ICONS[p.category] || "✦")}</span>`
    : `<span class="product-placeholder">${escapeHtml(CATEGORY_ICONS[p.category] || "✦")}</span>`;
  const mrp = Number(p.mrp || 0), price = Number(p.price || 0);
  const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return `
    <article class="product-card" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${escapeHtml(p.name || "product")}">
      <div class="product-visual">
        ${discount ? `<span class="discount-badge">-${discount}%</span>` : ""}
        ${p.featured ? `<span class="featured-badge">Featured</span>` : ""}
        <button class="wish-btn" type="button" aria-label="Save product">♡</button>
        ${image}
      </div>
      <div class="product-body">
        <div class="product-category">${escapeHtml(p.category || "Gadgets")}</div>
        <h3>${escapeHtml(p.name || "Product")}</h3>
        ${p.brand ? `<div class="product-brand">${escapeHtml(p.brand)}</div>` : ""}
        <div class="product-price">${money(price)}${mrp > price ? ` <del>${money(mrp)}</del>` : ""}</div>
        <div class="product-bottom">
          <span class="stock-dot"></span>${escapeHtml(p.stock || "In Stock")}
          <button class="quick-add" type="button" data-add-product="${escapeHtml(p.id)}">Add +</button>
        </div>
      </div>
    </article>`;
}

function renderProducts(list, id) {
  const el = document.querySelector(id);
  if (!el) return;
  el._products = list;
  el.innerHTML = list.length
    ? list.map((p, i) => productCard(p, i)).join("")
    : `<div class="no-results"><div>⌕</div><h3>No products found</h3><p>Try another search or category.</p></div>`;
}

async function loadProducts() {
  if (!CONFIG.productsApiUrl || CONFIG.productsApiUrl.includes("PASTE_")) return CONFIG.fallbackProducts;
  try {
    const response = await fetch(CONFIG.productsApiUrl, {cache:"no-store"});
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid product data");
    return data;
  } catch (error) {
    console.warn("FLASH GEAR BD product API unavailable:", error);
    return CONFIG.fallbackProducts;
  }
}

function setupProductInteractions(products) {
  document.addEventListener("click", event => {
    const add = event.target.closest("[data-add-product]");
    if (add) {
      event.preventDefault();
      event.stopPropagation();
      const p = products.find(x => String(x.id) === String(add.dataset.addProduct));
      if (p) addToCart(p);
      return;
    }

    const remove = event.target.closest("[data-cart-remove]");
    if (remove) return removeFromCart(remove.dataset.cartRemove);
    const minus = event.target.closest("[data-cart-minus]");
    if (minus) return changeQty(minus.dataset.cartMinus, -1);
    const plus = event.target.closest("[data-cart-plus]");
    if (plus) return changeQty(plus.dataset.cartPlus, 1);

    if (event.target.closest("[data-close-cart]")) { closeCart(); return; }
    if (event.target.closest("[data-cart-open]")) { openCart(); return; }

    const close = event.target.closest("[data-close-modal]");
    if (close) { closeProductModal(); return; }

    const product = event.target.closest(".product-card");
    if (!product || event.target.closest("a, button, input, select")) return;
    const grid = product.parentElement;
    const p = grid?._products?.[Number(product.dataset.productIndex)];
    if (p) showProduct(p);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeProductModal(); closeCart(); }
    const product = event.target.closest?.(".product-card");
    if (product && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      const grid = product.parentElement;
      const p = grid?._products?.[Number(product.dataset.productIndex)];
      if (p) showProduct(p);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll(".wa-link").forEach(a => {
    a.href = wa(); a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-facebook]").forEach(a => a.href = CONFIG.facebook);
  document.querySelectorAll("[data-instagram]").forEach(a => a.href = CONFIG.instagram);
  document.querySelectorAll("[data-tiktok]").forEach(a => a.href = CONFIG.tiktok);
  document.querySelectorAll("[data-youtube]").forEach(a => a.href = CONFIG.youtube);
  document.querySelectorAll("#year").forEach(e => e.textContent = new Date().getFullYear());

  ensureCartDrawer();
  const products = await loadProducts();
  window.FG_PRODUCTS = products;
  setupProductInteractions(products);
  renderCategories(products);

  const featured = products.filter(p => p.featured);
  if (document.querySelector("#featured")) {
    renderProducts((featured.length ? featured : products).slice(0, 8), "#featured");
  }

  const catalog = document.querySelector("#catalog");
  if (catalog) {
    const s = document.querySelector("#catalogSearch");
    const c = document.querySelector("#category");
    const sort = document.querySelector("#sort");
    const params = new URLSearchParams(location.search);
    const q0 = params.get("q"), cat0 = params.get("cat");
    if (s && q0) s.value = q0;
    if (c && cat0) c.value = cat0;

    const cats = [...new Set([...CATEGORY_LIST, ...products.map(p => p.category).filter(Boolean)])];
    if (c) {
      c.innerHTML = `<option value="All">All Categories</option>` +
        cats.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("");
      if (cat0) c.value = cat0;
    }

    function filter() {
      const q = (s?.value || "").toLowerCase().trim();
      const cat = c?.value || "All";
      let list = products.filter(p =>
        (cat === "All" || p.category === cat) &&
        (!q || [p.name,p.category,p.brand,p.description].join(" ").toLowerCase().includes(q))
      );
      const mode = sort?.value || "featured";
      if (mode === "low") list.sort((a,b) => Number(a.price||0) - Number(b.price||0));
      if (mode === "high") list.sort((a,b) => Number(b.price||0) - Number(a.price||0));
      if (mode === "name") list.sort((a,b) => String(a.name).localeCompare(String(b.name)));
      renderProducts(list, "#catalog");
      const resultCount = document.querySelector("#resultCount");
      if (resultCount) resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    }
    s?.addEventListener("input", filter);
    c?.addEventListener("change", filter);
    sort?.addEventListener("change", filter);
    filter();
  }

  document.querySelectorAll("[data-category-link]").forEach(a => {
    a.addEventListener("click", e => {
      const cat = a.dataset.categoryLink;
      if (cat) location.href = `products.html?cat=${encodeURIComponent(cat)}`;
    });
  });

  updateCartUI();
});
