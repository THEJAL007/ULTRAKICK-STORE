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
            
            // Build the full URL: https://ultrakick-store-1.onrender.com/images/yourimage.jpg
            const imageSrc = `${API_BASE}/${product.image_path}`;

            card.innerHTML = `
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Image+Not+Found'">
                <div style="padding: 15px;">
                    <h3>${product.name}</h3>
                    <p style="color: #888;">${product.sub || ''}</p>
                    <div style="color: #00ff88; font-weight: bold; margin: 10px 0;">₹${product.price}</div>
                    <button style="width:100%; padding:10px; background:#00ff88; border:none; font-weight:bold; cursor:pointer;">+ ADD TO CART</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load " + endpoint, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts('jerseys', 'jerseys-grid');
    fetchProducts('boots', 'boots-grid');
    fetchProducts('balls', 'balls-grid'); 
});
