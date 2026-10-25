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

if (mobileMenuBtn && navLinks) {
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
}

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

if (langToggle) {
    langToggle.addEventListener('change', function(e) {
        switchLanguage(e.target.checked ? 'en' : 'am');
    });
}

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
    var el = document.getElementById('quickMessage');
    if (!el) return;
    var message = el.value;
    if (message.trim() === '') { alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message'); return; }
    openWhatsApp(message);
    el.value = '';
}

function sendTelegramMessage() {
    var el = document.getElementById('telegramMessage');
    if (!el) return;
    var message = el.value;
    if (message.trim() === '') { alert('እባክዎ መልእክትዎን ይጻፉ / Please write your message'); return; }
    var encoded = encodeURIComponent(message);
    var ua = navigator.userAgent || '';
    var isRestricted = /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV|FBIOS/i.test(ua);
    if (isRestricted) {
        window.location.href = '/tg.html?msg=' + encoded;
    } else {
        window.open('https://t.me/tagbridge123?text=' + encoded, '_blank');
    }
    el.value = '';
}

var _qmEl = document.getElementById('quickMessage');
if (_qmEl) _qmEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendQuickMessage();
});
var _tmEl = document.getElementById('telegramMessage');
if (_tmEl) _tmEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendTelegramMessage();
});

// ===== TELEGRAM FLOAT BUTTON (draggable) =====
const whatsappBtn = document.getElementById('whatsappBtn');
let isDragging = false;
let hasMoved = false;
let startX, startY, startLeft, startTop;

if (whatsappBtn) {
    whatsappBtn.addEventListener('mousedown', dragStart);
    whatsappBtn.addEventListener('touchstart', dragStart, { passive: true });
}
document.addEventListener('mousemove', dragMove);
document.addEventListener('touchmove', dragMove, { passive: false });
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (!whatsappBtn) return;
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


// ===========================


