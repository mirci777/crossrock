// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Currency input formatter — auto-formats to "50 000 €" as user types
function formatCurrencyInput(el) {
    var cursor = el.selectionStart;
    var oldLen = el.value.length;
    var raw = el.value.replace(/[^0-9]/g, '');
    if (!raw) { el.value = ''; return; }
    el.value = parseInt(raw, 10).toLocaleString('sk-SK') + ' €';
    // Adjust cursor position for added/removed separators
    var newLen = el.value.length;
    el.selectionStart = el.selectionEnd = Math.max(0, cursor + (newLen - oldLen));
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-currency]').forEach(function(el) {
        el.addEventListener('input', function() { formatCurrencyInput(this); });
        el.addEventListener('blur', function() { formatCurrencyInput(this); });
        // Format initial value if present
        if (el.value) formatCurrencyInput(el);
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}
