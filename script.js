const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Premium Synthetic Engine Oil', price: 89.99, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400', category: 'Maintenance' },
    { id: 2, name: 'Carbon Performance Brake Pads', price: 124.99, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400', category: 'Brakes' },
    { id: 3, name: 'Sport Carbon Steering Wheel', price: 450.00, image: 'https://images.unsplash.com/photo-1622325373809-5c1cf071e6be?auto=format&fit=crop&q=80&w=400', category: 'Interior' },
    { id: 4, name: 'Precision LED Headlight Set', price: 299.00, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400', category: 'Lighting' },
    { id: 5, name: 'Leather Deep Cleaning Kit', price: 45.50, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400', category: 'Detailing' }
];

const getLocal = (key, fallback = []) => JSON.parse(localStorage.getItem(key)) || fallback;
const setLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

let bookings = getLocal('autocare_bookings');
let products = getLocal('autocare_products', DEFAULT_PRODUCTS);
let orders = getLocal('autocare_orders');
let cart = getLocal('autocare_cart');
let theme = localStorage.getItem('autocare_theme') || 'dark';

// --- THEME MANAGEMENT ---

function initTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="lucide-sun"></i>' : '<i class="lucide-moon"></i>';
        themeBtn.onclick = toggleTheme;
    }
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('autocare_theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.innerHTML = theme === 'dark' ? '<i class="lucide-sun"></i>' : '<i class="lucide-moon"></i>';
}

// --- NAVIGATION & UI ---

function initNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.onclick = () => navLinks.classList.toggle('active');
    }

    updateCartBadge();
}

function showToast(message, type = 'success') {
    // Simple basic alert for now as per instructions (no blocking UI)
    // We could implement a real toast here but simple alert is safer for "no blocking"
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}

// --- BOOKING LOGIC ---

