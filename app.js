const CONFIG={
  whatsappNumber:"8801XXXXXXXXX",
  facebook:"https://www.facebook.com/flashgearbd",
  instagram:"https://www.instagram.com/flashgearbd/",
  tiktok:"#",
  youtube:"#",
  products:[
    {name:"65W Fast Charger",category:"Chargers",price:1290,icon:"⚡",featured:true},
    {name:"TWS Wireless Earbuds",category:"Audio",price:1490,icon:"🎧",featured:true},
    {name:"10,000mAh Power Bank",category:"Power",price:1790,icon:"🔋",featured:true},
    {name:"Premium Phone Case",category:"Protection",price:450,icon:"🛡️",featured:true},
    {name:"Type-C Fast Charging Cable",category:"Accessories",price:350,icon:"🔌"},
    {name:"Wireless Neckband",category:"Audio",price:990,icon:"🎵"},
    {name:"Magnetic Phone Holder",category:"Gadgets",price:690,icon:"✨"},
    {name:"USB-C to USB-C Cable",category:"Chargers",price:490,icon:"🔗"}
  ]
};
const money=n=>"৳"+Number(n).toLocaleString("en-BD");
const wa=name=>`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(name?`Hello FLASH GEAR BD, I want to order: ${name}`:`Hello FLASH GEAR BD, I want to know about your products.`)}`;
function card(p){return `<article class="product"><div class="product-img">${p.icon}</div><div class="product-body"><span class="tag">${p.category}</span><h3>${p.name}</h3><div class="price">${money(p.price)}</div><a class="order" target="_blank" rel="noopener" href="${wa(p.name)}">Order on WhatsApp →</a></div></article>`}
function render(list,id){const e=document.querySelector(id);if(e)e.innerHTML=list.map(card).join("")}
document.addEventListener("DOMContentLoaded",()=>{
document.querySelectorAll(".wa-link").forEach(a=>{a.href=wa();a.target="_blank";a.rel="noopener"});
document.querySelectorAll("[data-facebook]").forEach(a=>a.href=CONFIG.facebook);
document.querySelectorAll("[data-instagram]").forEach(a=>a.href=CONFIG.instagram);
document.querySelectorAll("[data-tiktok]").forEach(a=>a.href=CONFIG.tiktok);
document.querySelectorAll("[data-youtube]").forEach(a=>a.href=CONFIG.youtube);
document.querySelectorAll("#year").forEach(e=>e.textContent=new Date().getFullYear());
if(document.querySelector("#featured"))render(CONFIG.products.filter(p=>p.featured),"#featured");
const catalog=document.querySelector("#catalog");
if(catalog){
 const s=document.querySelector("#catalogSearch"),c=document.querySelector("#category");
 const params=new URLSearchParams(location.search); const q0=params.get("q"),cat0=params.get("cat");
 if(q0)s.value=q0;if(cat0 && [...c.options].some(o=>o.value===cat0))c.value=cat0;
 function filter(){const q=s.value.toLowerCase(),cat=c.value;const list=CONFIG.products.filter(p=>(cat==="All"||p.category===cat)&&(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));render(list,"#catalog");document.querySelector("#empty").hidden=!!list.length}
 s.addEventListener("input",filter);c.addEventListener("change",filter);filter();
}});
