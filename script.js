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

// ===== PWA (Service Worker only — no install prompt) =====
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); });
window.addEventListener('appinstalled', function() {
    var now = new Date().toLocaleString('en-ET', { timeZone: 'Africa/Addis_Ababa' });
    sendTelegramNotification('📲 <b>New App Install!</b>\n🕐 ' + now + '\n🌍 Tag Bridge PWA');
});

// ===== REFERRAL (URL tracking only) =====
function generateRefCode() {
    var stored = localStorage.getItem('refCode');
    if (stored) return stored;
    var code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('refCode', code);
    return code;
}

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
            setInterval(function() { reg.update(); }, 5 * 60 * 1000);
        }).catch(function() {});

        navigator.serviceWorker.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'SW_UPDATED') {
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

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', function() {
    // Store referral code from URL
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    if (ref) sessionStorage.setItem('referredBy', ref);
});

// ===== SCROLL PROGRESS BAR & BACK TO TOP =====
var progressBar = document.getElementById('scrollProgress');
var backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
    if (backToTopBtn) {
        if (scrollTop > 400) backToTopBtn.classList.add('visible');
        else backToTopBtn.classList.remove('visible');
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Clear any stale light-mode from localStorage
localStorage.removeItem('theme');
document.body.classList.remove('light-mode');

// ===== BOOK CONTENTS ACCORDION =====
function toggleContents(btn) {
    var body = btn.nextElementSibling;
    var isOpen = body.classList.contains('open');
    btn.classList.toggle('open', !isOpen);
    body.classList.toggle('open', !isOpen);
}

// ===== NAV RESOURCES DROPDOWN =====
document.querySelectorAll('.nav-resources-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        var li = this.closest('.nav-resources-li');
        var isOpen = li.classList.contains('open');
        document.querySelectorAll('.nav-resources-li').forEach(function(d) { d.classList.remove('open'); });
        if (!isOpen) li.classList.add('open');
    });
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-resources-li')) {
        document.querySelectorAll('.nav-resources-li').forEach(function(d) { d.classList.remove('open'); });
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
            if (current >= target) { current = target; clearInterval(timer); }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) { animateCounters(); statsObserver.disconnect(); }
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
    if (!isOpen) { answer.classList.add('open'); question.classList.add('open'); }
}

// ===== SERVICE DROPDOWN =====
document.querySelectorAll('.service-header').forEach(function(header) {
    header.addEventListener('click', function() {
        var list = this.nextElementSibling;
        var isOpen = list.classList.contains('open');
        document.querySelectorAll('.service-list').forEach(function(l) { l.classList.remove('open'); });
        document.querySelectorAll('.service-header').forEach(function(h) { h.classList.remove('open'); });
        if (!isOpen) { list.classList.add('open'); this.classList.add('open'); }
    });
});

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
    }
});

navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
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
            if (text.includes('<span')) element.innerHTML = text;
            else element.textContent = text;
        }
    });
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function(el) {
        el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
}

const savedLang = localStorage.getItem('preferredLanguage') || 'am';
langToggle.checked = (savedLang === 'en');
switchLanguage(savedLang);

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
    if (refBy && !message.includes('Referral:')) finalMsg = message + '\n[Ref: ' + refBy + ']';
    var encodedFinal = encodeURIComponent(finalMsg);
    var tgWeb = 'https://t.me/tagbridge123?text=' + encodedFinal;

    if (isRestricted) {
        window.location.href = '/tg.html?msg=' + encodedFinal;
    } else if (isMobile) {
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
    if (message.trim() === '') { alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message'); return; }
    openWhatsApp(message);
    document.getElementById('quickMessage').value = '';
}

function sendTelegramMessage() {
    var message = document.getElementById('telegramMessage').value;
    if (message.trim() === '') { alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message'); return; }
    // Contact section — always use web URL (no cached pre-filled text issue)
    var encoded = encodeURIComponent(message);
    var ua = navigator.userAgent || '';
    var isRestricted = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV|FBIOS/i.test(ua);
    if (isRestricted) {
        window.location.href = '/tg.html?msg=' + encoded;
    } else {
        window.open('https://t.me/tagbridge123?text=' + encoded, '_blank');
    }
    document.getElementById('telegramMessage').value = '';
}

document.getElementById('quickMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendQuickMessage();
});
document.getElementById('telegramMessage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendTelegramMessage();
});

