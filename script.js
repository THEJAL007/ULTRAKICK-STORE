/* ═══════════════════════════════════════════════════════════
   script.js — UltraKick Football Store
   Fetches product data from MySQL via Flask / Node API
═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   ★  CONFIG
   Change API_BASE to match your backend server address.
   Flask default  → http://localhost:5000
   Express default → http://localhost:3000
────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:3000';


/* ──────────────────────────────────────────────────────────
   RUNTIME STATE
────────────────────────────────────────────────────────── */

// Stores fetched product arrays so cart can reference them by index
const store = {
  jerseyGrid: [],
  bootsGrid:  [],
  ballsGrid:  []
};

// Cart array — each item: { key, name, sub, price, img, size, qty }
let cart = [];


/* ══════════════════════════════════════════════════════════
   SKELETON LOADER
   Shows placeholder cards while API data is loading
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
   Builds product cards from API data and injects into grid.

   Each product object from MySQL should have:
     - name        → product name (string)
     - sub         → subtitle / description (string)
     - price       → price in rupees (number)
     - image_path  → relative path like "images/liverpool.jpeg"
     - badge       → optional label e.g. "New", "Popular" (string)
     - sizes       → comma-separated sizes e.g. "S,M,L" or "6,7,8" (string | null)
══════════════════════════════════════════════════════════ */
function renderProducts(data, gridId, sizeLabel) {
  const grid = document.getElementById(gridId);

  // Handle empty response
  if (!Array.isArray(data) || data.length === 0) {
    grid.innerHTML = `
      <div class="fetch-error">
        <i class="fas fa-box-open"></i>
        <h4>No products found</h4>
        <p>Make sure data is inserted in your MySQL table.</p>
      </div>`;
    return;
  }

  grid.innerHTML = data.map((product, idx) => {

    // Determine badge colour class
    let badgeClass = '';
    if (['New', 'new'].includes(product.badge))                     badgeClass = 'new';
    else if (['Best Seller', 'Popular', 'hot'].includes(product.badge)) badgeClass = 'hot';
    else if (['Exclusive', 'excl'].includes(product.badge))         badgeClass = 'excl';

    // Build size buttons HTML (only if product has sizes)
    const sizesHTML = product.sizes
      ? `<div class="size-selector">
           <span class="size-label">${sizeLabel || 'Size'}</span>
           <div class="size-btns">
             ${product.sizes.split(',').map((size, sizeIdx) =>
               `<button
                  class="sz${sizeIdx === 0 ? ' active' : ''}"
                  onclick="pickSize(this)">
                  ${size.trim()}
                </button>`
             ).join('')}
           </div>
         </div>`
      : '';

    return `
      <div class="product-card" data-idx="${idx}" data-grid="${gridId}">

        ${product.badge
          ? `<div class="p-badge ${badgeClass}">${product.badge}</div>`
          : ''}

        <div class="p-img-wrap">
          <img
            src="${API_BASE}/${product.image_path}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.src='https://placehold.co/400x400/101810/00ff87?text=No+Image'"
          />
          <div class="p-img-overlay"></div>
        </div>

        <div class="p-info">
          <div class="p-name">${product.name}</div>
          <div class="p-sub">${product.sub}</div>
          <div class="p-price">₹${Number(product.price).toLocaleString('en-IN')}</div>
          ${sizesHTML}
          <button class="add-btn" onclick="addToCart(${idx}, '${gridId}', this)">
            <i class="fas fa-plus"></i>
            <span>Add to Cart</span>
          </button>
        </div>

      </div>`;
  }).join('');
}


/* ══════════════════════════════════════════════════════════
   FETCH FROM API  →  MySQL via Flask or Express
══════════════════════════════════════════════════════════ */
async function fetchSection(endpoint, gridId, sizeLabel, skeletonCount) {
  showSkeletons(gridId, skeletonCount);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — ${response.statusText}`);
    }

    const data = await response.json();
    store[gridId] = data;           // save for cart reference
    renderProducts(data, gridId, sizeLabel);
    return true;

  } catch (err) {
    document.getElementById(gridId).innerHTML = `
      <div class="fetch-error">
        <i class="fas fa-plug"></i>
        <h4>Server not reachable</h4>
        <p>
          Make sure your backend is running at<br/>
          <code>${API_BASE}</code><br/>
          and the <strong>${endpoint}</strong> route exists.
        </p>
        <button class="retry-btn" onclick="loadAllProducts()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>`;
    console.warn(`[UltraKick] Failed to fetch ${endpoint}:`, err.message);
    return false;
  }
}

