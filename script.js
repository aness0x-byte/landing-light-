// ===== TELEGRAM CONFIG =====
const TELEGRAM_TOKEN = "8782603786:AAF7Ca8xmRIpvr6cUoEK4spRhD_wvgHiEaQ";
const TELEGRAM_CHAT_ID = "698115495";

async function notifyAdmin(order) {
    const message =
        `🛒 *طلب جديد - TOAUTO H4 LED*\n` +
        `👤 الاسم: ${order.name}\n` +
        `📞 الهاتف: ${order.phone}\n` +
        `📍 الولاية: ${order.wilaya}\n` +
        `🏘️ البلدية: ${order.commune}\n` +
        `🏠 العنوان: ${order.address || 'غير محدد'}\n` +
        `🔢 الكمية: ${order.quantity}\n` +
        `💰 المجموع: ${order.total} DZD\n` +
        `🕐 التوقيت: ${new Date().toLocaleString("fr-DZ")}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        })
    });
}
// ===========================

document.addEventListener('DOMContentLoaded', () => {

    // Fade-in animations
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Quantity and price
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
        totalDisplay.textContent = formattedTotal;
    }

    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) { qtyInput.value = val - 1; updatePrices(); }
        });
        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < 10) { qtyInput.value = val + 1; updatePrices(); }
        });
    }

    updatePrices();

    // Form submission + Telegram
    const form = document.querySelector('.cod-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const order = {
                name:     form.querySelector('input[type="text"]').value,
                phone:    form.querySelector('input[type="tel"]').value,
                wilaya:   document.getElementById('wilaya-select').options[document.getElementById('wilaya-select').selectedIndex].text,
                commune:  document.getElementById('baladiya-input').value,
                address:  form.querySelectorAll('input[type="text"]')[1]?.value || '',
                quantity: qtyInput.value,
                total:    (basePrice * parseInt(qtyInput.value)).toLocaleString('en-US')
            };

            const submitBtn = document.getElementById('submit-purchase');
            submitBtn.disabled = true;
            submitBtn.textContent = '...جاري الإرسال';

            try {
                await notifyAdmin(order);
                alert('✅ تم استلام طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلب.');
                form.reset();
                updatePrices();
            } catch (err) {
                alert('❌ حدث خطأ. يرجى المحاولة مرة أخرى.');
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'إشتري الان';
            }
        });
    }
});