// ===== TELEGRAM FLOAT BUTTON (draggable) =====
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
    isDragging = true; hasMoved = false;
    whatsappBtn.style.animation = 'none';
    whatsappBtn.style.cursor = 'grabbing';
    whatsappBtn.style.transition = 'none';
    var rect = whatsappBtn.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    if (e.type === 'touchstart') { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
    else { startX = e.clientX; startY = e.clientY; }
}

function dragMove(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();
    var clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    var clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    var dx = clientX - startX; var dy = clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    var newLeft = Math.max(10, Math.min(window.innerWidth - 68, startLeft + dx));
    var newTop = Math.max(10, Math.min(window.innerHeight - 68, startTop + dy));
    whatsappBtn.style.left = newLeft + 'px'; whatsappBtn.style.top = newTop + 'px';
    whatsappBtn.style.bottom = 'auto'; whatsappBtn.style.transform = 'none';
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    whatsappBtn.style.cursor = 'grab';
    whatsappBtn.style.animation = 'whatsappPulse 2.5s ease-in-out infinite';
    if (!hasMoved) openTelegram('ሰላም ታግ ብሪጅ! ተጨማሪ ማብራሪያ እፈልጋለሁ።');
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
document.querySelectorAll('.btn-buy').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        var book = this.getAttribute('data-book') || 'forex';
        var bookNames = {
            'forex':  'የፎሬክስ ትሬዲንግ መማሪያ መጽሃፍ በ 350 ብር ማዘዝ እፈልጋለሁ።',
            'crypto': 'የክሪፕቶ ትሬዲንግ መማሪያ መጽሃፍ በ 400 ብር ማዘዝ እፈልጋለሁ።',
            'bundle': 'ፎሬክስ + ክሪፕቶ ጥቅል በ 500 ብር ማዘዝ እፈልጋለሁ።'
        };
        openTelegram('ሰላም! ' + (bookNames[book] || bookNames['forex']));
    });
});

// Make card clickable — delegates to btn-buy
document.querySelectorAll('.product-card').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-buy') || e.target.closest('.btn-buy')) return;
        if (e.target.closest('a')) return;
        var btn = this.querySelector('.btn-buy');
        if (btn) btn.click();
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


// ===========================
// LIVE MARKET TICKER
// ===========================
(function initTicker() {
    var prevPrices = {};

    function formatPrice(p) {
        if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        if (p >= 1)    return '$' + p.toFixed(2);
        return '$' + p.toFixed(4);
    }

    function formatChange(pct) {
        var sign = pct >= 0 ? '+' : '';
        return sign + pct.toFixed(2) + '%';
    }

    function setTick(id, price, changePct) {
        var el = document.getElementById(id);
        if (!el) return;
        var priceEl  = el.querySelector('.tick-price');
        var changeEl = el.querySelector('.tick-change');
        if (priceEl)  priceEl.textContent  = formatPrice(price);
        if (changeEl) {
            changeEl.textContent = formatChange(changePct);
            changeEl.className   = 'tick-change ' + (changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat');
        }
    }

    function fetchCrypto() {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd&include_24hr_change=true', {
            headers: { 'Accept': 'application/json' }
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.bitcoin)    setTick('tick-btc', d.bitcoin.usd,    d.bitcoin.usd_24h_change);
            if (d.ethereum)   setTick('tick-eth', d.ethereum.usd,   d.ethereum.usd_24h_change);
            if (d.binancecoin) setTick('tick-bnb', d.binancecoin.usd, d.binancecoin.usd_24h_change);
        })
        .catch(function() {});
    }

    function fetchForex() {
        // EUR/USD via exchangerate-api (free, no key needed for this endpoint)
        fetch('https://open.er-api.com/v6/latest/USD')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.rates && d.rates.EUR) {
                var eurUsd = (1 / d.rates.EUR);
                var prev   = prevPrices['eur'] || eurUsd;
                var pct    = ((eurUsd - prev) / prev) * 100;
                prevPrices['eur'] = eurUsd;
                setTick('tick-eur', eurUsd, pct);
            }
        })
        .catch(function() {});
    }

    function fetchGold() {
        // Gold via metals-api free proxy (fallback static if unavailable)
        fetch('https://api.metals.live/v1/spot/gold')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            var price = Array.isArray(d) ? d[0].price : (d.price || d.gold);
            if (price) {
                var prev = prevPrices['gold'] || price;
                var pct  = ((price - prev) / prev) * 100;
                prevPrices['gold'] = price;
                setTick('tick-gold', price, pct);
            }
        })
        .catch(function() {
            // Fallback: show static approximate
            var el = document.getElementById('tick-gold');
            if (el) {
                var p = el.querySelector('.tick-price');
                var c = el.querySelector('.tick-change');
                if (p) p.textContent = '$2,320';
                if (c) { c.textContent = 'N/A'; c.className = 'tick-change flat'; }
            }
        });
    }

    function refresh() {
        fetchCrypto();
        fetchForex();
        fetchGold();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { refresh(); setInterval(refresh, 60000); });
    } else {
        refresh();
        setInterval(refresh, 60000);
    }
})();

