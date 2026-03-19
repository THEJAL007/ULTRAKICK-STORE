const API_BASE = 'https://ultrakick-store-1.onrender.com';

// Function to fetch data from your Node.js/MySQL Backend
async function fetchSection(sectionId, endpoint) {
    const grid = document.getElementById(sectionId);
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        grid.innerHTML = ''; // Clear the "Loading..." text

        if (data.length === 0) {
            grid.innerHTML = '<p class="no-data">No products found in database.</p>';
            return;
        }

        data.forEach(item => {
            const card = `
                <div class="product-card">
                    ${item.badge ? `<span class="tag ${item.badge.toLowerCase()}">${item.badge}</span>` : ''}
                    <div class="product-image">
                        <img src="${item.image_path}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p>${item.sub_text || ''}</p>
                        <div class="price">₹${item.price.toLocaleString()}</div>
                        ${item.sizes ? `<div class="sizes">Size: ${item.sizes}</div>` : ''}
                        <button class="add-btn" onclick="addToCart('${item.name}', ${item.price})">
                            <i class="fas fa-plus"></i> ADD TO CART
                        </button>
                    </div>
                </div>`;
            grid.innerHTML += card;
        });
    } catch (error) {
        console.error(`Error loading ${sectionId}:`, error);
        grid.innerHTML = `
            <div class="error-container">
                <p class="error-msg">Offline: Unable to connect to Database</p>
                <small>Make sure your Node.js server is running on localhost:3000</small>
            </div>`;
    }
}

// Simple Cart Functionality (Local Storage)
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

// Initialize the page and fetch all sections
document.addEventListener('DOMContentLoaded', () => {
    console.log("Connecting to Database at:", API_BASE);
    fetchSection('jerseyGrid', '/api/jerseys');
    fetchSection('bootsGrid', '/api/boots');
    fetchSection('ballsGrid', '/api/balls');
});
