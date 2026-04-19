// ===== TELEGRAM CONFIG =====
const TELEGRAM_TOKEN = "8782603786:AAF7Ca8xmRIpvr6cUoEK4spRhD_wvgHiEaQ";
const TELEGRAM_CHAT_ID = "6603745153";

// ===== SECURITY LAYER =====
// Based on: OWASP Top 10 for LLMs, MITRE ATLAS, and Architectural Defensive Countermeasures
// Ref: Input Sanitization, Data Type Gating, I/O Synchronization, Rate Limiting

/**
 * SECURITY: Input Sanitization
 * Strips HTML tags and control characters to prevent injection attacks.
 * Ref: OWASP LLM01 - Prompt Injection, MITRE ATLAS Initial Access
 */
function sanitizeText(input) {
    if (typeof input !== "string") return "";
    return input
        .replace(/<[^>]*>/g, "")           // Strip HTML tags
        .replace(/[<>"'`\\]/g, "")          // Remove injection-prone chars
        .replace(/[\x00-\x1F\x7F]/g, "")   // Remove control characters
        .trim()
        .slice(0, 200);                      // Hard length cap
}

/**
 * SECURITY: Data Type Gating
 * Validates each field is the expected type and format before processing.
 * Ref: "Trust Splitting" & "Data Type Gating" - only clean typed data passes.
 */
function validateOrder(order) {
    const errors = [];

    // Name: letters, spaces, Arabic chars only — no script injection
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-'.]{2,100}$/;
    if (!nameRegex.test(order.name)) {
        errors.push("الاسم غير صالح");
    }

    // Phone: Algerian format — digits only, 9-10 chars, starts with 05/06/07
    const phoneClean = order.phone.replace(/\s/g, "");
    const phoneRegex = /^(0[5-7]\d{8})$/;
    if (!phoneRegex.test(phoneClean)) {
        errors.push("رقم الهاتف غير صالح (مثال: 0550123456)");
    }

    // Wilaya: must be a non-empty string (selected from dropdown)
    if (!order.wilaya || order.wilaya === "Wilaya") {
        errors.push("الرجاء اختيار الولاية");
    }

    // Commune: text only
    if (!order.commune || order.commune.length < 2) {
        errors.push("الرجاء إدخال البلدية");
    }

    // Quantity: strict integer between 1 and 10 (Data Type Gating — integer only)
    const qty = parseInt(order.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
        errors.push("الكمية يجب أن تكون بين 1 و 10");
    }

    return errors;
}

/**
 * SECURITY: Rate Limiting (Client-side)
 * Prevents rapid repeated submissions and caps total attempts per session.
 * Ref: Unit 42 2025 — AI-accelerated attack speed; defense must shrink the window.
 */
const RATE_LIMIT_MS = 30000;      // 30 seconds between submissions
const MAX_ATTEMPTS_SESSION = 5;   // Max 5 attempts per browser session
let lastSubmitTime = 0;
let sessionAttempts = 0;

function checkRateLimit() {
    const now = Date.now();

    if (sessionAttempts >= MAX_ATTEMPTS_SESSION) {
        return "لقد تجاوزت الحد المسموح به من المحاولات. يرجى إعادة تحميل الصفحة.";
    }

    if (now - lastSubmitTime < RATE_LIMIT_MS) {
        const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
        return `يرجى الانتظار ${remaining} ثانية قبل إعادة الإرسال.`;
    }

    return null; // OK
}

/**
 * SECURITY: I/O Synchronization
 * Ensures the data shown to the user in the summary matches exactly what is sent.
 * Ref: "I/O Synchronization" — prevents operator evasion / misleading approvals.
 */
function buildVerifiedOrder(rawOrder) {
    // Re-derive total from trusted source values — never trust displayed text
    const basePrice = 2900;
    const qty = parseInt(rawOrder.quantity, 10);
    const computedTotal = basePrice * qty;

    return {
        name:     sanitizeText(rawOrder.name),
        phone:    rawOrder.phone.replace(/\s/g, "").slice(0, 15),
        wilaya:   sanitizeText(rawOrder.wilaya),
        commune:  sanitizeText(rawOrder.commune),
        address:  sanitizeText(rawOrder.address || ""),
        quantity: qty,
        total:    computedTotal.toLocaleString("en-US") // computed server-side style
    };
}

/**
 * SECURITY: Telegram message escaping
 * Sanitizes the final message to prevent Telegram MarkdownV2 injection.
 */
function escapeTelegram(str) {
    return String(str).replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

async function notifyAdmin(order) {
    // Build message from verified, sanitized order only
    const message =
        `🛒 طلب جديد - TOAUTO H4 LED\n` +
        `👤 الاسم: ${order.name}\n` +
        `📞 الهاتف: ${order.phone}\n` +
        `📍 الولاية: ${order.wilaya}\n` +
        `🏘️ البلدية: ${order.commune}\n` +
        `🏠 العنوان: ${order.address || 'غير محدد'}\n` +
        `🔢 الكمية: ${order.quantity}\n` +
        `💰 المجموع: ${order.total} DZD\n` +
        `🕐 التوقيت: ${new Date().toLocaleString("fr-DZ")}`;

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.description);
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
        // SECURITY: Re-compute from integer qty — never trust string math
        const qty = Math.min(Math.max(parseInt(qtyInput.value, 10) || 1, 1), 10);
        qtyInput.value = qty; // Clamp displayed value too
        const total = basePrice * qty;
        const formattedTotal = 'DZD ' + total.toLocaleString('en-US') + '.00';
        priceDisplay.textContent = formattedTotal;
        totalDisplay.textContent = formattedTotal;
    }

    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10);
            if (val > 1) { qtyInput.value = val - 1; updatePrices(); }
        });
        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10);
            if (val < 10) { qtyInput.value = val + 1; updatePrices(); }
        });
    }

    updatePrices();

    // Form submission + Security + Telegram
    const form = document.querySelector('.cod-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // SECURITY: Rate Limit Check
            const rateLimitError = checkRateLimit();
            if (rateLimitError) {
                alert('⚠️ ' + rateLimitError);
                return;
            }

            // Collect raw inputs
            const rawOrder = {
                name:     form.querySelector('input[type="text"]').value,
                phone:    form.querySelector('input[type="tel"]').value,
                wilaya:   document.getElementById('wilaya-select').options[document.getElementById('wilaya-select').selectedIndex].text,
                commune:  document.getElementById('baladiya-input').value,
                address:  form.querySelectorAll('input[type="text"]')[2]?.value || '',
                quantity: qtyInput.value,
            };

            // SECURITY: Data Type Gating — validate before anything else
            const validationErrors = validateOrder({
                ...rawOrder,
                name:    sanitizeText(rawOrder.name),
                commune: sanitizeText(rawOrder.commune),
            });

            if (validationErrors.length > 0) {
                alert('⚠️ يرجى تصحيح الأخطاء التالية:\n\n' + validationErrors.join('\n'));
                return;
            }

            // SECURITY: I/O Synchronization — build a verified, sanitized order
            const order = buildVerifiedOrder(rawOrder);

            // SECURITY: Final I/O check — confirm displayed total matches computed total
            const displayedTotal = totalDisplay.textContent.replace(/[^0-9,]/g, '').replace(',', '');
            const computedTotalRaw = String(basePrice * order.quantity).replace(',', '');
            if (displayedTotal !== computedTotalRaw) {
                alert('⚠️ خطأ في بيانات الطلب. يرجى تحديث الصفحة والمحاولة مجدداً.');
                return;
            }

            const submitBtn = document.getElementById('submit-purchase');
            submitBtn.disabled = true;
            submitBtn.textContent = '...جاري الإرسال';

            // Track submission attempt
            sessionAttempts++;
            lastSubmitTime = Date.now();

            try {
                await notifyAdmin(order);
                alert('✅ تم استلام طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلب.');
                form.reset();
                updatePrices();
            } catch (err) {
                // SECURITY: Never expose internal error details to the user
                console.error("Submission error:", err);
                alert('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'إشتري الان';
            }
        });
    }
});
