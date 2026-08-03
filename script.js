// Stats Counter Animation
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(function(counter) {
        var target = parseInt(counter.getAttribute('data-target'));
        var duration = 2000;
        var step = target / (duration / 16);
        var current = 0;
        var timer = setInterval(function() {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

var statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

// FAQ Toggle
function toggleFaq(question) {
    var answer = question.nextElementSibling;
    var isOpen = answer.classList.contains('open');

    document.querySelectorAll('.faq-answer').forEach(function(a) { a.classList.remove('open'); });
    document.querySelectorAll('.faq-question').forEach(function(q) { q.classList.remove('open'); });

    if (!isOpen) {
        answer.classList.add('open');
        question.classList.add('open');
    }
}

// Service Dropdown Toggle
document.querySelectorAll('.service-header').forEach(function(header) {
    header.addEventListener('click', function() {
        var list = this.nextElementSibling;
        var isOpen = list.classList.contains('open');

        // Close all
        document.querySelectorAll('.service-list').forEach(function(l) {
            l.classList.remove('open');
        });
        document.querySelectorAll('.service-header').forEach(function(h) {
            h.classList.remove('open');
        });

        // Open clicked one if it was closed
        if (!isOpen) {
            list.classList.add('open');
            this.classList.add('open');
        }
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Language Switcher
const langToggle = document.getElementById('langToggle');
const elementsWithLang = document.querySelectorAll('[data-en][data-am]');
const messageInput = document.getElementById('quickMessage');

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);

    elementsWithLang.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (text.includes('<span')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });

    // Update input placeholders
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
        el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
}

// Load saved language preference - ALWAYS default to Amharic
const savedLang = localStorage.getItem('preferredLanguage') || 'am';
langToggle.checked = (savedLang === 'en');
switchLanguage(savedLang);

// Clear any saved English preference on first visit
if (!localStorage.getItem('preferredLanguage')) {
    localStorage.setItem('preferredLanguage', 'am');
}

langToggle.addEventListener('change', (e) => {
    const lang = e.target.checked ? 'en' : 'am';
    switchLanguage(lang);
});

// YouTube Guide Modal
function openYtModal() {
    document.getElementById('ytModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeYtModal() {
    document.getElementById('ytModal').style.display = 'none';
    document.body.style.overflow = '';
}

function subscribeAndNotify() {
    // Send WhatsApp message after 1.5 seconds (while YouTube opens in new tab)
    setTimeout(function() {
        var msg = 'ሰላም ታግ ብሪጅ! የዩቲዩብ ቻናሉን ሰብስክራይብ አድርጌያለሁ። ነጻ የዩቲዩብ ጋይዱን ይላኩልኝ 🙏';
        openWhatsApp(msg);
        closeYtModal();
    }, 1500);
}

function getYtGuideOnWhatsApp() {
    var msg = 'ሰላም ታግ ብሪጅ! ዩቲዩብ ቻናሉን ሰብስክራይብ አድርጌያለሁ። ነጻ የዩቲዩብ ጋይዱን ይላኩልኝ።';
    openWhatsApp(msg);
    closeYtModal();
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    var modal = document.getElementById('ytModal');
    if (e.target === modal) closeYtModal();
});

// YouTube Guide Flow
function handleYouTubeFlow() {
    var ytUrl = 'https://www.youtube.com/@tagbridge?sub_confirmation=1';
    var waUrl = 'https://whatsapp.com/channel/0029VbC9h9Z4o7qIBVOmFE1j';

    // Try to open YouTube in a new tab
    var ytWindow = window.open(ytUrl, '_blank');

    // Gracefully handle popup blockers
    if (!ytWindow || ytWindow.closed || typeof ytWindow.closed === 'undefined') {
        // Popup was blocked — navigate current tab to YouTube, skip WhatsApp redirect
        window.location.href = ytUrl;
        return;
    }

    // After 2 seconds, redirect current page to WhatsApp Channel
    setTimeout(function() {
        window.location.href = waUrl;
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    var ytBtn = document.getElementById('youtube-guide-btn');
    if (ytBtn) {
        ytBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/@tagbridge?sub_confirmation=1', '_blank');
        });
    }
});

// Fast Telegram redirect
function openTelegram(message) {
    var encoded = encodeURIComponent(message);
    var ua = navigator.userAgent || '';
    var isRestricted = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV/i.test(ua);
    if (isRestricted) {
        window.location.href = '/tg.html?msg=' + encoded;
    } else {
        window.location.href = 'https://t.me/tagbridge123?text=' + encoded;
    }
}

// Fast WhatsApp redirect - works in TikTok/Instagram browsers
function openWhatsApp(message) {
    var encoded = encodeURIComponent(message);
    var ua = navigator.userAgent || '';
    var isTikTok = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV/i.test(ua);
    if (isTikTok) {
        window.location.href = '/wa.html?msg=' + encoded;
    } else {
        window.open('https://wa.me/251991856292?text=' + encoded, '_blank');
    }
}

// Quick WhatsApp Message Function (contact section)
function sendQuickMessage() {
    var message = document.getElementById('quickMessage').value;
    if (message.trim() === '') {
        alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message');
        return;
    }
    openWhatsApp(message);
    document.getElementById('quickMessage').value = '';
}

// Quick Telegram Message Function
function sendTelegramMessage() {
    var message = document.getElementById('telegramMessage').value;
    if (message.trim() === '') {
        alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message');
        return;
    }
    openTelegram(message);
    document.getElementById('telegramMessage').value = '';
}

// Allow Enter key to send messages
document.getElementById('quickMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendQuickMessage();
});

document.getElementById('telegramMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendTelegramMessage();
});

// WhatsApp Button - Draggable, default center bottom
const whatsappBtn = document.getElementById('whatsappBtn');
let isDragging = false;
let hasMoved = false;
let startX, startY, startLeft, startTop;

whatsappBtn.addEventListener('mousedown', dragStart);
whatsappBtn.addEventListener('touchstart', dragStart, { passive: true });
document.addEventListener('mousemove', dragMove);
document.addEventListener('touchmove', dragMove, { passive: false });
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    isDragging = true;
    hasMoved = false;
    whatsappBtn.style.animation = 'none';
    whatsappBtn.style.cursor = 'grabbing';
    whatsappBtn.style.transition = 'none';

    var rect = whatsappBtn.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else {
        startX = e.clientX;
        startY = e.clientY;
    }
}

function dragMove(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();

    var clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    var clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    var dx = clientX - startX;
    var dy = clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;

    var newLeft = startLeft + dx;
    var newTop = startTop + dy;

    // Keep within screen bounds
    newLeft = Math.max(10, Math.min(window.innerWidth - 68, newLeft));
    newTop = Math.max(10, Math.min(window.innerHeight - 68, newTop));

    whatsappBtn.style.left = newLeft + 'px';
    whatsappBtn.style.top = newTop + 'px';
    whatsappBtn.style.bottom = 'auto';
    whatsappBtn.style.transform = 'none';
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    whatsappBtn.style.cursor = 'grab';
    whatsappBtn.style.animation = 'whatsappPulse 2.5s ease-in-out infinite';

    // If not moved, treat as click
    if (!hasMoved) {
        openTelegram('ሰላም ታግ ብሪጅ! ተጨማሪ ማብራሪያ እፈልጋለሁ።');
    }
}

// Smooth scrolling for navigation links
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

// Make entire product card clickable
document.querySelectorAll('.product-card:not(.yt-guide-card)').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-buy') || e.target.closest('.btn-buy')) return;
        if (e.target.closest('a')) return;
        var btn = this.querySelector('.btn-buy');
        if (btn) btn.click();
    });
});

// Buy button functionality - redirect to Telegram
document.querySelectorAll('.btn-buy').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        var orderMessage = this.getAttribute('data-order-msg');
        if (orderMessage) {
            openTelegram(orderMessage);
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
