const API_BASE = 'http://localhost:3000';

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
            
            // Local path (e.g., images/liverpool.jpg)
            const imageSrc = product.image_path; 

            card.innerHTML = `
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Check+Images+Folder'">
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
        grid.innerHTML = `<p>Error: Run 'node server.js' in your terminal.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts('jerseys', 'jerseys-grid');
    fetchProducts('boots', 'boots-grid');
    fetchProducts('balls', 'balls-grid'); 
});
