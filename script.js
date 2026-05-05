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

// --- THEME ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark'
            ? '<i class="lucide-sun"></i>'
            : '<i class="lucide-moon"></i>';
        themeBtn.onclick = toggleTheme;
    }
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('autocare_theme', theme);
}

// --- NAV ---
function initNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
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

// --- TOAST ---
function showToast(message) {
    alert(message);
}

// --- BOOKING ---
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
        time: formData.get('time') || "Not selected",   // FIXED
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    if (id) {
        const index = bookings.findIndex(b => b.id === id);
        bookings[index] = { ...bookings[index], ...bookingData };
        showToast('Booking updated successfully!');
    } else {
        // FIX: prevent duplicate save
        const exists = bookings.find(b => b.id === bookingData.id);
        if (!exists) bookings.push(bookingData);

        showToast('Booking submitted successfully!');
    }

    setLocal('autocare_bookings', bookings);

    event.target.reset();

    if (window.location.pathname.includes('booking.html')) {
        renderBookings('bookings-list', 'all');
    }
}

// --- FIXED RENDER (MAIN FIX) ---
function renderBookings(containerId = 'bookings-list', type = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // remove duplicates (IMPORTANT FIX)
    const uniqueMap = new Map();
    bookings.forEach(b => uniqueMap.set(b.id, b));
    let list = Array.from(uniqueMap.values());

    if (type === 'pending') {
        list = list.filter(b => b.status === 'pending');
    }

    if (type === 'history') {
        list = list.filter(b => b.status !== 'pending');
    }

    if (list.length === 0) {
        container.innerHTML = '<div class="card"><p class="text-secondary">No bookings found.</p></div>';
        return;
    }

    container.innerHTML = list
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => `
        <div class="card flex justify-between items-center mt-4">
            <div>
                <h3>${b.carModel} - ${b.serviceType}</h3>
                <p class="text-secondary">${b.date} at ${b.time} | For: ${b.name}</p>
                <span class="badge badge-${b.status}">${b.status}</span>
            </div>

            <div class="flex gap-2">
                ${b.status === 'pending' ? `
                    <button class="btn btn-secondary" onclick="editBooking('${b.id}')">Edit</button>
                    <button class="btn btn-secondary" style="color:red" onclick="cancelBooking('${b.id}')">Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

// --- CANCEL ---
function cancelBooking(id) {
    const index = bookings.findIndex(b => b.id === id);
    bookings[index].status = 'cancelled';
    setLocal('autocare_bookings', bookings);
    renderBookings('bookings-list', 'history');
}

// --- EDIT ---
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

// --- STORE ---
function renderStore() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = products.map(p => `
        <div class="card product-card">
            <img src="${p.image}" class="product-img">
            <h3>${p.name}</h3>
            <p>$${p.price}</p>
            <button onclick="addToCart(${p.id})">Add</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });

    setLocal('autocare_cart', cart);
    updateCartBadge();
}

// --- CART ---
function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;

    const total = cart.reduce((s, i) => s + i.quantity, 0);
    badge.innerText = total;
    badge.style.display = total > 0 ? 'block' : 'none';
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();

    const path = window.location.pathname;

    if (path.includes('booking.html')) {
        renderBookings('bookings-list', 'all');
    }

    if (path.includes('history.html')) {
        renderBookings('bookings-list', 'history');
    }

    if (path.includes('store.html')) {
        renderStore();
    }
});