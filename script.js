const API_BASE = 'https://ultrakick-store-1.onrender.com';

async function fetchProducts(endpoint, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/api/${endpoint}`);
        const products = await response.json();
        
        grid.innerHTML = ''; 

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Connects to your Render images folder
            const imageSrc = `${API_BASE}/${product.image_path}`;

            card.innerHTML = `
                <div class="product-info">
                    <span class="badge" style="color:#00ff88; font-size:0.7rem;">${product.badge || ''}</span>
                </div>
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Gear+Coming+Soon'">
                <div class="product-info">
                    <h3 style="margin:5px 0;">${product.name}</h3>
                    <p style="color:#aaa; font-size:0.8rem;">${product.sub || ''}</p>
                    <div class="price" style="font-weight:bold; margin-bottom:10px;">₹${product.price}</div>
                    <button class="add-btn">+ ADD TO CART</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = `<p>Check connection to locker room...</p>`;
    }
}

// Loads all three sections correctly
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts('jerseys', 'jerseys-grid');
    fetchProducts('boots', 'boots-grid');
    fetchProducts('balls', 'balls-grid'); 
});