function handleBooking(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('bookingId');
    
    const bookingData = {
        id: id || Date.now().toString(),
        name: formData.get('name'),
        phone: formData.get('phone'),
        carModel: formData.get('carModel'),
        serviceType: formData.get('serviceType'),
        date: formData.get('date'),
        time: formData.get('time'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    if (id) {
        // Edit
        const index = bookings.findIndex(b => b.id === id);
        bookings[index] = { ...bookings[index], ...bookingData };
        showToast('Booking updated successfully!');
    } else {
        // New
        bookings.push(bookingData);
        showToast('Booking submitted successfully! Our team will contact you.');
    }

    setLocal('autocare_bookings', bookings);
    event.target.reset();
    
    if (window.location.pathname.includes('booking.html')) {
        renderBookings();
        closeModal('booking-modal');
    }
}

function renderBookings(containerId = 'bookings-list', filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const list = filter === 'history' ? bookings : bookings.filter(b => b.status === 'pending');
    
    if (list.length === 0) {
        container.innerHTML = '<div class="card"><p class="text-secondary">No bookings found.</p></div>';
        return;
    }

    container.innerHTML = list.sort((a,b) => new Date(b.date) - new Date(a.date)).map(b => `
        <div class="card flex justify-between items-center mt-4">
            <div>
                <h3>${b.carModel} - ${b.serviceType}</h3>
                <p class="text-secondary">${b.date} at ${b.time} | For: ${b.name}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="badge badge-${b.status}">${b.status}</span>
                </div>
            </div>
            <div class="flex gap-2">
                ${b.status === 'pending' ? `
                    <button class="btn btn-secondary" onclick="editBooking('${b.id}')"><i data-lucide="edit-3" style="width: 16px;"></i> Edit</button>
                    <button class="btn btn-secondary" style="color: #ff4444" onclick="cancelBooking('${b.id}')"><i data-lucide="trash-2" style="width: 16px;"></i> Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

function cancelBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const index = bookings.findIndex(b => b.id === id);
        bookings[index].status = 'cancelled';
        setLocal('autocare_bookings', bookings);
        renderBookings();
        if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
    }
}

function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    const form = document.querySelector('#booking-form');
    if (!form) return;

    openModal('booking-modal');
    form.querySelector('[name="bookingId"]').value = booking.id;
    form.querySelector('[name="name"]').value = booking.name;
    form.querySelector('[name="phone"]').value = booking.phone;
    form.querySelector('[name="carModel"]').value = booking.carModel;
    form.querySelector('[name="serviceType"]').value = booking.serviceType;
    form.querySelector('[name="date"]').value = booking.date;
    form.querySelector('[name="time"]').value = booking.time;
}

// --- STORE LOGIC ---

function renderStore() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = products.map(p => `
        <div class="card product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img">
            <div class="product-info">
                <p class="text-secondary">${p.category}</p>
                <h3>${p.name}</h3>
                <div class="flex justify-between items-center mt-4">
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-primary" onclick="addToCart(${p.id})">
                        <i data-lucide="plus" style="width: 16px;"></i>
                        Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    setLocal('autocare_cart', cart);
    updateCartBadge();
    showToast('Added to cart!');
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = total;
        badge.style.display = total > 0 ? 'block' : 'none';
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-secondary">Your cart is empty.</p>';
        document.getElementById('cart-total').innerText = '$0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h4>${item.name}</h4>
                    <p class="text-secondary">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn btn-secondary" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-secondary" onclick="updateCartQty(${item.id}, 1)">+</button>
                    <button class="btn btn-secondary" style="color: #ff4444" onclick="removeFromCart(${item.id})">×</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        setLocal('autocare_cart', cart);
        renderCart();
        updateCartBadge();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    setLocal('autocare_cart', cart);
    renderCart();
    updateCartBadge();
}

function checkout() {
    if (cart.length === 0) return alert('Cart is empty!');
    
    const newOrder = {
        id: 'ORD-' + Math.floor(Math.random() * 100000),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'processing',
        date: new Date().toISOString()
    };

    orders.push(newOrder);
    setLocal('autocare_orders', orders);
    
    cart = [];
    setLocal('autocare_cart', cart);
    
    showToast('Order placed successfully! Order ID: ' + newOrder.id);
    updateCartBadge();
    closeModal('cart-modal');
    
    if (window.location.pathname.includes('history.html')) {
        renderOrders();
    }
}

function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<div class="card"><p class="text-secondary">No orders found.</p></div>';
        return;
    }

    container.innerHTML = orders.sort((a,b) => new Date(b.date) - new Date(a.date)).map(o => `
        <div class="card mt-4">
            <div class="flex justify-between">
                <h4>Order ${o.id}</h4>
                <p class="text-secondary">${new Date(o.date).toLocaleDateString()}</p>
            </div>
            <div class="mt-2">
                ${o.items.map(i => `<p class="text-secondary">${i.name} (${i.quantity})</p>`).join('')}
            </div>
            <div class="flex justify-between items-center mt-4">
                <strong>Total: $${o.total.toFixed(2)}</strong>
                <span class="badge badge-completed">${o.status}</span>
            </div>
        </div>
    `).join('');
}

// --- ADMIN PANEL ---

function renderAdminDashboard() {
    const statsContainer = document.getElementById('admin-stats');
    if (!statsContainer) return;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    statsContainer.innerHTML = `
        <div class="card">
            <p class="text-secondary">Total Bookings</p>
            <h1>${totalBookings}</h1>
            <p class="text-secondary">${pendingBookings} pending</p>
        </div>
        <div class="card">
            <p class="text-secondary">Total Orders</p>
            <h1>${totalOrders}</h1>
        </div>
        <div class="card">
            <p class="text-secondary">Total Revenue</p>
            <h1>$${totalRevenue.toFixed(2)}</h1>
        </div>
    `;

    renderBookings('admin-bookings-list', 'history');
    renderAdminOrders();
    renderAdminProducts();
}

function renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    container.innerHTML = orders.map(o => `
        <div class="card mt-4 flex justify-between items-center">
            <div>
                <h4>${o.id} - $${o.total.toFixed(2)}</h4>
                <p class="text-secondary">${o.items.length} items | ${new Date(o.date).toLocaleDateString()}</p>
            </div>
            <span class="badge badge-completed">${o.status}</span>
        </div>
    `).join('');
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-list');
    if (!container) return;

    container.innerHTML = products.map(p => `
        <div class="card mt-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <img src="${p.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                <div>
                    <h4>${p.name}</h4>
                    <p class="text-secondary">$${p.price.toFixed(2)}</p>
                </div>
            </div>
            <button class="btn btn-secondary" style="color: #ff4444" onclick="removeProduct(${p.id})">Remove</button>
        </div>
    `).join('');
}

function addProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProduct = {
        id: Date.now(),
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image') || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400',
        category: formData.get('category')
    };

    products.push(newProduct);
    setLocal('autocare_products', products);
    renderAdminDashboard();
    event.target.reset();
    closeModal('product-modal');
    showToast('Product added successfully!');
}

function removeProduct(id) {
    if (confirm('Remove this product?')) {
        products = products.filter(p => p.id !== id);
        setLocal('autocare_products', products);
        renderAdminDashboard();
    }
}

// --- MODAL HELPERS ---

function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
    // Clear the booking ID if its the booking modal
    if (id === 'booking-modal') {
        const idField = document.querySelector('[name="bookingId"]');
        if (idField) idField.value = '';
    }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();

    // Page Specific Inits
    const path = window.location.pathname;
    if (path.includes('booking.html')) {
        renderBookings();
    } else if (path.includes('store.html')) {
        renderStore();
    } else if (path.includes('history.html')) {
        renderBookings('bookings-history', 'history');
        renderOrders();
    } else if (path.includes('admin.html')) {
        renderAdminDashboard();
    }

    // Lucide Icons Init (if using Lucide CDN, but we use standard icons if possible)
    // For this app, we'll assume icons are provided via CDN in HTML
});