// ===========================
// AI QUIZ — v3
// ===========================
(function() {

    // ── QUESTIONS (በቅደም ተከተል) ────────────────────────────────
    var allQ = {
        forex: [
            // ── ምዕራፍ 1 — የፎሬክስ መሠረታዊ እውቀት ──
            { q:'1. Forex ማለት ምንድን ነው?', opts:['የኩባንያዎች አክሲዮን መግዣና መሸጫ ገበያ','የተለያዩ አገራት ምንዛሬዎች የሚለወጡበት ገበያ','የዲጂታል ሳንቲሞች ብቻ የሚገበያዩበት ገበያ','የእቃዎች መገበያያ ገበያ'], correct:1, explain:'Forex የForeign Exchange ምህጻረ ቃል ሲሆን፣ የፎሬክስ ገበያ (Forex Market) ወይም በአህጽሮት FX የሚባለው የሀገራትን ገንዘቦች አንዱ ከሌላው ጋር የሚለዋወጡበት ዓለም አቀፍ ገበያ ነው።' },
            { q:'2. ከForex ገበያ ዋና ዓላማዎች አንዱ የትኛው ነው?', opts:['ምንዛሬዎችን መለዋወጥ እና ከዋጋ ለውጥ ትርፍ ለማግኘት','ቆጥቦ ወለድ ለማግኘት','የኩባንያ ሼሮችን ለመግዛት እና ለመሸጥ','የመንግሥት ቦንድ ብቻ መግዛት'], correct:0, explain:'ተሳታፊዎች ምንዛሬዎችን ለመለዋወጥ ወይም ከዋጋ ለውጥ ትርፍ ለማግኘት ይገበያያሉ። ትርፍ ዋስትና ፈጽሞ የለውም — ኪሳራም ሊኖር ይችላል።' },
            { q:'3. ከሚከተሉት ውስጥ የፎሬክስ ገበያ ተሳታፊዎች የሆኑት የትኞቹ ናቸው?', opts:['ማዕከላዊ ባንኮች','የንግድ ባንኮች እና የፋይናንስ ተቋማት','ትልልቅ ኮርፖሬሽኖች እና የኢንቨስትመንት ፈንዶች','ከላይ ያሉት ሁሉ'], correct:3, explain:'የፎሬክስ ገበያ ከተለያዩ ዓላማዎች ካሏቸው በርካታ ተሳታፊዎች የተገነባ ነው። ማዕከላዊ ባንኮች የሀገራቸውን ገንዘብ ፖሊሲ ለመቆጣጠር ጣልቃ ይገባሉ። የንግድ ባንኮች የዕለቱን ትልቁ ድርሻ ይይዛሉ። ኮርፖሬሽኖች ዓለም አቀፍ ንግዳቸውን ለማካሄድ ምንዛሬ ይፈልጋሉ። Hedge Funds ትርፍ ለማግኘት ይሳተፋሉ። Broker ለ Retail Traders ወደ ገበያ መግቢያ ያቀርባሉ። Retail Traders ደግሞ እኛ እንደ ግለሰብ Online Platforms አማካኝነት የምንሳተፍ ነጋዴዎች ነን።' },
            { q:'4. የፎሬክስ ገበያ በዓለማችን ግዙፉ የፋይናንስ ገበያ ሊሆን የቻለው ዋና ምክንያት ምንድን ነው?', opts:['ትንሽ ሀገሮች ብቻ ስለሚሳተፉ','ዓለም አቀፋዊ ባህሪው እና 24/5 ሰዓት ስለሚሰራ','በሳምንት አንድ ቀን ብቻ ስለሚከፈት','ዋጋ ሁልጊዜ ስለሚጨምር'], correct:1, explain:'ፎሬክስ በዓለማችን ላይ ግዙፉ የፋይናንስ ገበያ ሊሆን የቻለው ዓለም አቀፋዊ ባህሪውና በሳምንት አምስት ቀናት 24 ሰዓት ክፍት ስለሆነ ነው። የእስያ፣ የአውሮፓ እና የሰሜን አሜሪካ Trading Sessions ያጠቃልላል። ዕለታዊ Volume ከአክሲዮን እና ክሪፕቶ ገበያዎች ድምር በብዙ እጥፍ ይበልጣል — ይህ ከፍተኛ Liquidity ግብይቶችን በሰከንዶች ውስጥ ያፈጸምልናል። ጥቂት ሰዎች ዋጋ እንዳይቆጣጠሩ (Price Manipulation) ያዳግተዋል።' },
            { q:'5. Major Currency Pairs አብዛኛውን ጊዜ ምን ምንዛሬ ያካትታሉ?', opts:['Ethiopian Birr (ETB)','Chinese Yuan (CNY)','US Dollar (USD)','South African Rand (ZAR)'], correct:2, explain:'Major Pairs — EUR/USD፣ GBP/USD፣ USD/JPY... — ሁሉም USD ያካትታሉ። ከፍተኛ Liquidity እና ዝቅተኛ Spread ሊኖራቸው ይችላል።' },
            { q:'6. Forex ገበያ Decentralized ነው ሲባል ምን ማለት ነው?', opts:['አንድ ማዕከላዊ ኤክስቼንጅ ብቻ ይቆጣጠረዋል','ሁሉም ዋጋ አንድ ባንክ ይወስናል','ግብይቶች በተለያዩ ተሳታፊዎችና OTC Network ይከናወናሉ','ምንም ደንብ የለውም'], correct:2, explain:'OTC (Over-the-Counter) ማለት ግብይቶች በቀጥታ ወይም በዲልር Network ይፈጸማሉ — ምንም ማዕከላዊ ኤክስቼንጅ የለውም። ቢሆንም Regulator ቁጥጥር ሙሉ ሊሆን ይችላል።' },
            { q:'7. OTC ግብይት ምን ማለት ነው?', opts:['ማዕከላዊ ኤክስቼንጅ ብቻ','ሁለት ወገኖች ቀጥታ ወይም Dealer Network በኩል','ክፍያ አልባ ግብይት','Crypto ብቻ'], correct:1, explain:'OTC = Over-the-Counter። Forex OTC ሲሆን ባንኮች፣ Broker-dealers፣ ተቋማት ቀጥታ ይገበያያሉ — NYSE ወይም NSE ላይ አይደለም።' },
            { q:'8. Forex Broker ዋና ሚናው ምንድን ነው?', opts:['ትርፍ ዋስትና ይሰጣል','ትሬዲንግ Platform እና Order Execution ያቀርባል','ዋጋ ይቆጣጠራል','ኪሳራ ይሸፍናል'], correct:1, explain:'Broker ትሬደሩ ወደ ገበያ እንዲደርስ Platform፣ Leverage፣ Execution ያቀርባል። ትርፍ ዋስትና አይሰጥም — ትሬደሩ ብቻ ይወስናል።' },
            { q:'9. Demo Account ከLive Account የሚለየው እንዴት ነው?', opts:['Demo ሁልጊዜ ትርፍ ይሰጣል','Demo ምናባዊ ገንዘብ — Live እውነተኛ ገንዘብ','Live ኪሳራ የለውም','ሁለቱም ተመሳሳይ ጫና'], correct:1, explain:'Demo = ምናባዊ ገንዘብ ስለሆነ ያለ ኪሳራ ስትራቴጂ ለመለማመድ ያስችላል። Live ላይ ግን ሥነ-ልቦና ጫናና የገንዘብ አደጋ ይጨምራል — ሁለቱ ሙሉ ተመሳሳይ አይደሉም።' },
            { q:'10. የForex ዋና ተሳታፊዎች የትኞቹ ናቸው?', opts:['ማዕከላዊ ባንኮች ብቻ','የንግድ ባንኮች ብቻ','Retail ትሬደሮች ብቻ','ሁሉም — ባንኮች፣ ማዕከላዊ ባንኮች፣ Hedge Funds፣ Retail'], correct:3, explain:'Forex ዓለም አቀፍ ሲሆን ትላልቅ ባንኮች (Tier 1)፣ ማዕከላዊ ባንኮች፣ Hedge Funds፣ ኩባንያዎች፣ Retail ትሬደሮች ሁሉ ይሳተፋሉ — Retail ትሬደሮች ትንሽ ድርሻ ብቻ ናቸው።' },
            // ── ምዕራፍ 2 — Trading ቃላት ──
            { q:'11. Bid Price ምንድን ነው?', opts:['ነጋዴው Buy ሲያደርግ Broker የሚያስፈልገው','ነጋዴው Sell ሲያደርግ Broker የሚከፍለው ዋጋ','ከፍተኛ ዋጋ','ዝቅተኛ ዋጋ'], correct:1, explain:'Bid = ነጋዴው Sell (Short) ሲሆን Broker ዋጋ ነው። Ask ደግሞ ነጋዴው Buy ሲሆን ከፍ ያለ ዋጋ ነው። Bid ሁልጊዜ Ask ን ያንሳል።' },
            { q:'12. Ask Price ምንድን ነው?', opts:['ነጋዴው Buy ሲያደርግ ከBroker የሚከፍለው ዋጋ','ዝቅተኛ ዋጋ','ቀን መክፈቻ ዋጋ','Stop Loss ዋጋ'], correct:0, explain:'Ask = ነጋዴው Buy (Long) ሲሆን Broker ዋጋ ነው። Ask > Bid ሁልጊዜ — ልዩነቱ Spread ይባላል።' },
            { q:'13. Spread እንዴት ይሰላል?', opts:['Bid + Ask','Ask − Bid','Ask × Bid','Bid ÷ Ask'], correct:1, explain:'Spread = Ask − Bid። Broker ዋና ትርፍ ምንጭ ሲሆን ዝቅተኛ Spread ያለው Broker ለትሬደሩ ወጪ ዝቅ ሊያደርግ ይችላል።' },
            { q:'14. Bid=1.1000 Ask=1.1002 ሲሆን Spread ስንት pips ነው?', opts:['0.2 pip','2 pips','20 pips','200 pips'], correct:1, explain:'Ask − Bid = 0.0002 ÷ 0.0001 = 2 pips። EUR/USD ዝቅተኛ Spread ካለው Broker ብዙ ጊዜ 0-2 pip ነው።' },
            { q:'15. USD ያልሆኑ pairs ላይ 1 pip ስንት ነው?', opts:['0.01','0.0001','1.0000','0.1'], correct:1, explain:'EUR/USD ፣ GBP/USD... ለ1 pip = 0.0001። ልዩ ሁኔታ፦ JPY pairs (USD/JPY፣ EUR/JPY) 1 pip = 0.01 ነው።' },
            { q:'16. Lot Size ምን ያሳያል?', opts:['ገበያ አቅጣጫ','ትሬዱ የBase Currency ክፍል — የፖዚሽን መጠን','ኢኮኖሚ ዕድገት','Spread ብቻ'], correct:1, explain:'Standard Lot = 100,000 units። Mini = 10,000። Micro = 1,000። Lot Size ይጨምር ሲጨምር Pip Value እና ሊኖር የሚችለው ትርፍ/ኪሳራ ይጨምራል።' },
            { q:'17. Leverage ምን ይፈቅዳል?', opts:['ትርፍ ዋስትና','ትንሽ ካፒታል ትልቅ ፖዚሽን ለማስቀመጥ','ምንም ኪሳራ የለም','Broker ፈቃድ ብቻ'], correct:1, explain:'Leverage = ትንሽ ካፒታል ትልቅ ፖዚሽን ለመቀመጥ ያስችላል። 1:100 ሲሆን 1,000$ Margin 100,000$ ፖዚሽን ሊቆጣጠር ይችላል — ትርፍም ኪሳራም ያበዛል።' },
            { q:'18. Margin ምንድን ነው?', opts:['ዕለት ትርፍ','ቦታ ለመክፈት Broker ጋር የሚቀመጥ ዋስትና ገንዘብ','Spread ዋጋ','ባንክ ወለድ'], correct:1, explain:'Margin = ፖዚሽን ለመያዝ ጥቅም ላይ ሚውለው ዋስትና ነው። Free Margin ሲቀንስ Margin Call ሊሆን ይችላል — ፖዚሽን ሊዘጋ ይችላል።' },
            { q:'19. 1:100 Leverage ቀላሉ ምሳሌ?', opts:['100$ ትርፍ ዋስትና','ለ100,000$ ፖዚሽን ~1,000$ Margin ሊያስፈልግ ይችላል','100 ነፃ ትሬዶች','ኪሳራ የለም'], correct:1, explain:'ትክክለኛው Margin = Lot Size ÷ Leverage = 100,000 ÷ 100 = 1,000$። Instrument፣ ምንዛሬ፣ Broker ደንብ ይቀይሩታል። Leverage ስጋት ያሳድጋል!!' },
            { q:'20. Spot Forex Market ምን ማለት ነው?', opts:['ምንዛሬዎች አሁን ባለው ዋጋ T+2 ቀናት ይወጣሉ','ከ10 ዓመት በኋላ ብቻ','አክሲዮን ገበያ','Crypto ብቻ'], correct:0, explain:'Spot Market = ምንዛሬዎች "ወዲያው" (ብዙ ጊዜ T+1 ወይም T+2 Settlement) ሲካሄዱ። Retail Forex Trading አብዛኛው Spot ነው።' },
            // ── ምዕራፍ 3 — Orders ──
            { q:'21. Market Order ምንድን ነው?', opts:['ወደፊት ዋጋ ብቻ','ወቅቱ ምርጥ ዋጋ ወዲያው ለመፈጸም','ትሬድ ሰርዣ','SL ዓይነት'], correct:1, explain:'Market Order = አሁን ባለው ዋጋ ወዲያው ይፈጸማል። Slippage ሊኖር ይችላል — በተለይ ዜና ሰዓት ወይም ዝቅተኛ Liquidity ወቅት።' },
            { q:'22. Buy Limit Order ለምን ይጠቅማል?', opts:['ዋጋ ወደ ላይ ሲወጣ','ዋጋ ወደ ዝቅ ደረጃ ሲወርድ ለMy Buy ለማዘዝ','ትሬድ ለመዝጋት','Spread ለማጥፋት'], correct:1, explain:'Buy Limit = ዋጋ ወደ ታች ወርዶ ለወሰንከው ደረጃ ሲደርስ Buy ትዕዛዝ ይፈጸማል። ዋጋ ከደረሰ ወዲያ ሂዶ ሊመለስ ይችላል — ዋስትና የለም።' },
            { q:'23. Buy Stop Order ለምን ይጠቅማል?', opts:['ዋጋ ከወሰንከው ላይኛ ደረጃ ሲሰብር ለMy Buy','ዋጋ ሲወርድ ብቻ','ዜና ለማንበብ','ካፒታል ለማሳደግ'], correct:0, explain:'Buy Stop = ዋጋ ከወሰንከው ደረጃ ወደ ላይ ሲሰብር Buy ይፈጸማል። Breakout ትሬደሮች ብዙ ጊዜ ይጠቀሙበታል — Fake Breakout ሊኖር ይችላል።' },
            { q:'24. Stop Loss (SL) ዋናው ዓላማ ምንድን ነው?', opts:['ትርፍ ማሳደግ','ዋጋ ተቃራኒ ሲሄድ ትሬዱ ዘግቶ ኪሳራ ለመገደብ','Spread ማጥፋት','Leverage ማሳደግ'], correct:1, explain:'SL = ዋጋ ወደ ተቃራኒ አቅጣጫ ሲሄድ ትሬዱ ራሱ ዘግቶ ኪሳራ ይገድባል። Slippage ሊኖር ይችላል — SL ያለ ትሬዲንግ ካፒታልን ሙሉ ሊያጠፋ ይችላል።' },
            { q:'25. Take Profit (TP) ምን ያደርጋል?', opts:['ቦታ ያሳድጋል','ዋጋ ዓላማ ደረጃ ሲደርስ ትሬዱ ዘግቶ ትርፍ ያሸልፋል','SL ይቀይራል','ካፒታል ያበዛል'], correct:1, explain:'TP = ዓላማ ዋጋ ደረጃ ሲደርስ ትሬዱ ዘግቶ ትርፍ ያሸልፋል። TP ሳይደርስ ዋጋ ሊመለስ ይችላል — Trailing Stop ሌላ አማራጭ ነው።' },
            { q:'26. Liquidity ምን ያሳያል?', opts:['Internet ፍጥነት','ንብረትን ሳይበዛ ዋጋ ነካ ቀላሉ መሸጥ/መግዛት','ወለድ ብቻ','መዝጊያ ሰዓት'], correct:1, explain:'ከፍተኛ Liquidity = Spread ዝቅ፣ Slippage ቀነሰ፣ ትሬዶች ቀላሉ ይፈጸማሉ። EUR/USD ከፍተኛ Liquidity ካለቸው pairs አንዱ ነው።' },
            { q:'27. Volatility ምን ያሳያል?', opts:['ዋጋ ሚለዋወጥበት ፍጥነት/መጠን','Broker ስም','Account Password','ምንዛሬ ምልክት'], correct:0, explain:'ከፍተኛ Volatility = ዋጋ ፈጠን ብሎ ይቀያየራል — Risk እና Opportunity ሁለቱም ይጨምራሉ። ዜና ሰዓት (NFP፣ CPI...) Volatility ሊጨምር ይችላል።' },
            { q:'28. London + New York Session overlap ምን ሊያስከትል ይችላል?', opts:['ገበያ ሙሉ ይዘጋል','Liquidity እና እንቅስቃሴ ሊጨምር ይችላል','ሁሉም ዋጋ ሊቀናጁ','Spread ዜሮ'], correct:1, explain:'Overlap (13:00-17:00 UTC) ሁለቱ ዋና Sessions ሲደራረቡ EUR/USD ፣ GBP/USD... ላይ ከፍተኛ Volume እና Volatility ሊኖር ይችላል — Risk/Opportunity ሁለቱም።' },
            { q:'29. Risk Management ለምን ወሳኝ ነው?', opts:['ኪሳራ ሙሉ ለማጥፋት','ካፒታልን ጠብቆ ረዘም ጊዜ ለቀጠል','ዋጋ ለመቆጣጠር','ብዙ ትሬዶች ለመክፈት'], correct:1, explain:'Risk Management = ትሬዲንግ ዋናው ምሰሶ ነው። ካፒታልህ ቀጠለ ትሬዲንግ ትቀጥላለህ — ካጠፋህ Game Over ነው። ሁሉ ትሬዶች ትርፋማ አይደሉም።' },
            { q:'30. Risk:Reward 1:2 ምን ማለት ነው?', opts:['2 ትሬዶች ያሸነፋሉ','1 ኪሳራ ሲሆን ዓላማ 2 ትርፍ','ትርፍ ዋስትና','2 Account ያስፈልጋል'], correct:1, explain:'R:R 1:2 = 100$ ኪሳራ ሲሆን 200$ ታለማለህ። 10 ትሬዶች ቢኖሩ 5 ብቻ ቢያሸንፉ ትርፍ ሊኖር ይችላል — ሂሳብ ትሬዲንግ ዋና ክፍል ነው።' },
            // ── ምዕራፍ 4 — Psychology & Risk ──
            { q:'31. FOMO ምን ያሳያል?', opts:['Liquidity ዓይነት','ትርፍ ያመልጠኛል ብሎ ያለ Plan ትሬድ ምቦ መዝለቅ','Session ስም','Chart ዓይነት'], correct:1, explain:'FOMO = Fear Of Missing Out — ስሜት ሲቆጣጠር Rule ሳይጠቀሙ ትሬድ ይከፈታል። ብዙ ጊዜ ዋጋ አስቀድሞ ሄዷልና ኪሳራ ያስከትላል።' },
            { q:'32. Revenge Trading ምንድን ነው?', opts:['Hedge ስትራቴጂ','ኪሳራ ከደረሰ ቁጣ ኪሳራ ለመመለስ ያዘጋጀ ትሬዶች','Technical Analysis','SMC'], correct:1, explain:'Revenge Trading = ኪሳራ ካጠቃ ቁጣ ሌሎች ትሬዶች ሲከፈቱ። ሥነ-ልቦና ሲቆጣጠር Plan ይጠፋል — ሁለተኛ ኪሳራ ሊሳካ ይችላል።' },
            { q:'33. Trading Journal ለምን ያስፈልጋል?', opts:['ዋጋ ለመቆጣጠር','ትሬዶች ስህተቶቻቸውን ፈልጎ ስትራቴጂ ለማሻሻል','ኪሳራ ሊመልስ','Broker Commission ለማጥፋት'], correct:1, explain:'Journal = ትሬዶችህን፣ Entry/Exit Reason፣ ስሜትህን ጽፈህ ስህተቶቹን ለምን ተደጋጋሙ ለማወቅ ዋናው መሳሪያ ነው — ፕሮፌሽናሎች ሁሉ ይጠቀሙበታል።' },
            { q:'34. Drawdown ምን ያሳያል?', opts:['ካፒታል ከፍ ደረጃ ሲቀነስ — ሪስክ መለኪያ','Session ሰዓት','Spread','ትሬድ ብዛት'], correct:0, explain:'Drawdown = ካፒታልህ ከቀድሞ Peak ምን ያህል ወርዷል። ለምሳሌ 10,000$ ካፒታል 8,000$ ሲሆን 20% Drawdown ነው — ትልቅ Drawdown Recovery ይቸግራል።' },
            { q:'35. Position Sizing ምን ያደርጋል?', opts:['Session ሰዓት','ካፒታልህ ፣ SL ርቀትና ሪስክ % ተዳምረው Lot Size ይወስናሉ','Broker ስም','ዜና ትርጉም'], correct:1, explain:'Position Sizing = ዋናው Risk Tool ነው። ለምሳሌ 1% Rule = 10,000$ Account ሲሆን ትሬድ ሀ 100$ ብቻ አደጋ ላይ ያቀምጣሉ — Account ሙሉ ሊጠፋ አይችልም።' },
            // ── ምዕራፍ 5 — Technical Analysis ──
            { q:'36. Technical Analysis ምን ያለፈ?', opts:['Chart/ዋጋ ውሂብ ተጠቅሞ ገበያ ለመተንተን','አገር ሕግ ብቻ','ወለድ ብቻ','Account ማየት'], correct:0, explain:'Technical Analysis = ያለፈ ዋጋ ቅጦች (Trend፣ S/R፣ Patterns) ወደፊቱን ሊጠቁሙ ይችላሉ ብሎ ቻርት ላይ ይተናተናል — ዋስትና አይሰጥም።' },
            { q:'37. Candlestick Chart ምን ያሳያል?', opts:['Open, High, Low, Close (OHLC) ዋጋዎች','አገር ስም','Broker ስም','ትሬደር ዕድሜ'], correct:0, explain:'OHLC = Candlestick ሲከፈት (Open)፣ ከፍ ደረሰ (High)፣ ዝቅ ወረደ (Low)፣ ዘጋ (Close) ዋጋ ሁሉ ያሳያል — 4 ቁምፊ መረጃ።' },
            { q:'38. Uptrend ምን ቅጥ ይሠራል?', opts:['Lower Highs + Lower Lows','Higher Highs + Higher Lows','ዋጋ ተረጋጋ','ሁሉም ሻማ ዝቅ'], correct:1, explain:'Uptrend = Higher High (HH) + Higher Low (HL) ቅጦች። ዋጋ ከፍ ሲሄድ Pullback ቢኖር ቀዳሚውን Low ሳያልፍ ተመልሶ ከፍ ሄደ ማለት ነው።' },
            { q:'39. Support Level ምን ያሳያል?', opts:['Buyer ሊጠናከሩ የሚችሉ የዋጋ ዞን','ዋጋ ሁልጊዜ ሚቆምበት ዋስትና','Broker Service','Account Balance'], correct:0, explain:'Support = ዋጋ ወደ ዚያ ዞን ሲቀርብ Buyer ሊጨምሩ ይችላሉ — ዋጋ ሊሰበርም ይችላል። ዞን አድርጎ ማየት ከነጥብ ይሻላል።' },
            { q:'40. Resistance Level ምን ያሳያል?', opts:['Seller ሊጠናከሩ የሚችሉ የዋጋ ዞን','ዋጋ ሁልጊዜ ሚወርድበት ዋስትና','SL ሌላ ስም','Leverage'], correct:0, explain:'Resistance = ዋጋ ወደ ዚያ ዞን ሲቀርብ Seller ሊጨምሩ ይችላሉ — Breakout ሊሰነዝሩትም ይችላሉ። Role Reversal ሊኖር ይችላል።' },
            { q:'41. Moving Average (MA) ምን ያደርጋል?', opts:['ዋጋ አለስልሶ Trend አቅጣጫ ያሳያል','Broker ፈቃድ','Lot ይወስናል','Spread ያጥፋል'], correct:0, explain:'MA = ያለፈ ዋጋዎች ተደምሮ Average — ዋጋ ሸካሪ ለስ ያደርጋል። 50 MA > 200 MA = "Golden Cross" — Uptrend ሊያሳይ ይችላል።' },
            { q:'42. RSI > 70 ምን ሊያስጠቁም ይችላል?', opts:['Overbought — ዋጋ ሊወርድ ሊችል','Oversold','Account ሙሉ','Breakout ዋስትና'], correct:0, explain:'RSI > 70 = Overbought ሊሆን ይጠቁማል — ዋጋ ሊወርድ ሊችል። ግን Market Structure ጋር ማጣመር ያስፈልጋል — RSI Overbought ሁሉ ሚሸጥ ምልክት አይደለም።' },
            { q:'43. Downtrend ምን ቅጥ ይሠራል?', opts:['Higher Highs + Higher Lows','Lower Highs + Lower Lows','Range Market','Flat Trend'], correct:1, explain:'Downtrend = Lower High (LH) + Lower Low (LL)። ዋጋ Bounce ቢያደርግ ቀዳሚውን High ሳያልፍ ተመልሶ ዝቅ ሄደ ማለት ነው።' },
            { q:'44. Timeframe ምን ያሳያል?', opts:['ትሬደር ዕድሜ','ሻማ ሲወክለው የጊዜ ርዝመት','Spread','Leverage'], correct:1, explain:'Timeframe = M1 (1 ደቂቃ)፣ M5፣ M15፣ H1፣ H4፣ D1፣ W1... Higher TF = ትልቅ Trend፤ Lower TF = Entry ዝርዝር ለማወቅ ያጠቅሙ ይችላሉ።' },
            { q:'45. Market Structure Shift (MSS) ምን ሊያስጠቁም ይችላል?', opts:['ዋጋ ወደ ላይ ዋስትና','ቀደም ያለ Trend ሊቀየር ወይም ይቀጥላል','Broker ሊቀይር','ሁሉም ትርፍ'], correct:1, explain:'MSS = ቀደም ያለ Swing ሲሰበር — Trend ሊቀያየር ሊጠቁም ይችላል። ብቻውን ዋስትና አይሰጥም — Higher TF Bias + Confirmation ያስፈልጋሉ።' },
            // ── ምዕራፍ 6 — SMC / Liquidity ──
            { q:'46. Buy-Side Liquidity ብዙ ጊዜ የት ይሰበሰባል?', opts:['ከSwing Highs/Equal Highs በላይ','ከLows በታች','Account ውስጥ','Candle መካከል'], correct:0, explain:'BSL = ከSwing Highs/Equal Highs በላይ Buy Stop + SL Orders ሊሰበሰቡ ይችላሉ — ዋጋ ሊሄዳቸው ይችላል።' },
            { q:'47. Sell-Side Liquidity ብዙ ጊዜ የት ይሰበሰባል?', opts:['ከHighs በላይ','ከEqual Lows/Swing Lows በታች','Candle Open ብቻ','Resistance ወደ ላይ'], correct:1, explain:'SSL = ከSwing Lows/Equal Lows በታች Sell Stop + Long Position SL ሊሰበሰቡ ይችላሉ — ዋጋ ሊሄዳቸው ይችላል።' },
            { q:'48. Liquidity Sweep ምን ማለት ነው?', opts:['Account ማጽዳት','ዋጋ High/Low ሰብሮ Orders ወሰዶ ሲመለስ','ሁሉም ትሬዶች ሲዘጉ','Candle ቀለም ብቻ'], correct:1, explain:'Liquidity Sweep = ዋጋ ደረጃ ሰብሮ SL/Stop Orders ካነቃ ሲመለስ — የMarket Structure Shift + Confirmation ያስፈልጋሉ።' },
            { q:'49. Order Block (OB) SMC ውስጥ ምን ነው?', opts:['ሁሉም Candle','ጠንካራ Move ከመጀመሩ በፊት ያለ ዞን (Demand/Supply)','Account','Broker ሁኔታ'], correct:1, explain:'OB = ጠንካራ ወደ ላይ/ታች Move ከመጀመሩ በፊት ያለ ዞን። Retail ትሬደሮች Re-test ሲጠብቁ Entry ሊፈልጉ ይችላሉ — ዋስትና አይሰጥም።' },
            { q:'50. Live Trading ከመጀመርህ ምን ቅድሚያ ያስፈልጋሉ?', opts:['ያለ Plan ብቀጥ','Social Signal ብቻ ተከተል','መሠረት ተማር + Demo ለምምድ + Risk ደንብ አዘጋጅ + Plan ያዝ','ትልቅ Leverage ጠቀም'], correct:2, explain:'ትምህርት + ልምምድ + ዲሲፕሊን + Risk Management + Trading Plan = ጠንካራ መሠረት ነው። ትርፍ ዋስትና የለም — ሂደቱ ጊዜ ይወስዳል።' }
        ],
        crypto: [
            { q:'1. Cryptocurrency ምን ማለት ነው?', opts:['ባንክ ሌላ ስም','Cryptography ላይ የተመሠረተ ዲጂታል/Virtual ምንዛሬ','Forex ዓይነት','አክሲዮን ብቻ'], correct:1, explain:'Cryptocurrency = Cryptography ኃይለኛ ቁጥጥር ላይ የሚሰራ ዲሴንትራላይዝድ ዲጂታል ምንዛሬ ነው። Blockchain ቴክኖሎጂ መሠረቱ ነው።' },
            { q:'2. Blockchain ምን ያደርጋል?', opts:['ዲሴንትራላይዝድ ዲጂታል Ledger — ሁሉም ትራንዛክሽን ይቀዳል','ባንክ ዓይነት','Crypto Exchange','Trading Strategy'], correct:0, explain:'Blockchain = ሁሉም ትራንዛክሽን Blocks ውስጥ ሲቀዱ Chain አድርጎ ያስቀምጣቸዋል — ሌሎች ማሻሻያ ከባድ ያደርጋቸዋል። Bitcoin፣ Ethereum... ሁሉ Blockchain ናቸው።' },
            { q:'3. Bitcoin ምን ዓይነት ምንዛሬ ነው?', opts:['Stable Coin','Altcoin','ፊርስቲ Decentralized Cryptocurrency','Fiat'], correct:2, explain:'BTC = Satoshi Nakamoto 2009 ያስተዋወቀው — ታሪካዊ ፊርስቲ Decentralized ዲጂታል ምንዛሬ ነው። Fixed Supply = 21 ሚሊዮን BTC ብቻ።' },
            { q:'4. Altcoin ምን ማለት ነው?', opts:['Bitcoin ብቻ','Bitcoin ካልሆነ ሌሎች Crypto ሁሉ','Stable Coin','Fiat'], correct:1, explain:'Altcoin = "Alternative coin" — Bitcoin ካልሆኑ Ethereum፣ BNB፣ Solana፣ XRP... ሁሉ Altcoin ናቸው። Risk Bitcoin ን ሊያንፀባርቅ ይችላል።' },
            { q:'5. Stable Coin ምን ያደርጋሉ?', opts:['ዋጋ ሁልጊዜ ይጨምራሉ','Fiat ጋር ዋጋ ለማረጋጋጥ ሙከራ ይደርጋሉ','Blockchain የሌላቸው','Mining ይፈልጋሉ'], correct:1, explain:'USDT፣ USDC... = 1 USD ጠጋ ለማቆየት ሙከራ ይደርጋሉ — De-peg ሊሆን ይችላል (LUNA/UST ምሳሌ)። ሁልጊዜ ደህና ዋስትና አይሰጡም።' },
            { q:'6. Spot Trading ምን ማለት ነው?', opts:['ዋጋ ወዲያው Asset ይቀበሉ/ይሸጣሉ','Futures ሌላ ስም','Demo ብቻ','Leverage ሁልጊዜ'], correct:0, explain:'Spot = Asset ወዲያው ፈጽሞ ባለቤት ትሆናለህ — ዋጋ ቢወርድ እቆምልሃለሁ። Futures ደግሞ Contract ነው — Asset አይሰጥህም።' },
            { q:'7. Futures Trading ምን ይፈቅዳል?', opts:['ወዲያው Asset','Leverage ተጠቅሞ Long/Short ለStake ያደርጋሉ','Demo ብቻ','HODL ብቻ'], correct:1, explain:'Futures = Contract ሲሆን Leverage ተጠቅሞ ዋጋ ወደ ላይ (Long) ወይም ታች (Short) ሲጠብቁ ትሬድ ይደርጋሉ — Liquidation ሊኖር ይችላል።' },
            { q:'8. HODL ምን ማለት ነው?', opts:['ቶሎ ሸጥ','ዋጋ ቢወርድ ሳትሸጥ ረዘም ጊዜ ይዝ','Day Trading','Hard Fork'], correct:1, explain:'HODL = "Hold On for Dear Life" — 2013 Bitcoin Forum Typo ተጀምሮ ቃል ሆነ። ዋጋ ቢወርድ ሳትሸጥ ረዘም ጊዜ የሚጠብቅ ስትራቴጂ — ዋስትና አይሰጥም።' },
            { q:'9. DeFi ምን ማለት ነው?', opts:['ማዕከላዊ ባንክ','Blockchain ላይ ያለ Decentralized Finance','Fiat Exchange','Stable Coin ብቻ'], correct:1, explain:'DeFi = Decentralized Finance። ባንክ ሳያስፈልግ Blockchain ላይ Lending፣ Borrowing፣ Yield Farming፣ DEX... ይሰራሉ። Smart Contract ላይ ይተማሰናሉ።' },
            { q:'10. NFT ምን ማለት ነው?', opts:['Normal Finance Token','Non-Fungible Token — ልዩ ዲጂታል Asset','Stable Coin','Altcoin'], correct:1, explain:'NFT = Non-Fungible Token — ሌላ NFT ጋር ሊቀያየር ያልቻለ ልዩ ዲጂታል Asset ነው። Art፣ Music፣ Game Items... ሁሉ NFT ሊሆኑ ይችላሉ።' },
            { q:'11. Market Cap ምን ያሳያል?', opts:['Coin ዋጋ ብቻ','Price × Circulating Supply','Broker Commission','SL ዋጋ'], correct:1, explain:'Market Cap = ዋጋ × Circulating Supply = Coin አጠቃላይ ዋጋ። BTC Market Cap > ETH — ትልቅ Market Cap ዋጋ ሊቀዛቀዝ ብዙ ሊፈልግ ይችላል።' },
            { q:'12. Whale Crypto ውስጥ ምን ማለት ነው?', opts:['ትንሽ ትሬደር','ትልቅ Crypto ሚሸዝ ያለው — ዋጋ ሊነካ','Stable Coin','Exchange'], correct:1, explain:'Whale = ትልቅ Crypto holdings ያለው አካል ነው። Whale ሲሸጥ/ሲገዛ ዋጋ ሊያንቀሳቀስ ይችላል — On-chain data ለWhalemovement ለማየት ይጠቅማሉ።' },
            { q:'13. Bull Run ምን ማለት ነው?', opts:['ዋጋ ወደ ታች','Crypto ዋጋዎች ሰፊ ወደ ላይ ሄዶ ጊዜ','Stable Coin','Bearish'], correct:1, explain:'Bull Run = Crypto ዋጋዎች ሰፊ ወደ ላይ ሄዶ ጊዜ — ብዙ ጊዜ Bitcoin Halving ካለፈ ዓመት ሊከሰት ይችላል። 2017፣ 2021 ምሳሌዎች ናቸው — ዋስትና አይሰጥም።' },
            { q:'14. Bitcoin Halving ምን ያደርጋል?', opts:['Supply ያሳድጋሉ','Mining Reward ~4 ዓመት አንዴ 50% ዝቅ ይሆናል','Blockchain ያፈርሳሉ','ዋጋ ዋስትና'], correct:1, explain:'Halving = ሁሉ ~210,000 Blocks (hhh4 ዓመት) Mining Reward ይቀንሳል። 2009=50 BTC → 2012=25 → 2016=12.5 → 2020=6.25 → 2024=3.125 BTC።' },
            { q:'15. P2P Trading ምን ማለት ነው?', opts:['Exchange ብቻ','ሰው ለሰው ቀጥታ Crypto/Fiat ልውውጥ','Futures','Stable Coin'], correct:1, explain:'P2P = Peer-to-Peer። Binance P2P ፣ LocalBitcoins... ሰው ለሰው ቀጥታ Crypto/ETB ይለዋወጣሉ። Escrow ሊጠቅም ይችላል — Scam ሊኖር ይችላል ጥንቃቄ ያስፈልጋል።' },
            { q:'16. Private Key ምን ያደርጋል?', opts:['Password ብቻ','Wallet ሙሉ ስልጣን — ጠፍቶ Asset ሊጠፋ','Broker ፈቃድ','API Key ብቻ'], correct:1, explain:'Private Key = Wallet ፊርማ ቁልፍ — ያለው ሰው ሁሉ Asset ሊወስድ ይችላል። "Not your keys, not your coins" — ደህና ቦታ ጻፍ፣ Online አታስቀምጥ።' },
            { q:'17. Gas Fee ምን ማለት ነው?', opts:['Broker Commission','Blockchain ትራንዛክሽን ለNetwork ሚከፍለው ክፍያ','Spread','SL ዋጋ'], correct:1, explain:'Gas Fee = Ethereum + ሌሎች CtO Blockchain Networks ትራንዛክሽን ፈጽሞ Miners/Validators ለማበረታቻ ሚከፍሉ ክፍያ ነው። Congestion ሲኖር ይጨምራሉ።' },
            { q:'18. Long Position Crypto ምን ማለት ነው?', opts:['Sell ብቻ','ዋጋ ወደ ላይ ሲጠብቁ Buy','SL','HODL ብቻ'], correct:1, explain:'Long = ዋጋ ወደ ላይ ሲጠብቁ Asset ትገዛለህ — ዋጋ ሲጨምር ሸጠህ ትርፍ ትሰበስባለህ። Spot ወይም Futures (Leverage) ሁለቱም ሊሆኑ ይችላሉ።' },
            { q:'19. Short Position Crypto ምን ማለት ነው?', opts:['Buy','ዋጋ ወደ ታች ሲጠብቁ Sell — ዝቅ ሲል ገዝቶ ትርፍ','HODL','Stable Coin'], correct:1, explain:'Short = Futures/Margin ላይ — ዋጋ ወደ ታች ሲጠብቁ Sell ። ዋጋ ዝቅ ሲል ገዝቶ ትርፍ ትሰበስባለህ — Liquidation ሊኖር ይችላል።' },
            { q:'20. Crypto ትሬዲንግ ዋና Risk ምንድን ነው?', opts:['ዋጋ ሁልጊዜ ይጨምራሉ','ፈጣን Volatility + Liquidation + Regulation + Hacking Risk','Demo ብቻ','Stable Coin አለ'], correct:1, explain:'Crypto ፈጣን Volatility ካለው Risk ጋር ይመጣል — 90% drop ሊኖር ይችላል (LUNA 2022)። Risk Management + Diversification + Security ወሳኝ ናቸው።' },
            { q:'21. DCA ምን ማለት ነው?', opts:['አንዴ ብቻ ትልቅ ኢንቨስትመንት','ወቅታዊ ትንሽ ግዢ ዋጋ Average ዝቅ ለማድረግ','Futures ብቻ','SL ዘዴ'], correct:1, explain:'Dollar Cost Averaging = ዋጋ ቀንሶ ወይም ጨምሮ ወቅታዊ fixed amount ትገዛለህ — ዋጋ Average ሊዝቅ ይችላል። ዋስትና አይሰጥም።' },
            { q:'22. Smart Contract ምን ያደርጋሉ?', opts:['ዋጋ ሁልጊዜ ያቆሙ','ሁኔታ ሲሟላ ራሱ ሚሰሩ Code (Ethereum...)','Whale ብቻ','SL'], correct:1, explain:'Smart Contract = Ethereum ና ሌሎች Blockchain ላይ ሁኔታ ሲሟላ ራሱ ሚፈጸም Code ነው — DeFi፣ NFT፣ DAOs... ሁሉ Smart Contract ላይ ይተማሰናሉ።' },
            { q:'23. Liquidation Futures ምን ማለት ነው?', opts:['ትርፍ ሰጠ','Margin ሲጠናቀቅ Position ሲዘጋ ኪሳራ','Account ሲከፈት','Spot ብቻ'], correct:1, explain:'Liquidation = Futures/Margin ላይ ዋጋ ተቃራኒ ሲሄድ Margin ሲጠናቀቅ Exchange Position ዘግቶ ኪሳራ ይወሰናል — ትልቅ Leverage ሊጨምረው ይችላል።' },
            { q:'24. Binance ምን ዓይነት ነው?', opts:['Wallet ብቻ','Centralized Crypto Exchange — Spot/Futures/P2P','DeFi ብቻ','Blockchain ፈጣሪ'], correct:1, explain:'Binance = ዓለም ከትልቁ CEX (Centralized Exchange) አንዱ — Spot፣ Futures፣ Margin፣ P2P፣ Staking አገልግሎቶች ያቀርባሉ። KYC ሊጠይቅ ይችላሉ።' },
            { q:'25. Copy Trading ምን ያደርጋሉ?', opts:['ሁሉም ትርፍ ዋስትና','ሌላ ትሬደር ትሬዶቹን ፈቃዱ ሲሰጥ ቀጥሎ ማደናቀፍ','Spot ብቻ','Demo ብቻ'], correct:1, explain:'Copy Trading = Expert ትሬዶቹን ትቀዳለህ — ኪሳራቸውም ይቀዳል። Risk ሙሉ አይቀነስም — ትሬደሩ ስትራቴጂ ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ማወቅ ጠቅሙ ያለ።' },
            { q:'26. RSI Crypto ትሬዲንግ ምን ሊያስጠቁም ይችላሉ?', opts:['ዋጋ ዋስትና','ዋጋ Overbought (>70) ወይም Oversold (<30) ሁኔታ ሊጠቁምን','Session ጠፋ','Spread ጨምሯሉ'], correct:1, explain:'RSI = ዋጋ Overbought (>70) ወይም Oversold (<30) ሁኔታ ሊጠቁምን — Market Structure + Volume + Trend ጋር ማጣመር ያስፈልጋሉ። ብቻው ዋስትና አይሰጥምን።' },
            { q:'27. Bear Market Crypto ምን ማለት ነው?', opts:['ዋጋ ወደ ላይ','Crypto ዋጋዎች ሰፊ ወደ ታች ሂደዋሉ ጊዜ','Stable Coin','NFT'], correct:1, explain:'Bear Market = ዋጋዎች ሰፊ ወደ ታች ሂደዋሉ ጊዜ — Crypto ዘወትር ጠንካራ Bear ይኖረዋሉ (80-90% drop ሊሆን ይችላሉ)። Long-term ስትራቴጂ ወሳኝ ናቸው።' },
            { q:'28. Crypto Arbitrage ምን ማለት ነው?', opts:['Single Exchange ብቻ','Exchange ዋጋ ልዩነት ተጠቅሞ ትርፍ ለማሳካት','HODL','NFT'], correct:1, explain:'Arbitrage = Exchange A ዋጋ < Exchange B ዋጋ ሲሆን A ላይ ገዝቶ B ላይ ሸጦ ልዩነት ትርፍ ለማሳካት። ፈጣን ስለሆነ Algorithm ብዙ ጊዜ ይቀድማሉ።' },
            { q:'29. Ethereum vs Bitcoin ዋና ልዩነት?', opts:['ETH ከBTC ፈጣን ሁልጊዜ','BTC ምንዛሬ ሲሆን ETH Smart Contract Platform ናቸው','ሁለቱ ተመሳሳይ ናቸው','BTC ብቻ Real'], correct:1, explain:'BTC = ዲጂታል ምንዛሬ/Store of Value። ETH = Smart Contract Platform + ምንዛሬ — DeFi፣ NFT፣ DAOs... Ethereum ላይ ናቸው። ሁለቱ ዓላማቸው ይለያያሉ።' },
            { q:'30. Crypto Risk Management ዋናው ነጥብ ምንድን ነው?', opts:['ሁልጊዜ ሁሉ ይጥቀሙ','ካፒታልህ ትንሽ ብቻ አደጋ ላይ ያቅሙ + SL ያዝ + Diversify','Signal ብቻ','Leverage ሁልጊዜ'], correct:1, explain:'Crypto ከፍተኛ Risk ዓለም ነው — ካፒታልህ ትንሽ ብቻ አደጋ ላይ (1-2% per Trade)፣ SL ያዝ፣ ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን ለምን Diversify አድርጉ።' }
        ]
    };

    // ── STATE ──────────────────────────────────────────────────
    var questions  = [];
    var currentQ   = 0;
    var score      = 0;
    var wrongCount = 0;
    var quizActive = false;

    function $id(id){ return document.getElementById(id); }

    function scrollChat(){
        var c = $id('quizChat');
        if(c) c.scrollTop = c.scrollHeight;
    }

    // Update header counter + progress bar
    function updateCounter(){
        var total = questions.length;
        var pct   = total ? Math.round((currentQ / total) * 100) : 0;
        var bar   = $id('quizProgressBar');
        var co    = $id('qscCorrect');
        var wr    = $id('qscWrong');
        var tot   = $id('qscTotal');
        if(bar) bar.style.width = pct + '%';
        if(co)  co.textContent  = '✅ ' + score;
        if(wr)  wr.textContent  = '❌ ' + wrongCount;
        if(tot) tot.textContent = currentQ + '/' + total;
    }

    // Bot typing → message
    function botMsg(html, cssClass, delay){
        cssClass = cssClass || '';
        delay    = delay    || 0;
        return new Promise(function(res){
            setTimeout(function(){
                var chat = $id('quizChat');
                if(!chat){ res(); return; }
                var typing = document.createElement('div');
                typing.className = 'quiz-msg-bot quiz-typing';
                typing.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
                chat.appendChild(typing);
                scrollChat();
                setTimeout(function(){
                    chat.removeChild(typing);
                    var msg = document.createElement('div');
                    msg.className = 'quiz-msg-bot';
                    msg.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="quiz-bubble-bot ' + cssClass + '">' + html + '</div>';
                    chat.appendChild(msg);
                    scrollChat();
                    res();
                }, 650);
            }, delay);
        });
    }

    function userMsg(html){
        var chat = $id('quizChat');
        if(!chat) return;
        var m = document.createElement('div');
        m.className = 'quiz-msg-user';
        m.innerHTML = '<div class="quiz-bubble-user">' + html + '</div>';
        chat.appendChild(m);
        scrollChat();
    }

    function clearOpts(){ var o=$id('quizOptions'); if(o) o.innerHTML=''; }

    // ── LAUNCH ─────────────────────────────────────────────────
    window.launchQuiz = function(){
        var landing = $id('quizLanding');
        var box     = $id('quizBox');
        if(landing) landing.style.display = 'none';
        if(box){ box.style.display = 'block'; }
        $id('quizChat').innerHTML = '';
        clearOpts();
        score=0; wrongCount=0; currentQ=0; passwordPassed=false;
        updateCounter();
        startIntro();
    };

    function startIntro(){
        botMsg('ሰላም! 👋 እኔ የታግ ብሪጅ ረዳት AI ቦት ነኝ።').then(function(){
            return botMsg('የወሰዱትን የፎሬክስ እና ክሪፕቶ ትሬዲንግ መጽሃፍ በደንብ አንብበው፣ በDemo Account ተለማምደው እንዳጠናቀቁ ተስፋ እናደርጋለን! 📚', '', 200);
        }).then(function(){
            return botMsg('ፈተናውን ለመቀጠል — <strong>የፎሬክስ ትሬዲንግ ወይንም የክሪፕቶ ትሬዲንግ ይምረጡ፦</strong>', '', 300);
        }).then(function(){
            showTopicChoice();
        });
    }

    // ── TOPIC CHOICE ───────────────────────────────────────────
    function showTopicChoice(){
        var opts = $id('quizOptions');
        if(!opts) return;
        opts.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'quiz-topic-wrap';
        wrap.innerHTML =
            '<button class="quiz-topic-btn t-forex" onclick="pickTopic(\'forex\')">' +
              '<span class="t-icon">💱</span><span>ፎሬክስ ትሬዲንግ</span>' +
            '</button>' +
            '<button class="quiz-topic-btn t-crypto" onclick="pickTopic(\'crypto\')">' +
              '<span class="t-icon">₿</span><span>ክሪፕቶ ትሬዲንግ</span>' +
            '</button>' +
            '<button class="quiz-topic-btn t-both" onclick="pickTopic(\'both\')">' +
              '<span class="t-icon">🚀</span><span>ሁለቱም</span>' +
            '</button>';
        opts.appendChild(wrap);
    }

    window.pickTopic = function(t){
        clearOpts();
        var label = t==='forex' ? 'ፎሬክስ ትሬዲንግ 💱' : t==='crypto' ? 'ክሪፕቶ ትሬዲንግ ₿' : 'ሁለቱም 🚀';
        userMsg(label);
        // Build ordered question list — no shuffle
        if(t === 'both'){
            questions = allQ.forex.concat(allQ.crypto);
        } else {
            questions = allQ[t].slice();
        }
        score=0; wrongCount=0; currentQ=0; quizActive=true; passwordPassed=false;
        // crypto — password gate from very first question
        GATE_AFTER_Q = (t === 'crypto' || t === 'both') ? 0 : 10;
        updateCounter();
        var total = questions.length;
        var msg;
        if (t === 'forex') {
            msg = '✅ <strong>የፎሬክስ ትሬዲንግ ፈተና መርጠዋል!</strong><br><br>' +
                  'ጥያቄዎቹ በአጠቃላይ <strong>' + total + '</strong> ሲሆኑ በአራት ምዕራፍ የተዘጋጁ ናቸው፦<br><br>' +
                  '<strong>ደረጃ 1 — ጀማሪ (1–50)</strong><br>' +
                  '<small>Forex Foundations, Currency Pairs, Brokers, Trading Basics</small><br><br>' +
                  '<strong>ደረጃ 2 — መካከለኛ (51–100)</strong><br>' +
                  '<small>Technical Analysis, Candlesticks, Market Structure</small><br><br>' +
                  '<strong>ደረጃ 3 — ከፍተኛ (101–150)</strong><br>' +
                  '<small>Fundamental Analysis, Strategies, Risk Management</small><br><br>' +
                  '<strong>ደረጃ 4 — ፕሮፌሽናል (151–200)</strong><br>' +
                  '<small>Trading Psychology, Advanced Analysis, የገበያ ውሳኔዎች</small><br><br>' +
                  'ፈተናውን ለመቀጠል ዝግጁ ነዎት? 💪';
        } else if (t === 'crypto') {
            msg = '✅ <strong>የክሪፕቶ ትሬዲንግ ፈተና መርጠዋል!</strong><br>' +
                  total + ' ጥያቄዎች — ጀምር 💪';
        } else {
            msg = '✅ ጥሩ! ' + total + ' ጥያቄዎች ፎሬክስ + ክሪፕቶ። ጀምር 💪';
        }
        botMsg(msg, '', 200).then(function(){ askQuestion(0); });
    };

    // ── ASK ────────────────────────────────────────────────────
    // ── PASSWORD GATE ──────────────────────────────────────────
    var QUIZ_PASSWORD   = 'ይህበታግ-ብሪጅየተዘጋጀመጽሃፍነው'.replace(/[\u200B-\u200D\uFEFF\u00A0]/g,'').replace(/\s+/g,'');
    var passwordPassed  = false;
    var GATE_AFTER_Q    = 10; // default for forex — crypto overrides to 0

    function showPasswordGate(onSuccess) {
        clearOpts();
        botMsg(
            '🔐 <strong>ለመቀጠል ፓስዎርድ ያስፈልጋሉ።</strong><br><br>' +
            'ከታግ ብሪጅ መጽሃፍ ሲወስዱ የተላከልዎትን ፓስዎርድ ያስገቡ።',
            '', 300
        ).then(function() {
            var opts = $id('quizOptions');
            opts.innerHTML = '';

            var wrap = document.createElement('div');
            wrap.className = 'quiz-pw-wrap';
            wrap.innerHTML =
                '<div class="quiz-pw-box">' +
                  '<div class="quiz-pw-icon">🔐</div>' +
                  '<p class="quiz-pw-label">ፓስዎርድ ያስገቡ</p>' +
                  '<input type="text" id="quizPwInput" class="quiz-pw-input" placeholder="ፓስዎርድ ይጻፉ..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">' +
                  '<div id="quizPwError" class="quiz-pw-error" style="display:none;">❌ ፓስዎርዱ ትክክል አይደለም። እንደገና ይሞክሩ።</div>' +
                  '<button class="quiz-pw-btn" onclick="submitQuizPassword()">ፈተናውን እንቀጥል →</button>' +
                '</div>';
            opts.appendChild(wrap);

            // store callback
            window._quizPwCallback = onSuccess;

            // allow Enter key
            setTimeout(function() {
                var inp = document.getElementById('quizPwInput');
                if (inp) inp.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') window.submitQuizPassword();
                });
            }, 100);
        });
    }

    window.submitQuizPassword = function() {
        var inp = document.getElementById('quizPwInput');
        var err = document.getElementById('quizPwError');
        if (!inp) return;
        var val = inp.value.trim().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').replace(/\s+/g,'');
        if (val === QUIZ_PASSWORD) {
            passwordPassed = true;
            clearOpts();
            userMsg('🔑 ••••••••••••');
            botMsg('✅ <strong>ፓስዎርዱ ትክክለኛ ነው!</strong> ፈተናውን እንቀጥል 💪', 'bubble-correct', 200).then(function() {
                if (window._quizPwCallback) window._quizPwCallback();
            });
        } else {
            if (err) { err.style.display = 'block'; }
            if (inp) { inp.value = ''; inp.focus(); inp.style.borderColor = '#ff5050'; }
            setTimeout(function() { if (inp) inp.style.borderColor = ''; }, 1500);
        }
    };

    function askQuestion(idx){
        // Password gate — ጥያቄ 10 ካለቀ Password ሳያስገቡ አያልፉም
        if (idx >= GATE_AFTER_Q && !passwordPassed) {
            showPasswordGate(function() { askQuestion(idx); });
            return;
        }
        if(idx >= questions.length){ showResult(); return; }
        updateCounter();
        var q = questions[idx];
        var qHtml =
            '<span style="font-size:0.72rem;opacity:0.5;">ጥያቄ ' + (idx+1) + ' / ' + questions.length + '</span><br>' +
            '<strong>' + q.q + '</strong>';
        botMsg(qHtml).then(function(){
            var container = $id('quizOptions');
            container.innerHTML = '';
            q.opts.forEach(function(opt, i){
                var btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerHTML = '<strong>' + ['A','B','C','D'][i] + '.</strong> ' + opt;
                btn.onclick = function(){
                    // disable all
                    container.querySelectorAll('.quiz-opt-btn').forEach(function(b){ b.disabled=true; });
                    var isOk = (i === q.correct);
                    btn.classList.add(isOk ? 'correct' : 'wrong');
                    if(!isOk) container.querySelectorAll('.quiz-opt-btn')[q.correct].classList.add('correct');
                    // user bubble
                    userMsg('<strong>' + ['A','B','C','D'][i] + '.</strong> ' + opt);
                    // update counters
                    if(isOk){ score++; } else { wrongCount++; }
                    currentQ = idx + 1;
                    updateCounter();
                    // feedback
                    var feedbackHtml, feedbackClass;
                    if(isOk){
                        feedbackHtml  = '✅ <strong>ጥያቄው በትክክል ተመልሷል!</strong><br><br>' + q.explain;
                        feedbackClass = 'bubble-correct';
                    } else {
                        feedbackHtml  = '❌ <strong>ጥያቄው በትክክል አልተመለሰም።</strong><br><br>' +
                                        '✔ ትክክለኛ መልስ፦ <strong>' + ['A','B','C','D'][q.correct] + '. ' + q.opts[q.correct] + '</strong><br><br>' +
                                        q.explain;
                        feedbackClass = 'bubble-wrong';
                    }
                    botMsg(feedbackHtml, feedbackClass, 300).then(function(){
                        clearOpts();
                        // Show "ቀጣዩ ጥያቄ →" button — user must tap to proceed
                        var opts = $id('quizOptions');
                        var nextWrap = document.createElement('div');
                        nextWrap.style.cssText = 'padding:8px 18px 16px; text-align:right;';
                        var nextBtn = document.createElement('button');
                        nextBtn.className = 'quiz-next-btn';
                        nextBtn.innerHTML = 'ቀጣዩ ጥያቄ <span style="font-size:1.1rem;">→</span>';
                        nextBtn.onclick = function(){
                            nextBtn.disabled = true;
                            clearOpts();
                            askQuestion(currentQ);
                        };
                        nextWrap.appendChild(nextBtn);
                        opts.appendChild(nextWrap);
                        // scroll to show button
                        var chat = $id('quizChat');
                        if(chat) chat.scrollTop = chat.scrollHeight;
                    });
                };
                container.appendChild(btn);
            });
        });
    }

    // ── RESULT ─────────────────────────────────────────────────
    function showResult(){
        clearOpts();
        var total = questions.length;
        var pct   = Math.round((score / total) * 100);
        // update bar to 100%
        var bar = $id('quizProgressBar');
        var co  = $id('qscCorrect');
        var wr  = $id('qscWrong');
        var tot = $id('qscTotal');
        if(bar) bar.style.width = '100%';
        if(co)  co.textContent  = '✅ ' + score;
        if(wr)  wr.textContent  = '❌ ' + wrongCount;
        if(tot) tot.textContent = total + '/' + total;

        var emoji, level, msg;
        if(pct >= 80){
            emoji='🏆'; level='Pro Trader!';
            msg = score + '/' + total + ' (' + pct + '%) — አስደናቂ ውጤት! ፕሮፌሽናል ደረጃ ነህ። ስትራቴጂህን ለማሻሻል Bundle መጽሃፍ ይጠቅምሃሉ።';
        } else if(pct >= 55){
            emoji='📈'; level='Intermediate Trader';
            msg = score + '/' + total + ' (' + pct + '%) — ጥሩ ጅምር! የተሳሳቱትን ጥያቄዎች ክለሳ አድርጉ። ፎሬክስ ወይም ክሪፕቶ መጽሃፍ ሙሉ ተሞክሮ ይሰጥሃሉ።';
        } else {
            emoji='🌱'; level='Beginner Trader';
            msg = score + '/' + total + ' (' + pct + '%) — አሳዝኖ አይሆን — ሁሉም ከዜሮ ጀምሮ ነው! መጽሃፍቱ ሙሉ ዕውቀቱን ከዜሮ ያስተምርሃሉ።';
        }

        var chat = $id('quizChat');
        var card = document.createElement('div');
        card.className = 'quiz-result';
        card.innerHTML =
            '<div class="quiz-result-emoji">' + emoji + '</div>' +
            '<div class="quiz-result-title">' + level + '</div>' +
            '<div class="quiz-result-bar-wrap"><div class="quiz-result-bar" id="qResBar" style="width:0%"></div></div>' +
            '<div class="quiz-result-score">' + msg + '</div>' +
            '<div class="quiz-result-btns">' +
              '<button class="quiz-cta-btn" onclick="document.getElementById(\'products\').scrollIntoView({behavior:\'smooth\'})">📚 መጽሃፍ ስዘዝ</button>' +
              '<button class="quiz-retry-btn" onclick="retryQuiz()">🔄 እንደገና ሞክር</button>' +
            '</div>';
        chat.appendChild(card);
        scrollChat();
        setTimeout(function(){
            var b = document.getElementById('qResBar');
            if(b) b.style.width = pct + '%';
        }, 300);
    }

    // ── RETRY ──────────────────────────────────────────────────
    window.retryQuiz = function(){
        quizActive=false; score=0; wrongCount=0; currentQ=0; questions=[];
        passwordPassed = false; // reset password gate on retry
        var landing = $id('quizLanding');
        var box     = $id('quizBox');
        var chat    = $id('quizChat');
        if(chat)    chat.innerHTML = '';
        clearOpts();
        if(box)     box.style.display     = 'none';
        if(landing) landing.style.display = 'flex';
        var bar=$id('quizProgressBar'), co=$id('qscCorrect'), wr=$id('qscWrong'), tot=$id('qscTotal');
        if(bar) bar.style.width='0%';
        if(co)  co.textContent='✅ 0';
        if(wr)  wr.textContent='❌ 0';
        if(tot) tot.textContent='0/0';
    };

    window.startQuiz = window.launchQuiz;

})();


