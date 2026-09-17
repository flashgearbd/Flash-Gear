const CONFIG = {
  productsApiUrl: "https://script.google.com/macros/s/AKfycbzgXkfRQxkfDj8N6h1JM9NbmGWirseH1aPHyJ_jeuWPkmPw4CFiEcGZws_hqYbunRdedA/exec",
  whatsappNumber: "8801601093553",
  facebook: "https://www.facebook.com/share/1HyzxwuCR8/",
  instagram: "https://www.instagram.com/flashgearbd/",
  fallbackProducts: []
};

const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");
const wa = name => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(name ? `Hello FLASH GEAR BD, I want to order: ${name}` : `Hello FLASH GEAR BD, I want to know about your products.`)}`;

function card(p) {
  const image = p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">` : `<span class="product-placeholder">${iconFor(p.category)}</span>`;
  const mrp = Number(p.mrp || 0);
  const price = Number(p.price || 0);
  return `<article class="product"><div class="product-img">${image}</div><div class="product-body"><span class="tag">${escapeHtml(p.category || "Gadgets")}</span><h3>${escapeHtml(p.name || "Product")}</h3>${p.brand ? `<small>${escapeHtml(p.brand)}</small>` : ""}<div class="price">${money(price)}${mrp > price ? ` <del>${money(mrp)}</del>` : ""}</div><div class="stock">${escapeHtml(p.stock || "In Stock")}</div><a class="order" target="_blank" rel="noopener" href="${wa(p.name)}">Order on WhatsApp →</a></div></article>`;
}

function iconFor(category) {
  const map = { Mobile:"📱", Accessories:"🔌", Chargers:"⚡", Audio:"🎧", Protection:"🛡️", Power:"🔋", Gadgets:"✨", Others:"📦" };
  return map[category] || "📦";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

function render(list, id) {
  const el = document.querySelector(id);
  if (el) el.innerHTML = list.map(card).join("");
}

async function loadProducts() {
  if (!CONFIG.productsApiUrl || CONFIG.productsApiUrl.includes("PASTE_")) return CONFIG.fallbackProducts;
  try {
    const response = await fetch(CONFIG.productsApiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid product data");
    return data;
  } catch (error) {
    console.warn("FLASH GEAR BD product API unavailable:", error);
    return CONFIG.fallbackProducts;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll(".wa-link").forEach(a => { a.href = wa(); a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll("[data-facebook]").forEach(a => a.href = CONFIG.facebook);
  document.querySelectorAll("[data-instagram]").forEach(a => a.href = CONFIG.instagram);
  document.querySelectorAll("#year").forEach(e => e.textContent = new Date().getFullYear());

  const products = await loadProducts();

  if (document.querySelector("#featured")) {
    const featured = products.filter(p => p.featured);
    render((featured.length ? featured : products).slice(0, 8), "#featured");
  }

  const catalog = document.querySelector("#catalog");
  if (catalog) {
    const s = document.querySelector("#catalogSearch");
    const c = document.querySelector("#category");
    const params = new URLSearchParams(location.search);
    const q0 = params.get("q"), cat0 = params.get("cat");
    if (s && q0) s.value = q0;
    if (c && cat0 && [...c.options].some(o => o.value === cat0)) c.value = cat0;

    function filter() {
      const q = (s?.value || "").toLowerCase().trim();
      const cat = c?.value || "All";
      const list = products.filter(p => (cat === "All" || p.category === cat) && (!q || [p.name,p.category,p.brand,p.description].join(" ").toLowerCase().includes(q)));
      render(list, "#catalog");
      const empty = document.querySelector("#empty");
      if (empty) empty.hidden = !!list.length;
    }
    s?.addEventListener("input", filter);
    c?.addEventListener("change", filter);
    filter();
  }
});
