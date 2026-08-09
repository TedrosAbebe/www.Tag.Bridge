// ===== TELEGRAM NOTIFICATION (admin tracker) =====
function sendTelegramNotification(msg) {
    var token = '8983227461:AAEFFLkC0RIb1uMndPJdAE2YGcB91vXldxc';
    var chatId = '867253752';
    fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
    }).catch(function() {});
}

// ===== PWA INSTALL BANNER (top bar) =====
let deferredPrompt = null;

function showInstallBanner() {
    var banner = document.getElementById('installBanner');
    if (!banner) return;

    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

    // Mobile only
    var ua = navigator.userAgent || '';
    if (!/Android|iPhone|iPad|iPod/i.test(ua)) return;

    banner.style.display = 'flex';
}

function hideInstallBanner() {
    var banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
}

// Single beforeinstallprompt listener
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

// Single appinstalled listener
window.addEventListener('appinstalled', function() {
    deferredPrompt = null;
    var count = parseInt(localStorage.getItem('installCount') || '0') + 1;
    localStorage.setItem('installCount', count);
    var now = new Date().toLocaleString('en-ET', { timeZone: 'Africa/Addis_Ababa' });
    sendTelegramNotification(
        '📲 <b>New App Install!</b>\n' +
        '━━━━━━━━━━━━━━\n' +
        '🕐 Time: ' + now + '\n' +
        '📱 Device: ' + (navigator.userAgent.match(/Android|iPhone|iPad/) || ['Unknown'])[0] + '\n' +
        '🌍 Tag Bridge PWA installed successfully!'
    );
});

// ===== REFERRAL SYSTEM =====
function generateRefCode() {
    var stored = localStorage.getItem('refCode');
    if (stored) return stored;
    var code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('refCode', code);
    return code;
}

function getReferralLink() {
    var code = generateRefCode();
    return 'https://www-tag-bridge.vercel.app/?ref=' + code;
}

function shareReferral() {
    var link = getReferralLink();
    var code = generateRefCode();
    var msg = '📚 ታግ ብሪጅ — የፎሬክስ እና ክሪፕቶ ትሬዲንግ መጽሃፍት!\n\nይህን link ተጠቅመህ ብትገዛ ልዩ ቅናሽ ታገኛለህ 👇\n' + link + '\n\n(Referral: ' + code + ')';
    openTelegram(msg);
}
// ===== END REFERRAL =====

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
            // Check for SW updates every 5 minutes (not every 60s)
            setInterval(function() { reg.update(); }, 5 * 60 * 1000);
        }).catch(function() {});

        // Listen for SW_UPDATED message — show update banner after short delay
        navigator.serviceWorker.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'SW_UPDATED') {
                // Wait 3 minutes before showing update banner (don't interrupt immediately)
                setTimeout(function() {
                    var banner = document.getElementById('updateBanner');
                    if (banner) {
                        banner.style.display = 'flex';
                        var btn = document.getElementById('updateNowBtn');
                        if (btn) {
                            btn.addEventListener('click', function() {
                                banner.style.display = 'none';
                                window.location.reload();
                            });
                        }
                    }
                }, 3 * 60 * 1000);
            }
        });
    });
}

// ===== SINGLE DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', function() {

    // --- Referral link input ---
    var refInput = document.getElementById('referralLinkInput');
    if (refInput) refInput.value = getReferralLink();

    // --- Store referral code if visited via ref link ---
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    if (ref) sessionStorage.setItem('referredBy', ref);

    // --- Install button ---
    var overlayInstallBtn = document.getElementById('overlayInstallBtn');
    if (overlayInstallBtn) {
        overlayInstallBtn.addEventListener('click', async function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                if (outcome === 'accepted') {
                    sendTelegramNotification('✅ <b>User accepted install prompt!</b>\n🌍 Tag Bridge PWA');
                }
            }
            hideInstallBanner();
        });
    }

    // --- Close button ---
    var installBannerClose = document.getElementById('installBannerClose');
    if (installBannerClose) {
        installBannerClose.addEventListener('click', function() {
            hideInstallBanner();
        });
    }

    // --- YouTube button ---
    var ytBtn = document.getElementById('youtube-guide-btn');
    if (ytBtn) {
        ytBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/@tagbridge?sub_confirmation=1', '_blank');
        });
    }
});

// ===== STAT COUNTERS =====
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

// ===== FAQ TOGGLE =====
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

