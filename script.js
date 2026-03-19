/* ═══════════════════════════════════════════════════════════
   script.js — UltraKick Football Store
   Cleaned & Fixed Version with Demo Mode Fallback
═══════════════════════════════════════════════════════════ */

'use strict';

const API_BASE = 'http://localhost:3000';

// RUNTIME STATE
const store = {
  jerseyGrid: [],
  bootsGrid:  [],
  ballsGrid:  []
};

let cart = [];

/* ══════════════════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════════════════ */
function showSkeletons(gridId, count = 4) {
  const skeletonHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line w70"></div>
        <div class="skel-line w45"></div>
        <div class="skel-line w55"></div>
      </div>
    </div>
  `).join('');
  document.getElementById(gridId).innerHTML = skeletonHTML;
}

/* ══════════════════════════════════════════════════════════
   RENDER PRODUCTS
══════════════════════════════════════════════════════════ */
function renderProducts(data, gridId, sizeLabel) {
  const grid = document.getElementById(gridId);

  if (!Array.isArray(data) || data.length === 0) {
    grid.innerHTML = `<div class="fetch-error"><h4>No products found</h4></div>`;
    return;
  }

  grid.innerHTML = data.map((product, idx) => {
    let badgeClass = '';
    if (['New', 'new'].includes(product.badge)) badgeClass = 'new';
    else if (['Best Seller', 'Popular', 'hot'].includes(product.badge)) badgeClass = 'hot';

    const sizesHTML = product.sizes
      ? `<div class="size-selector">
           <span class="size-label">${sizeLabel || 'Size'}</span>
           <div class="size-btns">
             ${product.sizes.split(',').map((size, sIdx) =>
               `<button class="sz${sIdx === 0 ? ' active' : ''}" onclick="pickSize(this)">${size.trim()}</button>`
             ).join('')}
           </div>
         </div>`
      : '';

    return `
      <div class="product-card" data-idx="${idx}" data-grid="${gridId}">
        ${product.badge ? `<div class="p-badge ${badgeClass}">${product.badge}</div>` : ''}
        <div class="p-img-wrap">
          <img src="${product.image_path.startsWith('http') ? product.image_path : API_BASE + '/' + product.image_path}" 
               alt="${product.name}" onerror="this.src='https://placehold.co/400x400/101810/00ff87?text=No+Image'">
        </div>
        <div class="p-info">
          <div class="p-name">${product.name}</div>
          <div class="p-sub">${product.sub}</div>
          <div class="p-price">₹${Number(product.price).toLocaleString('en-IN')}</div>
          ${sizesHTML}
          <button class="add-btn" onclick="addToCart(${idx}, '${gridId}', this)">
            <i class="fas fa-plus"></i> Add to Cart
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   FETCH WITH DEMO FALLBACK
══════════════════════════════════════════════════════════ */
async function fetchSection(endpoint, gridId, sizeLabel, skeletonCount) {
  showSkeletons(gridId, skeletonCount);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error("Offline");

    const data = await response.json();
    store[gridId] = data;
    renderProducts(data, gridId, sizeLabel);
    return true;
  } catch (err) {
    console.warn(`[UltraKick] Loading Demo Mode for ${gridId}`);

    const demoData = {
      'jerseyGrid': [
        { name: "Real Madrid 24/25", sub: "Home Jersey", price: 4999, image_path: "images/real.jpeg", badge: "New", sizes: "S,M,L,XL" },
        { name: "Liverpool FC", sub: "Home Kit", price: 4500, image_path: "images/liverpool.jpeg", badge: "Popular", sizes: "S,M,L" },
        { name: "India National Team", sub: "Blue Tigers", price: 2999, image_path: "images/india.jpeg", sizes: "S,M,L,XL" }
      ],
      'bootsGrid': [
        { name: "Predator Elite", sub: "Firm Ground", price: 18000, image_path: "images/predator.jpeg", badge: "Hot", sizes: "7,8,9,10" }
      ],
      'ballsGrid': [
        { name: "Jabulani", sub: "2010 World Cup", price: 12000, image_path: "images/jabulani.jpeg", badge: "Classic" }
      ]
    };

    const currentData = demoData[gridId] || [];
    store[gridId] = currentData;
    renderProducts(currentData, gridId, sizeLabel);
    setApiStatus('error', 'Demo Mode (Offline)');
    return true; 
  }
}

async function loadAllProducts() {
  setApiStatus('loading', 'Connecting…');
  await Promise.all([
    fetchSection('/api/jerseys', 'jerseyGrid', 'Size', 6),
    fetchSection('/api/boots', 'bootsGrid', 'UK Size', 4),
    fetchSection('/api/balls', 'ballsGrid', null, 4),
  ]);
}

loadAllProducts();

function setApiStatus(state, label) {
  const dot = document.getElementById('apiDot');
  const text = document.getElementById('apiStatusText');
  if(dot) dot.className = state;
  if(text) text.textContent = label;
}

/* ══════════════════════════════════════════════════════════
   CART LOGIC
══════════════════════════════════════════════════════════ */
function pickSize(btn) {
  btn.closest('.size-btns').querySelectorAll('.sz').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addToCart(idx, gridId, btn) {
  const product = store[gridId][idx];
  const sizeEl = btn.closest('.product-card').querySelector('.sz.active');
  const size = sizeEl ? sizeEl.textContent.trim() : null;

  const key = `${gridId}-${idx}-${size || 'N'}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      name: product.name,
      sub: product.sub,
      price: Number(product.price),
      img: product.image_path.startsWith('http') ? product.image_path : API_BASE + '/' + product.image_path,
      size,
      qty: 1
    });
  }

  btn.innerHTML = '<i class="fas fa-check"></i> Added!';
  setTimeout(() => btn.innerHTML = '<i class="fas fa-plus"></i> Add to Cart', 1500);
  refreshCart();
  showToast(`${product.name} added! 🛒`);
}

function refreshCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cartCount').textContent = totalCount;
  document.getElementById('cartTotal').textContent = `₹${totalPrice.toLocaleString('en-IN')}`;

  const body = document.getElementById('cartBody');
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty-state"><p>Your cart is empty</p></div>`;
    return;
  }

  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img class="ci-img" src="${item.img}" onerror="this.src='https://placehold.co/68x68/101810/00ff87?text=?'">
      <div class="ci-body">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">${item.sub} ${item.size ? '· ' + item.size : ''}</div>
        <div class="ci-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="ci-controls">
          <button class="ci-qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="ci-qty-val">${item.qty}</span>
          <button class="ci-qty-btn" onclick="changeQty(${i}, +1)">+</button>
        </div>
      </div>
    </div>`).join('');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  refreshCart();
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function openCheckout() {
  if (!cart.length) return showToast("Cart is empty!");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('orderSummary').innerHTML = `<strong>Total: ₹${total.toLocaleString('en-IN')}</strong>`;
  document.getElementById('checkoutModal').style.display = "block";
  toggleCart();
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = "none";
}

function processOrder(e) {
  e.preventDefault();
  alert(`Thank you! Your order has been placed.`);
  cart = [];
  refreshCart();
  closeCheckout();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}