/* Load all 3 sections in parallel */
async function loadAllProducts() {
  setApiStatus('loading', 'Connecting…');

  const results = await Promise.all([
    fetchSection('/api/jerseys', 'jerseyGrid', 'Size',           10),
    fetchSection('/api/boots',   'bootsGrid',  'Shoe Size (UK)',  4),
    fetchSection('/api/balls',   'ballsGrid',  null,              4),
  ]);

  const allOk = results.every(Boolean);
  setApiStatus(
    allOk ? 'ok'    : 'error',
    allOk ? 'API Connected' : 'API Error'
  );
}

// Kick off on page load
loadAllProducts();


/* ══════════════════════════════════════════════════════════
   API STATUS INDICATOR (bottom-left dot)
══════════════════════════════════════════════════════════ */
function setApiStatus(state, label) {
  document.getElementById('apiDot').className        = state;
  document.getElementById('apiStatusText').textContent = label;
}


/* ══════════════════════════════════════════════════════════
   SIZE PICKER
══════════════════════════════════════════════════════════ */
function pickSize(btn) {
  // Deactivate all siblings, activate clicked
  btn.closest('.size-btns')
     .querySelectorAll('.sz')
     .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}


/* ══════════════════════════════════════════════════════════
   CART — ADD ITEM
══════════════════════════════════════════════════════════ */
function addToCart(idx, gridId, btn) {
  const product = store[gridId][idx];
  if (!product) return;

  // Get selected size (if this product has sizes)
  const card   = btn.closest('.product-card');
  const sizeEl = card.querySelector('.sz.active');
  const size   = sizeEl ? sizeEl.textContent.trim() : null;

  // Unique key per product+size combo
  const key      = `${gridId}-${idx}-${size || 'N'}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      name:  product.name,
      sub:   product.sub,
      price: Number(product.price),
      img:   `${API_BASE}/${product.image_path}`,
      size,
      qty:   1
    });
  }

  // Visual feedback on button
  btn.classList.add('added');
  btn.innerHTML = '<i class="fas fa-check"></i><span>Added!</span>';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="fas fa-plus"></i><span>Add to Cart</span>';
  }, 1600);

  refreshCart();
  showToast(`${product.name} added to cart! 🛒`);
}


/* ══════════════════════════════════════════════════════════
   CART — CHANGE QUANTITY
══════════════════════════════════════════════════════════ */
function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  refreshCart();
}


/* ══════════════════════════════════════════════════════════
   CART — REMOVE ITEM
══════════════════════════════════════════════════════════ */
function removeItem(idx) {
  const name = cart[idx].name;
  cart.splice(idx, 1);
  refreshCart();
  showToast(`${name} removed from cart`);
}


/* ══════════════════════════════════════════════════════════
   CART — REFRESH UI
   Re-renders the cart sidebar contents and badge count
══════════════════════════════════════════════════════════ */
function refreshCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Update nav badge and total display
  document.getElementById('cartCount').textContent = totalCount;
  document.getElementById('cartTotal').textContent =
    `₹${totalPrice.toLocaleString('en-IN')}`;

  const body = document.getElementById('cartBody');

  // Empty state
  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <i class="fas fa-shopping-bag"></i>
        <p>Your cart is empty</p>
        <small>Add some football gear to get started!</small>
      </div>`;
    return;
  }

  // Cart items
  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img
        class="ci-img"
        src="${item.img}"
        alt="${item.name}"
        onerror="this.src='https://placehold.co/68x68/101810/00ff87?text=?'"
      />
      <div class="ci-body">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">
          ${item.sub}${item.size ? ' · Size: ' + item.size : ''}
        </div>
        <div class="ci-price">
          ₹${(item.price * item.qty).toLocaleString('en-IN')}
        </div>
        <div class="ci-controls">
          <button class="ci-qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="ci-qty-val">${item.qty}</span>
          <button class="ci-qty-btn" onclick="changeQty(${i}, +1)">+</button>
          <button class="ci-del" onclick="removeItem(${i})" aria-label="Remove item">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>`
  ).join('');
}


/* ══════════════════════════════════════════════════════════
   CART — TOGGLE OPEN / CLOSE
══════════════════════════════════════════════════════════ */
function toggleCart(e) {
  if (e) e.preventDefault();

  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen  = sidebar.classList.contains('open');

  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');

  // Lock page scroll when cart is open
  document.body.style.overflow = isOpen ? '' : 'hidden';
}


/* ══════════════════════════════════════════════════════════
   CART — CHECKOUT
══════════════════════════════════════════════════════════ */
function checkout() {
  if (!cart.length) {
    showToast('Your cart is empty!');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  showToast(`Order placed! Total: ₹${total.toLocaleString('en-IN')} ⚽`);

  cart = [];
  refreshCart();
  toggleCart();
}


/* ══════════════════════════════════════════════════════════
   CATEGORY ANIMATION → SCROLL TO SECTION
══════════════════════════════════════════════════════════ */
function animateGo(sectionId, emoji, label) {
  const overlay = document.getElementById('animOverlay');
  document.getElementById('animEmoji').textContent = emoji;
  document.getElementById('animLabel').textContent  = label;

  overlay.classList.add('active');

  setTimeout(() => {
    overlay.classList.remove('active');
    document.getElementById(sectionId)
            .scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 1300);
}


/* ══════════════════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════════════════ */
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  const toastEl = document.getElementById('toast');
  document.getElementById('toastText').textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}


/* ══════════════════════════════════════════════════════════
   NAVBAR — TOGGLE MOBILE MENU
══════════════════════════════════════════════════════════ */
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

function closeNav() {
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}


/* ══════════════════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════════════════ */

// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
          .classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeNav();
  }
});


// Close cart with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar.classList.contains('open')) toggleCart();
  }
});
// This function asks the Node.js server for data
async function testConnection() {
    try {
        // We fetch from the 'route' you created in server.js
        const response = await fetch('http://localhost:3000/test-db');
        const data = await response.json();
        
        console.log("Success! Data from database:", data);
        alert("Connected to Database! Check console for time.");
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

// Run the function when the page loads
testConnection();
// This function talks to your Node.js server
async function checkDatabase() {
    try {
        // Fetch data from the route we created in server.js
        const response = await fetch('http://localhost:3000/test-db');
        const data = await response.json();
        
        console.log("Success! Server says:", data.message);
        console.log("Current Database Time:", data.time.now);
        
        // This will pop up a message on your website if it works!
        alert("Web page is now talking to the Database!");
    } catch (error) {
        console.error("Oops, something went wrong:", error);
    }
}

// Call the function
checkDatabase();
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();
        
        console.log("Products found:", products);

        // This part looks for an element on your page to put the data in
        // For now, let's just log them to the console to see if they arrive!
        products.forEach(item => {
            console.log(`Item: ${item.name} - Price: $${item.price}`);
        });

    } catch (error) {
        console.error("Error loading products:", error);
    }
}

loadProducts();
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty! 🛒");
    return;
  }
  
  const modal = document.getElementById('checkoutModal');
  const summary = document.getElementById('orderSummary');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  summary.innerHTML = `<strong>Total Amount: ₹${total.toLocaleString('en-IN')}</strong>`;
  modal.style.display = "block";
  toggleCart(); // Close the sidebar when modal opens
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = "none";
}

async function processOrder(event) {
  event.preventDefault();
  
  const orderData = {
    customer: document.getElementById('custName').value,
    address: document.getElementById('custAddress').value,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  };

  // For now, we show a success message and clear the cart
  // (In the next step, we can save this to a 'orders' table in Postgres!)
  alert(`Thank you ${orderData.customer}! Your order for ₹${orderData.total} has been placed.`);
  
  cart = []; // Reset the cart (Stack is now empty!)
  refreshCart();
  closeCheckout();
}
// DELETE THIS OLD CODE
function checkout() {
  if (!cart.length) {
    showToast('Your cart is empty!');
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  showToast(`Order placed! Total: ₹${total.toLocaleString('en-IN')} ⚽`);
  cart = [];
  refreshCart();
  toggleCart();
}