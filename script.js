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
            element.textContent = text;
        }
    });
    
    // Update input placeholder
    if (messageInput) {
        const placeholder = messageInput.getAttribute(`data-placeholder-${lang}`);
        if (placeholder) {
            messageInput.placeholder = placeholder;
        }
    }
}

// Load saved language preference or default to Amharic
const savedLang = localStorage.getItem('preferredLanguage') || 'am';
langToggle.checked = (savedLang === 'en');
switchLanguage(savedLang);

langToggle.addEventListener('change', (e) => {
    const lang = e.target.checked ? 'en' : 'am';
    switchLanguage(lang);
});

// Quick WhatsApp Message Function
function sendQuickMessage() {
    const message = document.getElementById('quickMessage').value;
    if (message.trim() === '') {
        alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message');
        return;
    }
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/251991856292?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    document.getElementById('quickMessage').value = '';
}

// Allow Enter key to send message
document.getElementById('quickMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendQuickMessage();
    }
});

// WhatsApp Button - Remove draggable, just open WhatsApp
const whatsappBtn = document.getElementById('whatsappBtn');

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

// Buy button functionality
document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const orderMessage = this.getAttribute('data-order-msg');
        
        // Encode message for WhatsApp URL
        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappURL = `https://wa.me/251991856292?text=${encodedMessage}`;
        
        // Open WhatsApp with pre-filled message
        window.open(whatsappURL, '_blank');
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
