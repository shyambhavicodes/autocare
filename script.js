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
let cart = getLocal('autocare_cart', []);
let theme = localStorage.getItem('autocare_theme') || 'dark';

/* ---------- FIX: ALWAYS REMOVE DUPLICATES ---------- */
function cleanBookings() {
    const map = new Map();
    bookings.forEach(b => {
        if (b && b.id) map.set(b.id, b);
    });
    bookings = Array.from(map.values());
    setLocal('autocare_bookings', bookings);
}

/* ---------- BOOKING ---------- */
function handleBooking(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const id = formData.get('bookingId') || Date.now().toString();

    const bookingData = {
        id,
        name: formData.get('name'),
        phone: formData.get('phone'),
        carModel: formData.get('carModel'),
        serviceType: formData.get('serviceType'),
        date: formData.get('date'),
        time: formData.get('time') || "Not selected",
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const index = bookings.findIndex(b => b.id === id);

    if (index !== -1) {
        bookings[index] = bookingData;
    } else {
        bookings.push(bookingData);
    }

    cleanBookings(); // 🔥 IMPORTANT FIX

    setLocal('autocare_bookings', bookings);

    event.target.reset();
    renderBookings('bookings-list', 'all');
}

/* ---------- RENDER BOOKINGS ---------- */
function renderBookings(containerId, type = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    cleanBookings(); // 🔥 safety

    let list = [...bookings];

    if (type === 'pending') {
        list = list.filter(b => b.status === 'pending');
    }

    if (type === 'history') {
        list = list.filter(b => b.status !== 'pending');
    }

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = '<div class="card"><p>No bookings found.</p></div>';
        return;
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = list.map(b => `
        <div class="card">
            <h3>${b.carModel} - ${b.serviceType}</h3>
            <p>${b.date} at ${b.time}</p>
            <p>Status: ${b.status}</p>

            ${b.status === 'pending' ? `
                <button onclick="editBooking('${b.id}')">Edit</button>
                <button onclick="cancelBooking('${b.id}')">Cancel</button>
            ` : ''}
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

/* ---------- HISTORY FIX (NEW CLEAN FUNCTION) ---------- */
function renderHistory() {
    renderBookings('bookings-history', 'history');
}

/* ---------- CANCEL ---------- */
function cancelBooking(id) {
    const b = bookings.find(x => x.id === id);
    if (b) b.status = 'cancelled';

    setLocal('autocare_bookings', bookings);
    renderHistory();
}

/* ---------- EDIT ---------- */
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    const form = document.querySelector('#booking-form');

    openModal('booking-modal');

    form.bookingId.value = booking.id;
    form.name.value = booking.name;
    form.phone.value = booking.phone;
    form.carModel.value = booking.carModel;
    form.serviceType.value = booking.serviceType;
    form.date.value = booking.date;
    form.time.value = booking.time;
}

/* ---------- STORE ---------- */
function renderStore() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = products.map(p => `
        <div class="card">
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
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    cleanBookings();

    if (location.pathname.includes('booking.html')) {
        renderBookings('bookings-list', 'all');
    }

    if (location.pathname.includes('history.html')) {
        renderHistory();
    }

    if (location.pathname.includes('store.html')) {
        renderStore();
    }
});