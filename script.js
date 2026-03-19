const API_BASE = 'https://ultrakick-store-1.onrender.com';

async function fetchProducts(endpoint, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return; // Safety check

    try {
        const response = await fetch(`${API_BASE}/api/${endpoint}`);
        const products = await response.json();
        
        grid.innerHTML = ''; // Clear loading text

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Correctly join the API URL and the image path
            const imageSrc = `${API_BASE}/${product.image_path}`;

            card.innerHTML = `
                <div class="badge">${product.badge || ''}</div>
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.sub || ''}</p>
                    <div class="price">₹${product.price}</div>
                    <button class="add-btn">+ ADD TO CART</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading ' + endpoint, error);
        grid.innerHTML = `<p>Error loading products.</p>`;
    }
}

// Ensure these match your index.html IDs exactly!
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts('jerseys', 'jerseys-grid');
    fetchProducts('boots', 'boots-grid');
    fetchProducts('balls', 'balls-grid'); 
});