// ===========================
// LIVE TRADINGVIEW CHART
// ===========================
(function initChart() {

    var currentSymbol = 'BINANCE:BTCUSDT';
    var chartLoaded   = false;
    var tvScript      = null;

    // Map tab symbol → TradingView symbol
    var symbolMap = {
        'BTCUSDT': 'BINANCE:BTCUSDT',
        'ETHUSDT': 'BINANCE:ETHUSDT',
        'BNBUSDT': 'BINANCE:BNBUSDT',
        'SOLUSDT': 'BINANCE:SOLUSDT',
        'EURUSD':  'FX:EURUSD',
        'XAUUSD':  'TVC:GOLD'
    };

    function buildWidget(tvSymbol) {
        var container = document.getElementById('tvChartContainer');
        if (!container) return;

        // Clear previous
        container.innerHTML = '';

        // Create new widget script
        var script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize:           true,
            symbol:             tvSymbol,
            interval:           '60',
            timezone:           'Africa/Addis_Ababa',
            theme:              'dark',
            style:              '1',
            locale:             'en',
            backgroundColor:    '#131722',
            gridColor:          'rgba(255,255,255,0.04)',
            hide_top_toolbar:   false,
            hide_legend:        false,
            save_image:         false,
            calendar:           false,
            support_host:       'https://www.tradingview.com',
            height:             420,
            withdateranges:     true,
            range:              '1D',
            allow_symbol_change: false,
            details:            true,
            hotlist:            false,
            news:               [],
            studies:            ['STD;MACD','STD;RSI']
        });

        // Wrapper div TradingView needs
        var wrap = document.createElement('div');
        wrap.className = 'tradingview-widget-container';
        wrap.style.height = '420px';
        wrap.style.width  = '100%';

        var inner = document.createElement('div');
        inner.className = 'tradingview-widget-container__widget';
        inner.style.height = '100%';
        inner.style.width  = '100%';

        wrap.appendChild(inner);
        wrap.appendChild(script);
        container.appendChild(wrap);
    }

    // Public: called by tab buttons
    window.switchChart = function(symbol, label, btn) {
        // Update active tab
        document.querySelectorAll('.chart-tab').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        // Update label
        var lbl = document.getElementById('chartPairLabel');
        if (lbl) lbl.textContent = label;

        var tvSym = symbolMap[symbol] || ('BINANCE:' + symbol);
        currentSymbol = tvSym;
        buildWidget(tvSym);
    };

    // Init on DOM ready — lazy load when section visible
    function init() {
        var section = document.querySelector('.live-chart-section');
        if (!section) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !chartLoaded) {
                    chartLoaded = true;
                    buildWidget(currentSymbol);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(section);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


// ===========================
// MARKET OVERVIEW TOGGLE
// ===========================
(function() {
    var widgetLoaded = false;

    function loadOverviewWidget() {
        if (widgetLoaded) return;
        widgetLoaded = true;
        var container = document.querySelector('#tvOverviewContainer .tradingview-widget-container__widget');
        if (!container) return;
        var s = document.createElement('script');
        s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        s.async = true;
        s.innerHTML = JSON.stringify({
            colorTheme: 'dark',
            dateRange:  '1D',
            showChart:  false,
            locale:     'en',
            width:      '100%',
            height:     '420',
            isTransparent: true,
            showSymbolLogo: true,
            showFloatingTooltip: true,
            plotLineColorGrowing:       '#38ef7d',
            plotLineColorFalling:       '#ff6060',
            gridLineColor:              'rgba(255,255,255,0.06)',
            scaleFontColor:             'rgba(255,255,255,0.4)',
            belowLineFillColorGrowing:  'rgba(56,239,125,0.08)',
            belowLineFillColorFalling:  'rgba(255,96,96,0.08)',
            symbolActiveColor:          'rgba(91,125,232,0.15)',
            tabs: [
                {
                    title: 'Crypto',
                    symbols: [
                        { s:'BINANCE:BTCUSDT', d:'Bitcoin'  },
                        { s:'BINANCE:ETHUSDT', d:'Ethereum' },
                        { s:'BINANCE:BNBUSDT', d:'BNB'      },
                        { s:'BINANCE:SOLUSDT', d:'Solana'   },
                        { s:'BINANCE:XRPUSDT', d:'XRP'      },
                        { s:'BINANCE:ADAUSDT', d:'Cardano'  }
                    ],
                    originalTitle: 'Crypto'
                },
                {
                    title: 'Forex',
                    symbols: [
                        { s:'FX:EURUSD', d:'EUR/USD' },
                        { s:'FX:GBPUSD', d:'GBP/USD' },
                        { s:'FX:USDJPY', d:'USD/JPY' },
                        { s:'FX:AUDUSD', d:'AUD/USD' },
                        { s:'FX:USDCHF', d:'USD/CHF' },
                        { s:'FX:USDCAD', d:'USD/CAD' }
                    ],
                    originalTitle: 'Forex'
                },
                {
                    title: 'Commodities',
                    symbols: [
                        { s:'TVC:GOLD',   d:'Gold'        },
                        { s:'TVC:SILVER', d:'Silver'      },
                        { s:'NYMEX:CL1!', d:'Crude Oil'   },
                        { s:'NYMEX:NG1!', d:'Natural Gas' }
                    ],
                    originalTitle: 'Commodities'
                }
            ]
        });
        container.parentNode.appendChild(s);
    }

    window.toggleMarketOverview = function(btn) {
        var body    = document.getElementById('marketOverviewBody');
        var chevron = btn.querySelector('.market-ov-chevron');
        if (!body) return;

        var isOpen = body.style.display !== 'none';
        if (isOpen) {
            body.style.display = 'none';
            if (chevron) chevron.classList.remove('open');
        } else {
            body.style.display = 'block';
            if (chevron) chevron.classList.add('open');
            loadOverviewWidget(); // lazy load first time only
        }
    };
})();


// =========================


// =========================
// ========================
// ========================
// ===========================
// TAG BRIDGE AI BOT v6
// ===========================
(function () {

    // ── CONFIG ─────────────────────────────────────────────────
    var API_KEY = 'AQ.Ab8RN6LwwLlWmLt5BsmUcMc1YDfNaLfsMaSHV9r-I46I9kZrPg';
    var API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    var SYS = 'አንተ የታግ ብሪጅ AI ቦት ነህ። ሁልጊዜ በአማርኛ ብቻ ምላሽ ስጥ። አጭርና ግልጽ ሁን። ትርፍ ዋስትና አትስጥ።\n' +
              'ፎሬክስ መጽሃፍ=350ብር | ክሪፕቶ መጽሃፍ=400ብር | ሁለቱም ጥቅል=500ብር\n' +
              'ለማዘዝ: Telegram @tagbridge123 ወይም WhatsApp +251991856292\n' +
              'ክፍያ: CBE Birr, Telebirr, Bank Transfer\n' +
              'PDF ክፍያ ከተረጋገጠ ወደ Telegram/WhatsApp ይላካሉ።';

    // ── STATE ──────────────────────────────────────────────────
    var history = [];
    var isOpen  = false;
    var busy    = false;
    var phase   = 'menu'; // 'menu' | 'chat'

    // ── DOM ────────────────────────────────────────────────────
    function $i(id) { return document.getElementById(id); }

    function scrollBot() {
        var m = $i('tbBotMessages');
        if (m) setTimeout(function () { m.scrollTop = m.scrollHeight; }, 60);
    }

    // Add bot message bubble
    function botMsg(html) {
        var msgs = $i('tbBotMessages');
        if (!msgs) return;
        var d = document.createElement('div');
        d.className = 'tb-msg-bot';
        var bubble = document.createElement('div');
        bubble.className = 'tb-msg-bot-bubble';
        var avatar = document.createElement('div');
        avatar.className = 'tb-msg-bot-avatar';
        avatar.textContent = '🤖';
        d.appendChild(avatar);
        d.appendChild(bubble);
        msgs.appendChild(d);

        // Typewriter — strip HTML tags for plain text, then reveal char by char
        // But keep HTML formatting — render word by word instead
        var words = html.split(' ');
        var i = 0;
        var revealed = '';
        function nextWord() {
            if (i >= words.length) { scrollBot(); return; }
            revealed += (i > 0 ? ' ' : '') + words[i];
            bubble.innerHTML = revealed;
            i++;
            scrollBot();
            setTimeout(nextWord, 28);
        }
        nextWord();
    }

    // Add user message bubble
    function userMsg(text) {
        var msgs = $i('tbBotMessages');
        if (!msgs) return;
        var d = document.createElement('div');
        d.className = 'tb-msg-user';
        d.innerHTML = '<div class="tb-msg-user-bubble">' + escHtml(text) + '</div>';
        msgs.appendChild(d);
        scrollBot();
    }

    // Typing indicator
    function showDots() {
        var msgs = $i('tbBotMessages');
        if (!msgs) return;
        var d = document.createElement('div');
        d.className = 'tb-msg-bot'; d.id = 'tbDots';
        d.innerHTML =
            '<div class="tb-msg-bot-avatar">🤖</div>' +
            '<div class="tb-typing-dots"><span></span><span></span><span></span></div>';
        msgs.appendChild(d);
        scrollBot();
    }
    function hideDots() { var t = $i('tbDots'); if (t) t.remove(); }

    // Set option buttons
    function setOpts(items) {
        var o = $i('tbBotOpts');
        if (!o) return;
        o.innerHTML = '';
        items.forEach(function (item) {
            var btn = document.createElement('button');
            btn.className = 'tb-faq-btn';
            btn.innerHTML = item.label;
            btn.onclick = item.fn;
            o.appendChild(btn);
        });
        scrollBot();
    }

    function clearOpts() {
        var o = $i('tbBotOpts');
        if (o) o.innerHTML = '';
    }

    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ── OPEN / CLOSE ───────────────────────────────────────────
    window.toggleTbBot = function () {
        var sidebar  = $i('tbBotWindow');
        var overlay  = $i('tbOverlay');
        if (!sidebar) return;

        isOpen = !isOpen;

        if (isOpen) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('open');
            // First open — show welcome
            if ($i('tbBotMessages').children.length === 0) {
                setTimeout(function () {
                    botMsg('ሰላም! 👋 እኔ የታግ ብሪጅ AI ቦት ነኝ።<br>ልረዳዎት ዝግጁ ነኝ — ከታች ካሉት ጥያቄዎች ይምረጡ ወይም ጽፈው ይጠይቁ 👇');
                    setTimeout(showMenu, 350);
                }, 200);
            }
            setTimeout(function () { var i = $i('tbBotInput'); if (i) i.focus(); }, 400);
        } else {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
        }
    };

    // ── MAIN MENU ──────────────────────────────────────────────
    function showMenu() {
        phase = 'menu';
        setOpts([
            { label: '📚 የመጽሃፍቱ ይዘቶች ማወቅ እፈልጋለሁ',     fn: function () { bookContents();    } },
            { label: '💳 ክፍያ ከፈልኩ መጽሃፉን እንዴት አገኛለሁ?', fn: function () { howToGet();        } },
            { label: '🌱 መጽሃፉ ለጀማሪዎች ተስማሚ ነው?',         fn: function () { forBeginners();    } },
            { label: '💰 ምን አይነት ክፍያ ዘዴዎች አሉ?',           fn: function () { paymentMethods();  } },
            { label: '🎯 ከመጽሃፍ ሌሎች አማራጮች?',              fn: function () { otherOptions();    } },
            { label: '❓ ሌላ ጥያቄ አለኝ — ልጻፍ',              fn: function () { enterChat();       } }
        ]);
    }

    function backToMenu() {
        setTimeout(function () {
            botMsg('ሌሎች ጥያቄዎችም ይምረጡ 👇');
            setTimeout(showMenu, 300);
        }, 300);
    }

    // ── FOREX QUIZ INTRO ───────────────────────────────────────
    function forexIntro() {
        clearOpts();
        userMsg('💱 የፎሬክስ ትሬዲንግ ፈተና');
        setTimeout(function () {
            botMsg(
                '🎉 <strong>የፎሬክስ ትሬዲንግ ፈተናዎችን ለመፈተን መርጠዋል!</strong><br><br>' +
                'ከ<strong>200 በላይ ጥያቄዎች</strong> — በ4 ምዕራፍ፦<br><br>' +
                '📗 <strong>1. ጀማሪ (1–50)</strong><br>' +
                '<small style="opacity:.7">Forex መሠረቶች, Currency Pairs, Brokers, Trading Basics</small><br><br>' +
                '📘 <strong>2. መካከለኛ (51–100)</strong><br>' +
                '<small style="opacity:.7">Technical Analysis, Candlesticks, Market Structure</small><br><br>' +
                '📙 <strong>3. ከፍተኛ (101–150)</strong><br>' +
                '<small style="opacity:.7">Fundamental Analysis, Strategies, Risk Management</small><br><br>' +
                '📕 <strong>4. ፕሮፌሽናል (151–200)</strong><br>' +
                '<small style="opacity:.7">Trading Psychology, Advanced Analysis, የገበያ ውሳኔዎች</small><br><br>' +
                'ፈተናውን ለመውሰድ ዝግጁ ነዎት? ↓'
            );
            setTimeout(function () {
                setOpts([
                    {
                        label: '✅ እንቀጥል! — ምዕራፍ 1 ጀምር',
                        fn: function () {
                            clearOpts();
                            userMsg('✅ እንቀጥል!');
                            var quiz = document.getElementById('quizSection');
                            if (quiz) quiz.scrollIntoView({ behavior: 'smooth' });
                            // close sidebar
                            var sb = $i('tbBotWindow');
                            var ov = $i('tbOverlay');
                            if (sb) sb.classList.remove('open');
                            if (ov) ov.classList.remove('open');
                            isOpen = false;
                            setTimeout(function () {
                                if (window.launchQuiz) window.launchQuiz();
                                // auto-pick forex topic
                                setTimeout(function () {
                                    if (window.pickTopic) window.pickTopic('forex');
                                }, 1200);
                            }, 600);
                        }
                    },
                    { label: '🔙 ወደ ዋናው ምናሌ', fn: function () { backToMenu(); } }
                ]);
            }, 500);
        }, 350);
    }

    // ── CRYPTO QUIZ INTRO ──────────────────────────────────────
    function cryptoIntro() {
        clearOpts();
        userMsg('₿ የክሪፕቶ ትሬዲንግ ፈተና');
        setTimeout(function () {
            botMsg(
                '🎉 <strong>የክሪፕቶ ትሬዲንግ ፈተናዎችን ለመፈተን መርጠዋል!</strong><br><br>' +
                '<strong>30 ጥያቄዎች</strong> — Crypto Basics, Blockchain,<br>' +
                'Spot &amp; Futures Trading, Risk Management ↓'
            );
            setTimeout(function () {
                setOpts([
                    {
                        label: '✅ እንቀጥል! — ክሪፕቶ ፈተና ጀምር',
                        fn: function () {
                            clearOpts();
                            userMsg('✅ እንቀጥል!');
                            var quiz = document.getElementById('quizSection');
                            if (quiz) quiz.scrollIntoView({ behavior: 'smooth' });
                            var sb = $i('tbBotWindow');
                            var ov = $i('tbOverlay');
                            if (sb) sb.classList.remove('open');
                            if (ov) ov.classList.remove('open');
                            isOpen = false;
                            setTimeout(function () {
                                if (window.launchQuiz) window.launchQuiz();
                                setTimeout(function () {
                                    if (window.pickTopic) window.pickTopic('crypto');
                                }, 1200);
                            }, 600);
                        }
                    },
                    { label: '🔙 ወደ ዋናው ምናሌ', fn: function () { backToMenu(); } }
                ]);
            }, 500);
        }, 350);
    }

    // ── FAQ ANSWERS ────────────────────────────────────────────
    function bookContents() {
        clearOpts();
        userMsg('📚 የመጽሃፍቱ ይዘቶች ማወቅ እፈልጋለሁ');
        setTimeout(function () {
            botMsg(
                '📚 <strong>1. የፎሬክስ ትሬዲንግ መጽሃፍ ይዘቶች፦</strong><br><br>' +
                '✅ የፎሬክስ መሠረቶች<br>' +
                '✅ የፎሬክስ ገበያ መዋቅር<br>' +
                '✅ የምንዛሬ ጥንዶች (Currency Pairs)<br>' +
                '✅ የትሬዲንግ ሰዓታት (Trading Sessions)<br>' +
                '✅ የፎሬክስ አካውንት አጠቃቀም<br>' +
                '✅ የፎሬክስ ትሬዲንግ ፕላትፎርም አጠቃቀም (MT4/MT5)<br>' +
                '✅ የፎሬክስ ትሬዲንግ አይነቶች<br>' +
                '✅ ቴክኒካል ትንተና (Technical Analysis)<br>' +
                '✅ ቴክኒካል ኢንዲኬተሮች<br>' +
                '✅ Price Action<br>' +
                '✅ የካንድልስቲክ ፓተርኖች (Candlestick Patterns)<br>' +
                '✅ Smart Money Concept (SMC)<br>' +
                '✅ ፋንዳሜንታል ትንተና (Fundamental Analysis)<br>' +
                '✅ የፎሬክስ ትሬዲንግ ስትራቴጂ<br>' +
                '✅ Risk Management (የሪስክ ማኔጅመንት)<br>' +
                '✅ Trading Psychology (የትሬዲንግ ስነ-ልቦና)<br>' +
                '✅ Trading Plan እና አያያዝ<br>' +
                '✅ Demo Account ልምምድ<br>' +
                '✅ Practical Trading (ተግባራዊ ትሬዲንግ)<br>' +
                '✅ በትሬዲንግ ገንዘብ ማግኛ መንገዶች<br>' +
                '✅ እና ሌሎችም...'
            );
            setTimeout(function () {
                botMsg(
                    '₿ <strong>2. የክሪፕቶ ትሬዲንግ መጽሃፍ ይዘቶች፦</strong><br><br>' +
                    '✅ የክሪፕቶ ከረንሲ ምንነት<br>' +
                    '✅ የክሪፕቶ ከረንሲ አይነቶች<br>' +
                    '✅ Blockchain ምንነት<br>' +
                    '✅ Spot &amp; Margin Trading<br>' +
                    '✅ Futures Trading<br>' +
                    '✅ Spot Trading<br>' +
                    '✅ Arbitrage Trading<br>' +
                    '✅ Copy Trading<br>' +
                    '✅ የክሪፕቶ ትሬዲንግ ስትራቴጂዎች<br>' +
                    '✅ የክሪፕቶ ትሬዲንግ ትንተና አይነቶች<br>' +
                    '✅ ክሪፕቶ ትሬዲንግ ለመጀመር የሚያስፈልጉ ነገሮች<br>' +
                    '✅ የባይናንስ አካውንት አከፋፈት<br>' +
                    '✅ Risk Management<br>' +
                    '✅ Trading Psychology'
                );
                setTimeout(backToMenu, 400);
            }, 600);
        }, 350);
    }

    function howToGet() {
        clearOpts();
        userMsg('💳 ክፍያ ከፈልኩ መጽሃፉን እንዴት አገኛለሁ?');
        setTimeout(function () {
            botMsg(
                '✅ ክፍያ ከተረጋገጠ በኋላ <strong>ፒዲኤፍ መጽሃፉ በደቂቃዎች ውስጥ</strong> ወደ WhatsApp ወይም Telegram ይላካሉ።<br><br>' +
                '📲 ለማዘዝ ወይም ለክፍያ ዝርዝር ያናግሩን — ምላሽ ለመስጠት ዝግጁ ነን!'
            );
            setTimeout(backToMenu, 400);
        }, 350);
    }

    function forBeginners() {
        clearOpts();
        userMsg('🌱 መጽሃፉ ለጀማሪዎች ተስማሚ ነው?');
        setTimeout(function () {
            botMsg(
                '✅ አዎ! ሁሉም መጽሃፍቶቻችን <strong>ለጀማሪዎች ከዜሮ ጀምሮ</strong> በቀላል አማርኛ ቋንቋ ተጽፈዋሉ።<br><br>' +
                'ምንም ቀዳሚ እውቀት አያስፈልግም — ሙሉ ሂደቱ ደረጃ በደረጃ ይገለጻሉ!'
            );
            setTimeout(backToMenu, 400);
        }, 350);
    }

    function paymentMethods() {
        clearOpts();
        userMsg('💰 ምን አይነት የክፍያ ዘዴዎች አሉ?');
        setTimeout(function () {
            botMsg(
                '✅ ተቀባይ የክፍያ ዘዴዎች፦<br><br>' +
                '• <strong>CBE Birr</strong> (ሲቢኢ ብር)<br>' +
                '• <strong>Telebirr</strong> (ቴሌብር)<br>' +
                '• <strong>Bank Transfer</strong> (የባንክ ዝውውር)<br><br>' +
                '💰 <strong>ዋጋዎች፦</strong><br>' +
                '• ፎሬክስ ትሬዲንግ = <strong>350 ብር</strong><br>' +
                '• ክሪፕቶ ትሬዲንግ = <strong>400 ብር</strong><br>' +
                '• ሁለቱም ጥቅል = <strong>500 ብር</strong> (ቅናሽ!)<br><br>' +
                'ለክፍያ ዝርዝር በ<strong>Telegram @tagbridge123</strong> ወይም <strong>WhatsApp +251991856292</strong> ያናግሩ።'
            );
            setTimeout(backToMenu, 400);
        }, 350);
    }

    function otherOptions() {
        clearOpts();
        userMsg('🎯 ከመጽሃፍ ሌሎች አማራጮች?');
        setTimeout(function () {
            botMsg(
                '✅ ከመጽሃፍ በተጨማሪ፦<br>' +
                '• 📊 <strong>Demo Account</strong> — ምናባዊ ለልምምድ (ነጻ)<br>' +
                '• 📢 <strong>Telegram Channel</strong>: t.me/tagbridge<br>' +
                '• 🎵 <strong>TikTok</strong>: @tagbridge<br>' +
                '• 💬 <strong>WhatsApp Channel</strong> — ቅናሾችና ዝርዝሮች'
            );
            setTimeout(backToMenu, 400);
        }, 350);
    }

    function enterChat() {
        clearOpts();
        phase = 'chat';
        userMsg('❓ ሌላ ጥያቄ አለኝ — ልጻፍ');
        setTimeout(function () {
            botMsg('ጥያቄዎን ይጻፉ — ምላሽ ለመስጠት ዝግጁ ነኝ! 💬');
        }, 300);
    }

    // ── SEND TEXT MESSAGE ──────────────────────────────────────
    window.sendTbMessage = function () {
        var inp = $i('tbBotInput');
        if (!inp || busy) return;
        var text = inp.value.trim();
        if (!text) return;
        inp.value = '';

        // Not in chat mode — redirect to menu
        if (phase !== 'chat') {
            userMsg(text);
            setTimeout(function () {
                botMsg('ከታች ካሉ ምናሌዎች ይምረጡ 👇');
                setTimeout(showMenu, 300);
            }, 200);
            return;
        }

        // Chat mode — call Gemini
        userMsg(text);
        history.push({ role: 'user', parts: [{ text: text }] });
        busy = true;
        inp.disabled = true;
        showDots();

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':    'application/json',
                'x-goog-api-key':  API_KEY
            },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYS }] },
                contents:           history,
                generationConfig:   { temperature: 0.7, maxOutputTokens: 450, topP: 0.9 }
            })
        })
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            hideDots();
            busy = false;
            inp.disabled = false;
            inp.focus();
            var reply = '';
            try { reply = data.candidates[0].content.parts[0].text; } catch (e) {}
            if (!reply) reply = 'ይቅርታ — አሁን ምላሽ አልቻልኩም። ቆየት ብለው ይሞክሩ።';
            history.push({ role: 'model', parts: [{ text: reply }] });
            botMsg(reply.replace(/\n/g, '<br>'));
            setTimeout(function () {
                setOpts([
                    { label: '🔙 ወደ ዋናው ምናሌ ተመለስ', fn: function () { backToMenu(); } }
                ]);
            }, 500);
        })
        .catch(function (err) {
            hideDots();
            busy = false;
            inp.disabled = false;
            inp.focus();
            var msg = (err.message.indexOf('401') !== -1 || err.message.indexOf('403') !== -1)
                ? 'ለዚህ ጥያቄ በቀጥታ ያናግሩን 📲<br>Telegram: <strong>@tagbridge123</strong>'
                : 'ይቅርታ — ኔትወርክ ችግር። ቆየት ብለው ይሞክሩ።';
            botMsg(msg);
            setTimeout(function () {
                setOpts([
                    { label: '🔙 ወደ ዋናው ምናሌ ተመለስ', fn: function () { backToMenu(); } }
                ]);
            }, 500);
        });
    };

})();

