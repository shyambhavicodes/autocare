// AutoCare Logic System
const DataManager = {
    // Keys for LocalStorage
    KEYS: {
        BOOKINGS: 'autocare_bookings',
        ORDERS: 'autocare_orders',
        PRODUCTS: 'autocare_products',
        THEME: 'autocare_theme'
    },

    // Initial Sample Data for the Store
    INITIAL_PRODUCTS: [
        { id: 1, name: 'Synthetic Engine Oil', price: 1299, image: 'https://images.unsplash.com/photo-1635810338722-19bc30ce672d?auto=format&fit=crop&q=80&w=400', category: 'Oils' },
        { id: 2, name: 'High Performance Battery', price: 6500, image: 'https://images.unsplash.com/photo-1619641782842-833bc883d1c4?auto=format&fit=crop&q=80&w=400', category: 'Batteries' },
        { id: 3, name: 'Ceramic Brake Pads', price: 3200, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400', category: 'Spare Parts' },
        { id: 4, name: '7D Floor Mats', price: 2499, image: 'https://images.unsplash.com/photo-1549317661-bd3293003975?auto=format&fit=crop&q=80&w=400', category: 'Accessories' }
    ],

    init() {
        if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
            localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(this.INITIAL_PRODUCTS));
        }
        if (!localStorage.getItem(this.KEYS.BOOKINGS)) {
            localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.ORDERS)) {
            localStorage.setItem(this.KEYS.ORDERS, JSON.stringify([]));
        }
        this.applyTheme();
    },

    // Theme Management
    toggleTheme() {
        const current = localStorage.getItem(this.KEYS.THEME) || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(this.KEYS.THEME, next);
        this.applyTheme();
    },

    applyTheme() {
        const theme = localStorage.getItem(this.KEYS.THEME) || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    },

    // Data Operations
    getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>✨</span> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// Initialize on Load
DataManager.init();

// Hamburger Menu Logic
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active-mobile');
});

// UI Helper for dynamic lists
const UI = {
    renderProducts(containerId, productList, type = 'store') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = productList.map(p => `
            <div class="card product-card">
                <img src="${p.image}" alt="${p.name}" style="width:100%; border-radius:12px; margin-bottom:16px;">
                <h3 class="mb-4">${p.name}</h3>
                <p style="color:var(--text-secondary); margin-bottom:16px;">${p.category}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:20px; font-weight:800; color:var(--accent);">₹${p.price}</span>
                    ${type === 'store' ? `<button class="btn btn-primary" onclick="Cart.add(${p.id})">Add</button>` : ''}
                </div>
            </div>
        `).join('');
    }
};

// Simple Cart System
const Cart = {
    items: [],
    add(productId) {
        const products = DataManager.getData(DataManager.KEYS.PRODUCTS);
        const product = products.find(p => p.id === productId);
        this.items.push(product);
        DataManager.showNotification(`${product.name} added to cart!`);
        this.updateUI();
    },
    updateUI() {
        const cartBadge = document.getElementById('cart-count');
        if (cartBadge) cartBadge.textContent = this.items.length;
    }
};
