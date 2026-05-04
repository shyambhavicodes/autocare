document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeSwitch = document.querySelector('.theme-switch');
    const savedTheme = localStorage.getItem('autocare-theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('autocare-theme', newTheme);
    });

    // 2. Sticky Navbar Effect
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Service Filtering (Basic)
    const searchInput = document.getElementById('service-search');
    const serviceCards = document.querySelectorAll('.service-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            serviceCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                if (title.includes(term) || desc.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 4. Booking Form Simulation
    const bookingForm = document.getElementById('booking-form');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.modal-overlay');
    const closeModal = document.querySelector('.close-modal');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple validation
            const inputs = bookingForm.querySelectorAll('input, select');
            let isValid = true;
            inputs.forEach(input => {
                if (!input.value) isValid = false;
            });

            if (isValid) {
                // Show success modal
                modal.classList.add('active');
                overlay.classList.add('active');
                bookingForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // 5. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 6. Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
});