// ===== SERVICE DROPDOWN =====
document.querySelectorAll('.service-header').forEach(function(header) {
    header.addEventListener('click', function() {
        var list = this.nextElementSibling;
        var isOpen = list.classList.contains('open');
        document.querySelectorAll('.service-list').forEach(function(l) { l.classList.remove('open'); });
        document.querySelectorAll('.service-header').forEach(function(h) { h.classList.remove('open'); });
        if (!isOpen) {
            list.classList.add('open');
            this.classList.add('open');
        }
    });
});

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', function() {
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

navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// ===== LANGUAGE SWITCHER =====
const langToggle = document.getElementById('langToggle');
const elementsWithLang = document.querySelectorAll('[data-en][data-am]');

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);
    elementsWithLang.forEach(function(element) {
        const text = element.getAttribute('data-' + lang);
        if (text) {
            if (text.includes('<span')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function(el) {
        el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
}

const savedLang = localStorage.getItem('preferredLanguage') || 'am';
langToggle.checked = (savedLang === 'en');
switchLanguage(savedLang);

if (!localStorage.getItem('preferredLanguage')) {
    localStorage.setItem('preferredLanguage', 'am');
}

langToggle.addEventListener('change', function(e) {
    switchLanguage(e.target.checked ? 'en' : 'am');
});

// ===== TELEGRAM REDIRECT =====
function openTelegram(message) {
    var ua = navigator.userAgent || '';
    var isRestricted = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV|FBIOS/i.test(ua);
    var isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    var refBy = sessionStorage.getItem('referredBy');
    var finalMsg = message;
    if (refBy && !message.includes('Referral:')) {
        finalMsg = message + '\n[Ref: ' + refBy + ']';
    }
    var encodedFinal = encodeURIComponent(finalMsg);
    var tgWeb = 'https://t.me/tagbridge123?text=' + encodedFinal;

    if (isRestricted) {
        window.location.href = '/tg.html?msg=' + encodedFinal;
    } else if (isMobile) {
        // tg:// deep link — opens app directly; fallback to web if not installed
        window.location.href = 'tg://resolve?domain=tagbridge123&text=' + encodedFinal;
        setTimeout(function() {
            if (!document.hidden) window.open(tgWeb, '_blank');
        }, 1500);
    } else {
        window.open(tgWeb, '_blank');
    }
}

// ===== WHATSAPP REDIRECT =====
function openWhatsApp(message) {
    var encoded = encodeURIComponent(message);
    var ua = navigator.userAgent || '';
    var isRestricted = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV|FBIOS/i.test(ua);
    if (isRestricted) {
        window.location.href = '/wa.html?msg=' + encoded;
    } else {
        window.open('https://wa.me/251991856292?text=' + encoded, '_blank');
    }
}

// ===== CONTACT SEND FUNCTIONS =====
function sendQuickMessage() {
    var message = document.getElementById('quickMessage').value;
    if (message.trim() === '') {
        alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message');
        return;
    }
    openWhatsApp(message);
    document.getElementById('quickMessage').value = '';
}

function sendTelegramMessage() {
    var message = document.getElementById('telegramMessage').value;
    if (message.trim() === '') {
        alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message');
        return;
    }
    openTelegram(message);
    document.getElementById('telegramMessage').value = '';
}

document.getElementById('quickMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendQuickMessage();
});

document.getElementById('telegramMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendTelegramMessage();
});

// ===== WHATSAPP FLOAT BUTTON (draggable) =====
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
    var newLeft = Math.max(10, Math.min(window.innerWidth - 68, startLeft + dx));
    var newTop = Math.max(10, Math.min(window.innerHeight - 68, startTop + dy));
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
    if (!hasMoved) {
        openTelegram('ሰላም ታግ ብሪጅ! ተጨማሪ ማብራሪያ እፈልጋለሁ።');
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== BUY BUTTONS =====
document.querySelectorAll('.product-card:not(.yt-guide-card)').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-buy') || e.target.closest('.btn-buy')) return;
        if (e.target.closest('a')) return;
        var btn = this.querySelector('.btn-buy');
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    });
});

document.querySelectorAll('.btn-buy').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        var orderMessage = this.getAttribute('data-order-msg');
        if (!orderMessage) return;
        openTelegram(orderMessage);
    });
});

// ===== SCROLL ANIMATION =====
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.product-card').forEach(function(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
