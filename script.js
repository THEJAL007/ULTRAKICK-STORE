// Replace this with your actual Render URL
const API_BASE = 'https://ultrakick-store-1.onrender.com';

async function fetchProducts(endpoint, gridId) {
    const grid = document.getElementById(gridId);
    try {
        const response = await fetch(`${API_BASE}/api/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const products = await response.json();
        grid.innerHTML = ''; // Clear loading text

        if (products.length === 0) {
            grid.innerHTML = '<p>No products found.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // This line ensures images load from the Render server
            const imageSrc = `${API_BASE}/${product.image_path}`;

            card.innerHTML = `
                <div class="badge">${product.badge || ''}</div>
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                <h3>${product.name}</h3>
                <p>${product.sub || ''}</p>
                <div class="price">₹${product.price}</div>
                <button class="add-btn">+ ADD TO CART</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = `<p class="error">Offline: Check back later.</p>`;
    }
}

// Initialize all sections
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts('jerseys', 'jerseys-grid');
    fetchProducts('boots', 'boots-grid');
    fetchProducts('balls', 'balls-grid'); // Fixed: Points to balls endpoint
});
