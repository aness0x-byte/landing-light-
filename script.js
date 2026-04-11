document.addEventListener('DOMContentLoaded', () => {
    // Set up the Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once the animation is done
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target all elements with .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form logic (Quantity and price calculation)
    const basePrice = 2900;
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.getElementById('minus-btn');
    const btnPlus = document.getElementById('plus-btn');
    const priceDisplay = document.querySelector('.summary-value.dzd-font');
    const totalDisplay = document.querySelector('.total-row .summary-value');

    function updatePrices() {
        const qty = parseInt(qtyInput.value) || 1;
        const total = basePrice * qty;
        const formattedTotal = 'DZD ' + total.toLocaleString('en-US') + '.00';
        
        priceDisplay.textContent = formattedTotal;
        totalDisplay.textContent = formattedTotal; // Delivery is calculated later based on Wilaya normally
    }

    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
                updatePrices();
            }
        });

        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < 10) {
                qtyInput.value = val + 1;
                updatePrices();
            }
        });
    }
    
    // Initial calculation
    updatePrices();

    // Form submission mock
    const form = document.querySelector('.cod-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('تم استلام طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلب.');
        });
    }
});