// ===========================
// AI QUIZ — chatbot style
// ===========================
(function initQuiz() {

    var questions = [
        {
            q:  'Pip (ፒፕ) ምንድን ነው? 💱',
            opts: ['የምንዛሬ ጥንድ ዋጋ ትንሹ ለውጥ', 'የፎሬክስ ብሮከር ስም', 'ዲጂታል ኮይን አይነት', 'የጊዜ ፍሬም ስም'],
            correct: 0,
            explain: 'ፒፕ = የምንዛሬ ዋጋ ትንሹ ሊሆን የሚችል ለውጥ ነው (0.0001 ለበዛ currencies).'
        },
        {
            q:  'Blockchain ምንድን ነው? ⛓️',
            opts: ['ዲሴንትራላይዝድ ዲጂታል ሌጀር', 'የባንክ አይነት', 'ክሪፕቶ ኤክስቼንጅ', 'ትሬዲንግ ስትራቴጂ'],
            correct: 0,
            explain: 'ብሎክቼይን = ዲሴንትራላይዝድ ዲጂታል መዝገብ ሲሆን ሁሉም ትራንዛክሽኖች ይቀዳሉ።'
        },
        {
            q:  'Bull Market (ቡል ማርኬት) ምን ማለት ነው? 🐂',
            opts: ['ዋጋ እየወደቀ ያለበት ገበያ', 'ዋጋ እየጨመረ ያለበት ገበያ', 'ዋጋ ተረጋጋ ያለበት ገበያ', 'አዲስ ዲጂታል ኮይን'],
            correct: 1,
            explain: 'Bull Market = ዋጋዎች እያደጉ ያሉበት ብሩህ ገበያ ነው። Bear Market ደግሞ ተቃራኒው።'
        },
        {
            q:  'Stop Loss ለምን ይጠቅማል? 🛡️',
            opts: ['ትርፍ ለማሳደግ', 'ኪሳራን ለመገደብ', 'ፈጣን ትሬድ ለማድረግ', 'ሌቨሬጅ ለማሳደግ'],
            correct: 1,
            explain: 'Stop Loss = ዋጋ ወደ ታች ሲወርድ ራስ ሰር ትሬዱን ዘግቶ ኪሳራን ይገድባል።'
        },
        {
            q:  'Leverage (ሌቨሬጅ) ምን ማለት ነው? ⚡',
            opts: ['ነጻ ትሬዲንግ ፕላትፎርም', 'ትንሽ ገንዘብ ብዙ ቦታ ለማስቀመጥ', 'ክሪፕቶ ዋሌት', 'ካንድልስቲክ ፓተርን'],
            correct: 1,
            explain: 'Leverage = ትንሽ ካፒታል ብዙ ትልቅ ፖዚሽን ለመከፈት ያስችላል — ሪስክም ትርፍም ይጨምራል።'
        },
        {
            q:  'Candlestick ቀይ (Bearish) ሲሆን ምን ማለት ነው? 🕯️',
            opts: ['ዋጋ ጨምሯል', 'ዋጋ ቀንሷል', 'ሁኔታ ተረጋጋ', 'ኒውስ ወጥቷል'],
            correct: 1,
            explain: 'ቀይ/ቢርሽ ካንደል = ዋጋ ካደረ ዝቅ ብሎ ዘጋ ማለት ነው። አረንጓዴ/ቡሊሽ ደግሞ ተቃራኒ።'
        },
        {
            q:  'Support Level (ሰፖርት) ምን ማለት ነው? 📊',
            opts: ['ዋጋ ሊያልፈው ያልቻለ ወለል', 'ዋጋ ሊያልፈው ያልቻለ ጣሪያ', 'ትሬዲንግ ሰዓት', 'ኢኮኖሚ ሪፖርት'],
            correct: 0,
            explain: 'Support = ዋጋ ወደ ታች ሲወርድ "ወለሉን" ሆኖ ዋጋ ሲደገፍ ያዩበት ቦታ ነው።'
        },
        {
            q:  'HODL ምን ማለት ነው? 💎',
            opts: ['ፈጣን ሸጦ ትርፍ ማግኘት', 'ኮይን ደልሎ ረጅም ጊዜ ማስቀመጥ', 'ደይ-ትሬዲንግ ስትራቴጂ', 'ሃርድ ፎርክ'],
            correct: 1,
            explain: 'HODL = "Hold On for Dear Life" — ዋጋ ወቅታዊ ቢወርድ ሳትሸጥ ረጅም ጊዜ ማቆየት ስትራቴጂ።'
        },
        {
            q:  'Fundamental Analysis (ፋንዳሜንታል ትንተና) ምን ይጠቀማል? 🔍',
            opts: ['ቻርት እና ኢንዲኬተሮች', 'ኢኮኖሚ ዜናዎች እና ሪፖርቶች', 'ካንድልስቲክ ፓተርን', 'ሙቪንግ አቬሬጅ'],
            correct: 1,
            explain: 'Fundamental Analysis = GDP፣ ወለድ ዋጋ፣ ዜናዎች... ውሳኔ ለመስጠት ኢኮኖሚ መረጃ ይጠቀማል።'
        },
        {
            q:  'Risk Management ለምን ወሳኝ ነው? ⚖️',
            opts: ['ቶሎ ለሀብታም ለመሆን', 'ካፒታልን ለመጠበቅ እና ረጅም ጊዜ ለቆም', 'ብዙ ትሬዶች ለመክፈት', 'ብሮከር ለመቀያየር'],
            correct: 1,
            explain: 'Risk Management = ካፒታልህን ጠብቆ ረዘም ላለ ጊዜ ትሬዲንግ ለቀጠል። ሳይኖር ሁሉ ሊጠፋ ይችላል።'
        }
    ];

    var currentQ   = 0;
    var score      = 0;
    var quizActive = false;
    var chatEl, optionsEl, startWrapEl;

    function init() {
        chatEl     = document.getElementById('quizChat');
        optionsEl  = document.getElementById('quizOptions');
        startWrapEl = document.getElementById('quizStartWrap');
    }

    // Scroll chat to bottom
    function scrollChat() {
        if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    }

    // Add bot message (with typing animation)
    function botMsg(text, delay) {
        delay = delay || 0;
        return new Promise(function(resolve) {
            setTimeout(function() {
                // Show typing
                var typing = document.createElement('div');
                typing.className = 'quiz-msg-bot quiz-typing';
                typing.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
                chatEl.appendChild(typing);
                scrollChat();

                setTimeout(function() {
                    chatEl.removeChild(typing);
                    var msg = document.createElement('div');
                    msg.className = 'quiz-msg-bot';
                    msg.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="quiz-bubble-bot">' + text + '</div>';
                    chatEl.appendChild(msg);
                    scrollChat();
                    resolve();
                }, 700);
            }, delay);
        });
    }

    // Add user message
    function userMsg(text) {
        var msg = document.createElement('div');
        msg.className = 'quiz-msg-user';
        msg.innerHTML = '<div class="quiz-bubble-user">' + text + '</div>';
        chatEl.appendChild(msg);
        scrollChat();
    }

    // Show options
    function showOptions(opts, onSelect) {
        optionsEl.innerHTML = '';
        opts.forEach(function(opt, i) {
            var btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.textContent = ['A', 'B', 'C', 'D'][i] + '. ' + opt;
            btn.onclick = function() { onSelect(i, btn); };
            optionsEl.appendChild(btn);
        });
    }

    // Clear options
    function clearOptions() { optionsEl.innerHTML = ''; }

    // Ask one question
    function askQuestion(index) {
        if (index >= questions.length) { showResult(); return; }
        var q = questions[index];
        botMsg((index + 1) + '/10 · ' + q.q).then(function() {
            showOptions(q.opts, function(chosen, btn) {
                // Disable all buttons
                optionsEl.querySelectorAll('.quiz-opt-btn').forEach(function(b) { b.disabled = true; });

                var isCorrect = (chosen === q.correct);
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                if (!isCorrect) optionsEl.querySelectorAll('.quiz-opt-btn')[q.correct].classList.add('correct');

                userMsg(['A', 'B', 'C', 'D'][chosen] + '. ' + q.opts[chosen]);
                if (isCorrect) { score++; }

                botMsg(isCorrect ? '✅ ትክክል ነው! ' + q.explain : '❌ አልሆነም። ' + q.explain, 400).then(function() {
                    clearOptions();
                    currentQ++;
                    askQuestion(currentQ);
                });
            });
        });
    }

    // Show final result
    function showResult() {
        var pct = Math.round((score / questions.length) * 100);

        var level, emoji, msg, ctaLabel;
        if (pct >= 80) {
            level = 'Pro Trader 🏆'; emoji = '🏆';
            msg   = 'አስደናቂ! ' + score + '/10 መምታትህ ፕሮ ደረጃ ያሳያል። ስትራቴጂህን ለማሻሻል መጽሃፍቱ ይጠቅምሃል!';
            ctaLabel = 'Bundle ስዘዝ — 500 ብር';
        } else if (pct >= 50) {
            level = 'Intermediate Trader 📈'; emoji = '📈';
            msg   = score + '/10 — ጥሩ መሠረት አለህ! ለሙሉ እውቀት የፎሬክስ ወይም ክሪፕቶ መጽሃፍ ይረዳሃል።';
            ctaLabel = 'መጽሃፍ ስዘዝ';
        } else {
            level = 'Beginner Trader 🌱'; emoji = '🌱';
            msg   = score + '/10 — ጀማሪ ነህ! አሳዝኖ አይሆን — ሁሉም ከዚሁ ጀምሮ ነው። መጽሃፍቱ ሁሉንም ከዜሮ ያስተምርሃል።';
            ctaLabel = 'ጀምሮ ስዘዝ — 350 ብር';
        }

        clearOptions();
        var resultEl = document.createElement('div');
        resultEl.className = 'quiz-result';
        resultEl.innerHTML =
            '<div class="quiz-result-emoji">' + emoji + '</div>' +
            '<div class="quiz-result-title">' + level + '</div>' +
            '<div class="quiz-result-score">' + score + ' / ' + questions.length + ' ትክክለኛ (' + pct + '%)</div>' +
            '<div class="quiz-result-bar-wrap"><div class="quiz-result-bar" id="quizBar" style="width:0%"></div></div>' +
            '<div class="quiz-result-msg">' + msg + '</div>' +
            '<button class="quiz-cta-btn" onclick="document.getElementById(\'products\').scrollIntoView({behavior:\'smooth\'})">' + ctaLabel + '</button>' +
            '<button class="quiz-retry-btn" onclick="retryQuiz()">እንደገና ሞክር</button>';
        chatEl.appendChild(resultEl);
        scrollChat();

        // Animate bar
        setTimeout(function() {
            var bar = document.getElementById('quizBar');
            if (bar) bar.style.width = pct + '%';
        }, 200);
    }

    // Public: start quiz
    window.startQuiz = function() {
        if (quizActive) return;
        quizActive = true;
        init();
        startWrapEl.style.display = 'none';
        chatEl.innerHTML = '';
        score = 0; currentQ = 0;

        botMsg('ሰላም! 👋 እኔ ታግ ብሪጅ AI ቦት ነኝ። ስለ ፎሬክስ እና ክሪፕቶ ምን ያህል እንደምታውቅ ፈትን!').then(function() {
            return botMsg('10 ጥያቄዎች አሉ። ለእያንዳንዱ A/B/C/D ምረጥ። ዝግጁ ነህ? 🚀', 300);
        }).then(function() {
            askQuestion(0);
        });
    };

    // Public: retry quiz
    window.retryQuiz = function() {
        quizActive = false;
        init();
        chatEl.innerHTML = '';
        clearOptions();
        startWrapEl.style.display = 'block';
        score = 0; currentQ = 0;
    };

})();
