const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Premium Synthetic Engine Oil', price: 89.99, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400', category: 'Maintenance' },
    { id: 2, name: 'Carbon Performance Brake Pads', price: 124.99, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400', category: 'Brakes' },
    { id: 3, name: 'Sport Carbon Steering Wheel', price: 450.00, image: 'https://images.unsplash.com/photo-1622325373809-5c1cf071e6be?auto=format&fit=crop&q=80&w=400', category: 'Interior' },
    { id: 4, name: 'Precision LED Headlight Set', price: 299.00, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400', category: 'Lighting' },
    { id: 5, name: 'Leather Deep Cleaning Kit', price: 45.50, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400', category: 'Detailing' }
];

const getLocal = (key, fallback = []) => {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : fallback;
    } catch {
        return fallback;
    }
};

const setLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ---------- FIX 1: ALWAYS SAFE INIT ---------- */
let bookings = getLocal('autocare_bookings');
let products = getLocal('autocare_products', DEFAULT_PRODUCTS);
let orders = getLocal('autocare_orders');
let cart = getLocal('autocare_cart', []);

/* ---------- FIX 2: VALID BOOKING CHECK ---------- */
function isValidBooking(b) {
    return b &&
        b.id &&
        b.name &&
        b.phone &&
        b.carModel &&
        b.date &&
        b.serviceType &&
        b.createdAt;
}

/* ---------- FIX 3: SAVE BOOKING (REAL HISTORY SYSTEM) ---------- */
function handleBooking(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const bookingData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        phone: formData.get('phone'),
        carModel: formData.get('carModel'),
        serviceType: formData.get('serviceType'),
        date: formData.get('date'),
        time: formData.get('time') || "Not selected",
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // ✅ FIX: append instead of replace
    bookings.push(bookingData);

    setLocal('autocare_bookings', bookings);

    event.target.reset();

    if (location.pathname.includes('booking.html')) {
        renderBookings('bookings-list', 'all');
    }
}

/* ---------- FIX 4: RENDER BOOKINGS ---------- */
function renderBookings(containerId, type = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let list = bookings.filter(isValidBooking);

    if (type === 'pending') {
        list = list.filter(b => b.status === 'pending');
    }

    if (type === 'history') {
        list = list.filter(b => b.status !== 'pending');
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = list.length
        ? list.map(b => `
            <div class="card">
                <h3>${b.carModel} - ${b.serviceType}</h3>
                <p>${b.date} at ${b.time}</p>
                <p>Status: ${b.status}</p>
            </div>
        `).join('')
        : '<div class="card"><p>No bookings found.</p></div>';
}

/* ---------- HISTORY ---------- */
function renderHistory() {
    renderBookings('bookings-history', 'history');
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {

    if (location.pathname.includes('booking.html')) {
        renderBookings('bookings-list', 'all');
    }

    if (location.pathname.includes('history.html')) {
        renderHistory();
    }
});