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


// ===========================
// AI QUIZ — FULL REDESIGN
// ===========================
(function() {

    // ── QUESTIONS ──────────────────────────────────────────────
    var allQ = {
        forex: [
            // ── ምዕራፍ 1 ──
            { q:'1. Forex ማለት ምንድን ነው?', opts:['የኩባንያ አክሲዮን ገበያ','የምንዛሬ ልውውጥ ገበያ','የዲጂታል ሳንቲም ብቻ','የእቃ ንግድ'], correct:1, explain:'Forex = Foreign Exchange — የምንዛሬ ልውውጥ ገበያ ነው።' },
            { q:'2. EUR/USD = 1.10 ሲሆን ምን ማለት ነው?', opts:['1 USD = 1.10 EUR','1 EUR = 1.10 USD','1 EUR = 110 USD','1 USD = 110 EUR'], correct:1, explain:'Base currency (EUR) አንድ ክፍል 1.10 USD ይዋጃል።' },
            { q:'3. Major Pairs ምን ምንዛሬ ሁሉ ያካትታሉ?', opts:['GBP','EUR','USD','JPY'], correct:2, explain:'Major pairs ሁሉ USD ያካትታሉ — ከፍተኛ Liquidity አላቸው።' },
            { q:'4. Decentralized ገበያ ምን ማለት ነው?', opts:['አንድ ኤክስቼንጅ ብቻ','ሁሉም ዋጋ ባንክ ይወስናል','ግብይቶች OTC Network ላይ','ደንብ የለውም'], correct:2, explain:'Forex OTC ሲሆን ምንም ማዕከላዊ ኤክስቼንጅ የለውም።' },
            { q:'5. Forex Broker ዋና ሚናው ምንድን ነው?', opts:['ትርፍ ዋስትና','ትሬዲንግ መለያ + አገልግሎት','ዋጋ ይቆጣጠራል','ኪሳራ ይሸፍናል'], correct:1, explain:'Broker የትሬዲንግ Platform እና Order Execution ያቀርባል።' },
            { q:'6. Demo Account ለምን ይጠቅማል?', opts:['ትርፍ ዋስትና','ምናባዊ ገንዘብ ለልምምድ','ሁልጊዜ Live ይሸናል','Spread አያስፈልግም'], correct:1, explain:'Demo = ምናባዊ ገንዘብ ስለሆነ ያለ ኪሳራ ስትራቴጂ ለመለማመድ ያስችላል።' },
            { q:'7. Bid Price ምንድን ነው?', opts:['ዋጋ ጫሪ ሲሸጥ (Sell)','ዋጋ ጫሪ ሲገዛ (Buy)','ከፍተኛ ዋጋ','ዝቅተኛ ዋጋ'], correct:0, explain:'Bid = ትሬደሩ Sell ሲያደርግ Broker ከሚከፍለው ዋጋ ነው።' },
            { q:'8. Spread ምንድን ነው?', opts:['Bid + Ask','Ask − Bid','Bid × Ask','Ask ÷ Bid'], correct:1, explain:'Spread = Ask − Bid — Broker ክፍያ ተደርጎ ይወሰዳል።' },
            { q:'9. 1 pip ለ EUR/USD ስንት ነው?', opts:['0.01','0.001','0.0001','1.0'], correct:2, explain:'ለብዛቱ pairs 1 pip = 0.0001 ሲሆን JPY pairs ግን 0.01 ናቸው።' },
            { q:'10. Standard Lot ስንት ነው?', opts:['1,000','10,000','100,000','1,000,000'], correct:2, explain:'Standard Lot = 100,000 units የBase currency ነው።' },
            // ── ምዕራፍ 2 ──
            { q:'11. Leverage 1:100 ምን ማለት ነው?', opts:['100$ ትርፍ ዋስትና','ትንሽ ካፒታል ትልቅ ፖዚሽን ለማስቀመጥ','100 ትሬዶች ነፃ','ኪሳራ የለም'], correct:1, explain:'Leverage = ትርፍም ኪሳራም ያበዛል — ጥንቃቄ ያስፈልጋል።' },
            { q:'12. Margin ምንድን ነው?', opts:['ዕለት ትርፍ','Broker ዋስትና ገንዘብ','Spread ዋጋ','ወለድ'], correct:1, explain:'Margin = ቦታ ለመክፈትና ለመያዝ Broker ጋር የሚቀመጥ ዋስትና ገንዘብ ነው።' },
            { q:'13. Stop Loss ለምን ይጠቅማል?', opts:['ትርፍ ለማሳደግ','ኪሳራ ለመገደብ','ፈጣን ትሬድ','Leverage ለማሳደግ'], correct:1, explain:'SL = ዋጋ ተቃራኒ ሲሄድ ትሬዱ ዘግቶ ኪሳራ ይገድባል።' },
            { q:'14. Take Profit ምን ያደርጋል?', opts:['ቦታ ያሳድጋል','ዋጋ ደረጃ ሲደርስ ትርፍ ዘግቶ ያሸለፍናል','SL ይቀይራል','ካፒታል ያበዛል'], correct:1, explain:'TP = ዋጋ ዓላማ ደረጃ ሲደርስ ትሬዱ ሲዘጋ ትርፍ ያሸለፍናል።' },
            { q:'15. Market Order ምንድን ነው?', opts:['ወደፊት ዋጋ ብቻ','አሁን ባለው ዋጋ ለመፈጸም','ትሬድ ሰርዣ','SL ዓይነት'], correct:1, explain:'Market Order = ወቅቱ ባለው ምርጥ ዋጋ ወዲያው ይፈጸማል።' },
            { q:'16. Buy Limit Order ለምን ይጠቅማል?', opts:['ዋጋ ወደ ላይ ሲወጣ','ዋጋ ዝቅ ሲል ለመግዛት','ትሬድ ለመዝጋት','Spread ለማጥፋት'], correct:1, explain:'Buy Limit = ዋጋ ወደ ተወሰነ ዝቅ ደረጃ ሲወርድ Buy order ይፈጸማል።' },
            { q:'17. Risk:Reward 1:2 ምን ማለት ነው?', opts:['2 ትሬዶች ያሸነፋሉ','1 ኪሳራ ሲሆን ዓላማ 2 ትርፍ','ትርፍ ዋስትና','2 Account ያስፈልጋል'], correct:1, explain:'R:R 1:2 = ሊጠፋ ከሚችል 1 ለ 2 ትርፍ ታለማለህ — ዋስትና የለም።' },
            { q:'18. FOMO ምንድን ነው?', opts:['Liquidity','ፍርሃት ያለ እቅድ ትሬድ ምቦ መዝለቅ','Session ስም','ቻርት ዓይነት'], correct:1, explain:'FOMO = Fear Of Missing Out — ስሜታዊ ውሳኔ ስለሆነ ብዙ ጊዜ ኪሳራ ያስከትላል።' },
            { q:'19. Revenge Trading ምንድን ነው?', opts:['ስትራቴጂ','ኪሳራ ለመመለስ ቁጣ ትሬዶች','Hedging','Technical Analysis'], correct:1, explain:'Revenge Trading = ኪሳራ ከደረሰ በኋላ ቁጣ ኪሳራን ሊያበዛ ይችላል።' },
            { q:'20. Trading Journal ለምን ያስፈልጋል?', opts:['ዋጋ ለመቆጣጠር','ትሬዶች ስህተቶችና ውሳኔ ለመገምገም','ኪሳራ ይመልሳል','Broker ኮሚሽን ለማጥፋት'], correct:1, explain:'Journal = ስህተቶች ለይቶ ስትራቴጂ ለማሻሻል ዋናው መሳሪያ ነው።' },
            // ── Market Structure ──
            { q:'21. Uptrend ምን ይለያዋል?', opts:['Lower Highs & Lower Lows','Higher Highs & Higher Lows','ዋጋ አይንቀሳቀስም','ሁሉም ሻማ ተመሳሳይ'], correct:1, explain:'Uptrend = HH + HL — ዋጋ ደረጃ ደረጃ ወደ ላይ ይሄዳል።' },
            { q:'22. Downtrend ምን ይለያዋል?', opts:['Higher Highs & Higher Lows','Lower Highs & Lower Lows','ተመሳሳይ High/Low','ወደ ላይ ብቻ'], correct:1, explain:'Downtrend = LH + LL — ዋጋ ደረጃ ደረጃ ወደ ታች ይወርዳል።' },
            { q:'23. Market Structure Shift (MSS) ምን ሊያስጠቁም ይችላል?', opts:['ዋጋ ወደ ላይ ዋስትና','አወቃቀሩ ሊቀየር ይችላል','Broker ሊቀይር','ሁሉም ትርፍ'], correct:1, explain:'MSS = ቀደም ያለ Trend ሊቀየር እንደሚችል ምልክት — ብቻውን አያረጋግጥም።' },
            { q:'24. Break of Structure (BOS) ምን ማለት ነው?', opts:['ዋጋ አይንቀሳቀስም','ቀደም Swing High/Low ሰብሮ ሲያልፍ','Account ሲጨምር','Session ሲጨርስ'], correct:1, explain:'BOS = ቀደም ያለ Swing ሰብሮ ሲያልፍ — የTrend Continuation ምልክት ሊሆን ይችላል።' },
            { q:'25. Range Market ምን ማለት ነው?', opts:['ወደ ላይ ብቻ','ወደ ታች ብቻ','Support/Resistance መካከል ሲወዛወዝ','ገበያ ሲዘጋ'], correct:2, explain:'Range = ዋጋ ግልጽ Trend ሳይኖር ዞን ውስጥ ይወዛወዛል — Breakout ሊከሰት ይችላል።' },
            // ── S/R ──
            { q:'26. Support ምንድን ነው?', opts:['ዋጋ ሁልጊዜ ሚወርድበት','Buyer ሊጨምሩ የሚችሉ ዞን','Broker ኮሚሽን','SL'], correct:1, explain:'Support = Buyers ሊጠናከሩ ዞን — ዋስትና የለም።' },
            { q:'27. Resistance ምንድን ነው?', opts:['Seller ሊጨምሩ የሚችሉ ዞን','ዋጋ ሁልጊዜ ሚጨምርበት','Session','Leverage'], correct:0, explain:'Resistance = Sellers ዞን — Breakout ሊከሰት ይችላል።' },
            { q:'28. Role Reversal ምን ማለት ነው?', opts:['Resistance ሰብሮ Support ሊሆን ይችላል','ሁልጊዜ ይሆናል','Spread ብቻ','Demo ብቻ'], correct:0, explain:'Resistance ከተሰበረ Support ሊሆን ይችላል — ዋስትና አይሰጥም።' },
            // ── Candlestick ──
            { q:'29. Candlestick Body ምን ያሳያል?', opts:['Open & Close ዋጋ','Session ሰዓት','Broker ትርፍ','Account'], correct:0, explain:'Body = Open/Close ዋጋዎች ይወክላል — ቀለሙ ዋጋ ከፍ/ዝቅ ብሎ ስለ መዝጋቱ ያሳያል።' },
            { q:'30. Pin Bar ምን ሊያሳይ ይችላል?', opts:['ዋጋ Rejection ወይም ምላሽ ሊኖር','ትርፍ ዋስትና','SL አያስፈልግም','ዋጋ አይንቀሳቀስም'], correct:0, explain:'Pin Bar = ረጅም Wick — ዋጋ ሊመለስ ይጠቁማል። ቦታ + አውድ ወሳኝ ናቸው።' },
            // ── Liquidity & SMC ──
            { q:'31. Buy-Side Liquidity ብዙ ጊዜ የት ይገኛል?', opts:['ከSwing Highs/Equal Highs በላይ','ከLows በታች','Account ውስጥ','Candle መካከል'], correct:0, explain:'BSL = ከHigh ደረጃዎች በላይ Buy Stop Orders ሊሰበሰቡ ይችላሉ።' },
            { q:'32. Sell-Side Liquidity ብዙ ጊዜ የት ይገኛል?', opts:['ከHighs በላይ','ከEqual Lows/Swing Lows በታች','Open ላይ','Resistance በላይ'], correct:1, explain:'SSL = ከLow ደረጃዎች በታች Sell Stop Orders ሊሰበሰቡ ይችላሉ።' },
            { q:'33. Liquidity Sweep ምን ማለት ነው?', opts:['Account ማጽዳት','ዋጋ High/Low ሰብሮ Orders ወሰዶ ሊመለስ','ሁሉም ትሬዶች መዝጋት','Candle ቀለም'], correct:1, explain:'Sweep = ዋጋ SL/Orders ካነቃ ሲመለስ — Market Structure ማረጋገጫ ያስፈልጋል።' },
            { q:'34. Order Block (OB) ምንድን ነው?', opts:['ሁሉም Candle','ጠንካራ እንቅስቃሴ በፊት ያለ ዞን (Demand/Supply)','Account','Broker'], correct:1, explain:'OB = ከጠንካራ Move በፊት ያለ ዞን — ዋስትና አይሰጥም ። ማረጋገጫ ያስፈልጋል።' },
            { q:'35. Fair Value Gap (FVG) ምንድን ነው?', opts:['3-Candle setup ውስጥ 1ኛ/3ኛ Wick የማይደራረቡ ዞን','Broker ክፍያ','ሁሉም ጭማሪ','SL'], correct:0, explain:'FVG = 1ኛ Candle High < 3ኛ Low (Bullish) ወይም 1ኛ Low > 3ኛ High (Bearish)።' },
            // ── Psychology & Risk ──
            { q:'36. Risk Management ለምን ወሳኝ ነው?', opts:['ሙሉ ኪሳራ ለማጥፋት','ካፒታልን ጠብቆ ለቀጠል','ዋጋ ለመቆጣጠር','ብዙ ትሬዶች'], correct:1, explain:'RM = ካፒታልህን ጠብቆ ረዘም ላለ ጊዜ ትሬዲንግ ለቀጠል ወሳኝ ነው።' },
            { q:'37. Position Sizing ምን ያደርጋል?', opts:['ሰዓት ይወስናል','ካፒታልና SL ጋር የትሬድ መጠን ያዛምዳል','Broker ስም','ዜና'], correct:1, explain:'Position Sizing = ካፒታልህ፣ SL ርቀት እና ሪስክ % ተዳምሮ የLot Size ይወስናል።' },
            { q:'38. Drawdown ምንድን ነው?', opts:['ካፒታል ከፍ ደረጃ ሲቀነስ','Session','Spread','ትሬድ ብዛት'], correct:0, explain:'Drawdown = ካፒታልህ ከቀድሞ Peak ምን ያህል ወረደ — ሪስክ መለኪያ ነው።' },
            { q:'39. Technical Analysis ምንድን ነው?', opts:['ቻርት ወይም ዋጋ ውሂብ ተጠቅሞ ትንተና','አገር ሕግ','ወለድ','Account'], correct:0, explain:'TA = ያለፈ ዋጋ ቅጦች ወደፊቱን ሊጠቁሙ ይችላሉ ብሎ ይተናተናል።' },
            { q:'40. Fundamental Analysis ምን ይጠቀማል?', opts:['ቻርት ብቻ','ኢኮኖሚ ዜናዎችና ሪፖርቶች','Candlestick','Moving Average'], correct:1, explain:'FA = GDP፣ ወለድ ዋጋ፣ ዜናዎች ገበያን ለማህዳር ይጠቀማል።' },
            { q:'41. Uptrend ስትሬደር ምን ይጠቀምሃ?', opts:['Sell ብቻ','Buy ፖዚሽን ያዝ','Trend ችላ','Demo ብቻ'], correct:1, explain:'Trend Follow = Uptrend ላይ Buy ፖዚሽን መያዝ አቅጣጫ ጋር አብሮ መሄድ ነው።' },
            { q:'42. RSI > 70 ምን ሊያስጠቁም ይችላል?', opts:['Overbought — ዋጋ ሊወርድ ሊችል','Oversold','Account ሙሉ ነው','Breakout ዋስትና'], correct:0, explain:'RSI > 70 Overbought ሊሆን ይጠቁማል — ዋስትና አይሰጥም ። Market Structure ጋር ማጣመር ያስፈልጋል።' },
            { q:'43. Moving Average ምን ያደርጋል?', opts:['ዋጋ አለስልሶ አዝማሚያ ያሳያል','Broker ፈቃድ','Lot ይወስናል','Spread ያጠፋል'], correct:0, explain:'MA = ዋጋ ሸካሪ ለስ አድርጎ Trend አቅጣጫ ለመመልከት ይጠቅማል።' },
            { q:'44. Timeframe ምን ማለት ነው?', opts:['ትሬደር ዕድሜ','ሻማ የሚወክለው የጊዜ ርዝመት','Spread','Leverage'], correct:1, explain:'Timeframe = M1፣ H1፣ D1... ሻማ ምን ያህል ጊዜ እንደሚወክል ያሳያል።' },
            { q:'45. Higher Timeframe Bias ለምን ወሳኝ ነው?', opts:['ሁልጊዜ ትሬድ ለመክፈት','ትንሽ TF Signal ምን አቅጣጫ ላይ እንዳለ ለማወቅ','Demo ብቻ','Session ሰዓት'], correct:1, explain:'HTF Bias = ትልቁ ስዕሉ ምን ሲናገር አቅጣጫ ወስነህ ትሬድ ልትከፍት ይጠቅምሃል።' },
            { q:'46. Equal Highs ምን ሊያምለክቱ ይችላሉ?', opts:['ከላያቸው BSL ሊሰበሰብ ይችላል','ዋጋ ፈጽሞ ሊያልፍ አይችልም','Broker ስጦታ','Session ሰዓት'], correct:0, explain:'Equal Highs = ብዙ SL ሊሰበሰቡ ስለሚችሉ ዋጋ ሊሄዳቸው ይችላል — ዋስትና አይሰጥም።' },
            { q:'47. Bearish Engulfing ምን ሊያምለክት ይችላል?', opts:['Resistance አካባቢ Bearish ግፊት ሊጨምር','ዋጋ ሁልጊዜ ይጨምራል','Session ጀምሯል','Spread ጠፋ'], correct:0, explain:'Bearish Engulfing = ትልቅ Bearish Candle ቀደምቱን Bullish የሸፈነ — Context ያስፈልጋል።' },
            { q:'48. Inducement SMC ውስጥ ምን ሊያምለክት ይጠቅምበታል?', opts:['ቀድሞ እንዲገቡ ሊያስቸኩለ የሚችል ምልክት','Account ማስከፈቻ','Platform','ወለድ'], correct:0, explain:'Inducement = ቀድሞ እንዲገቡ ሊሳብ የሚችል ምልክት ሲሆን Context ወሳኝ ነው።' },
            { q:'49. ትሬደር SSL Sweep + Bullish MSS አየ — ቀጥሎ?', opts:['ሳይመረምር ትልቅ Lot Buy','Sell ብቻ','HTF Bias + Entry + SL + R:R ሁሉ ሰርቶ ከዚያ','SL ሳይጠቀም'], correct:2, explain:'Setup ቢታይ — HTF Bias፣ Entry Trigger፣ SL፣ Position Size፣ R:R ሁሉ ካልተወሰኑ አትክፈት።' },
            { q:'50. Live Trading ከመጀመርህ ምን ማድረግ አለብህ?', opts:['ያለ እቅድ ብቀጥ','Social media signal ብቻ','መሠረት ተማር፣ Demo ለምምድ፣ Risk ደንብ አዘጋጅ','ትልቅ Leverage ጠቀም'], correct:2, explain:'ትምህርት + ልምምድ + ዲሲፕሊን + Risk Management = ጠንካራ መሠረት ነው።' }
        ],
        crypto: [
            { q:'1. Cryptocurrency ምንድን ነው?', opts:['የባንክ ሌላ ስም','Cryptography ላይ የተመሠረተ ዲጂታል ምንዛሬ','የForex ዓይነት','አክሲዮን ብቻ'], correct:1, explain:'Crypto = Blockchain ላይ የሚሰራ ዲሴንትራላይዝድ ዲጂታል ምንዛሬ ነው።' },
            { q:'2. Blockchain ምንድን ነው?', opts:['ዲሴንትራላይዝድ ዲጂታል Ledger','ባንክ ዓይነት','Crypto Exchange','ትሬዲንግ ስትራቴጂ'], correct:0, explain:'Blockchain = ሁሉም ትራንዛክሽን ሚቀዳበት ዲሴንትራላይዝድ ዲጂታል መዝገብ ነው።' },
            { q:'3. Bitcoin ምን ዓይነት ምንዛሬ ነው?', opts:['Stable Coin','Altcoin','First Decentralized Cryptocurrency','Fiat'], correct:2, explain:'BTC = Satoshi Nakamoto 2009 ያስተዋወቀው የመጀመሪያ Decentralized ምንዛሬ ነው።' },
            { q:'4. Altcoin ምን ማለት ነው?', opts:['Bitcoin ብቻ','Bitcoin ካልሆነ ሌላ ሁሉ','Stable Coin','Fiat'], correct:1, explain:'Altcoin = BTC ካልሆነ ሌላ ሁሉ Crypto — ETH፣ BNB፣ SOL... ናቸው።' },
            { q:'5. Stable Coin ምን ይለያዋል?', opts:['ዋጋ ሁልጊዜ ይጨምራል','ከFiat ጋር ዋጋ ለማረጋጋጥ ሙከራ ይደረጋል','ካልሆነ ሌላ ሁሉ','Blockchain የሌለው'], correct:1, explain:'Stable Coin = USDT/USDC ዋጋ 1 USD ጠጋ እንዲቆይ ዘዴ ይጠቀማል — ዋስትና አይሰጥም።' },
            { q:'6. Spot Trading ምን ማለት ነው?', opts:['ዋጋ አሁን ተፈጽሞ Asset ወዲያው','Futures ሌላ ስም','Demo ብቻ','Leverage ሁልጊዜ'], correct:0, explain:'Spot = Asset ወዲያው ፈጽሞ ይቀበላሉ/ይሸጣሉ — ቀጥተኛ ባለቤትነት።' },
            { q:'7. Futures Trading ምን ይፈቅዳል?', opts:['ወዲያው Asset','Leverage ተጠቅሞ ወደፊት ዋጋ ለማትረፍ ወደ ላይ/ታች','Demo ብቻ','Crypto ማቆየት'], correct:1, explain:'Futures = Leverage ተጠቅሞ Long/Short ትሬድ — ትርፍም ኪሳራም ይጨምራል።' },
            { q:'8. HODL ምን ማለት ነው?', opts:['ቶሎ ሸጥ','ዋጋ ቢወርድ ሳትሸጥ ረዘም ጊዜ ማስቀመጥ','Day Trading','Hard Fork'], correct:1, explain:'HODL = Hold On for Dear Life — ረዘም ጊዜ ሳትሸጥ ዋጋ ሊጨምር ብሎ ማቆየት።' },
            { q:'9. DeFi ምን ማለት ነው?', opts:['ማዕከላዊ ባንክ','Blockchain ላይ ያለ Decentralized Finance','Fiat Exchange','Stable Coin ብቻ'], correct:1, explain:'DeFi = ባንክ ሳያስፈልግ Blockchain ላይ የሚሰራ Lending፣ Swap፣ Yield Farming...ናቸው።' },
            { q:'10. NFT ምን ማለት ነው?', opts:['Normal Finance Token','Non-Fungible Token — ልዩ ዲጂታል Asset','Stable Coin','Altcoin'], correct:1, explain:'NFT = Non-Fungible Token — ሌላ ዲጂታል Asset ጋር ሊቀያየር ያልቻለ ልዩ Asset ነው።' },
            { q:'11. Market Cap ምን ያሳያል?', opts:['የCoin ዋጋ ብቻ','Price × Circulating Supply — የCoin አጠቃላይ ዋጋ','Broker ኮሚሽን','SL ዋጋ'], correct:1, explain:'Market Cap = ዋጋ × Circulating Supply — Coin ምን ያህል ትልቅ እንደሆነ ያሳያል።' },
            { q:'12. Whale በCrypto ምን ማለት ነው?', opts:['ትንሽ ትሬደር','ትልቅ Crypto ሚሸዝ ይዞ ዋጋ ላይ ሊጽዕኖ ሊኖረው','Stable Coin','Exchange'], correct:1, explain:'Whale = ትልቅ Crypto ሚሸዝ ያለው አካል — ሽያጭ/ግዢ ዋጋ ሊነካ ይችላል።' },
            { q:'13. Bull Run ምን ማለት ነው?', opts:['ዋጋ ወደ ታች','ዋጋ ሰፊ ወደ ላይ ሄዶ ጊዜ','Stable Coin','Bearish ሁኔታ'], correct:1, explain:'Bull Run = Crypto ዋጋዎች ሰፊ ወደ ላይ ሄዶ ጊዜ — ብዙ ጊዜ Halving ተከትሎ ሊከሰት ይችላል።' },
            { q:'14. Bear Market ምን ማለት ነው?', opts:['ዋጋ ወደ ላይ','ዋጋዎች ሰፊ ወደ ታች ሄደው ጊዜ','Stable','NFT'], correct:1, explain:'Bear Market = ዋጋዎች ሰፊ ወደ ታች ሄደው ጊዜ — Crypto ዘወትር ጠንካራ Bear ይኖረዋል።' },
            { q:'15. Bitcoin Halving ምን ያደርጋል?', opts:['Supply ያሳድጋል','Miners ሚቀበሉ BTC ሽልማት በ50% ይቀንሳል','Blockchain ያፈርሳል','ዋጋ ዋስትና'], correct:1, explain:'Halving = ~4 ዓመት አንዴ Mining Reward ይቀnjoyሳል — Supply ቀነሰ ፣ Demand ቢጨምር ዋጋ ሊጨምር ይችላል።' },
            { q:'16. Binance ምን ዓይነት አገልግሎት ነው?', opts:['Wallet ብቻ','Centralized Crypto Exchange','DeFi ብቻ','Blockchain ፈጣሪ'], correct:1, explain:'Binance = ዓለም ትልቁ Centralized Crypto Exchange — Spot/Futures/P2P ያቀርባል።' },
            { q:'17. P2P Trading ምን ማለት ነው?', opts:['Exchange ብቻ','ሰው ለሰው ቀጥታ ግዢ/ሽያጭ','Futures','Stable Coin'], correct:1, explain:'P2P = Peer-to-Peer — ሰው ለሰው ቀጥታ Crypto ለFiat/ETB ይቀያየራሉ።' },
            { q:'18. Private Key ምን ያደርጋል?', opts:['Password ብቻ','Wallet ሙሉ ስልጣን — ቢጠፋ Asset ይጠፋሉ','Broker ፈቃድ','API Key ብቻ'], correct:1, explain:'Private Key = Wallet ፊርማ ቁልፍ ነው — ቢጠፋ ወይም ቢሰረቅ Asset ሊጠፋ ይችላል።' },
            { q:'19. Gas Fee ምን ማለት ነው?', opts:['Broker ኮሚሽን','Blockchain ትራንዛክሽን ለማስፈጸም የሚከፈል ክፍያ','Spread','SL ዋጋ'], correct:1, explain:'Gas Fee = Ethereum ና ሌሎች ዘዴዎች ትራንዛክሽን ለማስፈጸም Network ክፍያ ነው።' },
            { q:'20. Crypto ትሬዲንግ ሲጀምሩ ምን ቅድሚያ ያስፈልጋል?', opts:['ያለ እቅድ','Risk Management + ትምህርት + Demo','Signal ብቻ','ትልቅ Leverage'], correct:1, explain:'Crypto ቢዘመን ፣ ቢወርድ — Risk Management ካጣህ ካፒታልህ ሊጠፋ ይችላል።' },
            { q:'21. Long Position ምን ማለት ነው?', opts:['Sell ብቻ','ዋጋ ሊጨምር ብሎ Buy','SL','Hedge'], correct:1, explain:'Long = ዋጋ ወደ ላይ ሲጠብቅ ገዝቶ ወደፊት ሸጦ ትርፍ ለማግኘት።' },
            { q:'22. Short Position ምን ማለት ነው?', opts:['Buy','ዋጋ ሊወርድ ብሎ Sell','HODL','Stable Coin'], correct:1, explain:'Short = ዋጋ ወደ ታች ሲጠብቅ ሸጦ ዝቅ ሲል ገዝቶ ትርፍ ለማግኘት — Futures ያስፈልጋል።' },
            { q:'23. Liquidation ምን ማለት ነው?', opts:['ትርፍ ሰጠ','Margin ሲጠፋ Position ሲዘጋ','Account ሲከፈት','Spot ብቻ'], correct:1, explain:'Liquidation = Futures ላይ Margin ሲጠናቀቅ Position ሲዘጋ — Leverage ሲበዛ ሊጨምር ይችላል።' },
            { q:'24. Crypto Arbitrage ምን ማለት ነው?', opts:['Single Exchange ብቻ','ዋጋ ልዩነት ተጠቅሞ ትርፍ ለማግኘት','HODL','NFT'], correct:1, explain:'Arbitrage = Exchange A ላይ ሸጦ Exchange B ላይ ዋጋ ልዩነት ለማጠቃቀም — ፈጣን ነው ፣ ዋስትና የለም።' },
            { q:'25. Copy Trading ምን ማለት ነው?', opts:['ሁሉም ትርፍ ዋስትና','ሌላ ትሬደር ትሬዶችን ቀጥሎ ማደናቀፍ','Spot ብቻ','Demo ብቻ'], correct:1, explain:'Copy Trading = ሌላ ትሬደር ትሬዶቹን ፈቀድ ብሎ ቀጥሎ ማደናቀፍ — ኪሳራም ሊቀዳ ይችላል።' },
            { q:'26. RSI < 30 ምን ሊያጠቁም ይችላል?', opts:['Overbought','Oversold — ዋጋ ሊጨምር ሊችል','Session ጠፋ','Spread ጨምሯል'], correct:1, explain:'RSI < 30 Oversold ሊጠቁም ይችላል — ዋስትና አይሰጥም ። Market Structure ጋር ያጣምር።' },
            { q:'27. Candlestick Doji ምን ሊያጠቁም ይችላል?', opts:['ዋጋ ዋስትና','Open ≈ Close — ውሳኔ እጥረት','ሁሉም ትርፍ','ዋጋ ዜሮ'], correct:1, explain:'Doji = ገዢ/ሻጭ ሚዛን — ብቻውን ቀጣዩን አቅጣጫ አያረጋግጥም።' },
            { q:'28. Ethereum Smart Contract ምን ያደርጋል?', opts:['ዋጋ ሁልጊዜ ያቆማል','ሁኔታ ሲሟላ ራሱ ሚሰራ Code','Whale ብቻ','SL'], correct:1, explain:'Smart Contract = Ethereum ላይ ሁኔታ ሲሟላ ራሱ ሚፈጸም Code ነው — DeFi መሠረት ነው።' },
            { q:'29. DCA (Dollar Cost Averaging) ምን ማለት ነው?', opts:['አንዴ ብቻ ትልቅ ኢንቨስትመንት','በወቅታዊ ትንንሽ ግዢ Risk ለማሰራጨት','Futures ብቻ','SL ዘዴ'], correct:1, explain:'DCA = ወቅታዊ ትንሽ ትንሽ ስትገዛ ዋጋ Average ዝቅ ሊሆን ይችላል — ዋስትና አይሰጥም።' },
            { q:'30. Crypto ትሬዲንግ ዋና Risk ምንድን ነው?', opts:['ዋጋ ሁልጊዜ ይጨምራል','ዋጋ ፈጣን Volatility፣ Liquidity፣ Regulation Risk','Demo ብቻ','Stable Coin አለ'], correct:1, explain:'Crypto ከፍተኛ Volatility + Regulation + Liquidity Risk አለው — Risk Management ወሳኝ ነው።' }
        ]
    };

    // ── STATE ──────────────────────────────────────────────────
    var topic       = null;
    var questions   = [];
    var currentQ    = 0;
    var score       = 0;
    var quizActive  = false;

    // ── DOM helpers ────────────────────────────────────────────
    function $(id){ return document.getElementById(id); }

    function scrollChat(){
        var c = $('quizChat');
        if(c) c.scrollTop = c.scrollHeight;
    }

    function updateProgress(){
        var total = questions.length;
        var pct   = total ? Math.round((currentQ / total) * 100) : 0;
        var bar   = $('quizProgressBar');
        var cnt   = $('quizQCount');
        if(bar) bar.style.width = pct + '%';
        if(cnt) cnt.textContent = currentQ + ' / ' + total;
    }

    // Bot message with typing animation
    function botMsg(html, delay){
        delay = delay || 0;
        return new Promise(function(res){
            setTimeout(function(){
                var chat = $('quizChat');
                if(!chat){ res(); return; }
                // show typing
                var typing = document.createElement('div');
                typing.className = 'quiz-msg-bot quiz-typing';
                typing.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
                chat.appendChild(typing);
                scrollChat();
                setTimeout(function(){
                    chat.removeChild(typing);
                    var msg = document.createElement('div');
                    msg.className = 'quiz-msg-bot';
                    msg.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="quiz-bubble-bot">' + html + '</div>';
                    chat.appendChild(msg);
                    scrollChat();
                    res();
                }, 650);
            }, delay);
        });
    }

    // User message bubble
    function userMsg(html){
        var chat = $('quizChat');
        if(!chat) return;
        var msg = document.createElement('div');
        msg.className = 'quiz-msg-user';
        msg.innerHTML = '<div class="quiz-bubble-user">' + html + '</div>';
        chat.appendChild(msg);
        scrollChat();
    }

    // Clear options area
    function clearOpts(){ var o = $('quizOptions'); if(o) o.innerHTML = ''; }

    // ── LAUNCH — show quiz box ─────────────────────────────────
    window.launchQuiz = function(){
        var landing = $('quizLanding');
        var box     = $('quizBox');
        if(landing) landing.style.display = 'none';
        if(box)     box.style.display     = 'block';
        clearOpts();
        $('quizChat').innerHTML = '';
        updateProgress();
        startIntro();
    };

    // ── INTRO messages ─────────────────────────────────────────
    function startIntro(){
        botMsg('ሰላም! 👋 እኔ የታግ ብሪጅ ረዳት AI ቦት ነኝ።').then(function(){
            return botMsg('የወሰዱትን የፎሬክስ/ክሪፕቶ ትሬዲንግ መጽሃፍ በደንብ አንብበው፣ በMemo Account ተለማምደው እንዳጠናቀቁ ተስፋ እናደርጋለን! 📚', 200);
        }).then(function(){
            return botMsg('ፈተናውን ለመቀጠል — <strong>ስለ ፎሬክስ ትሬዲንግ ወይስ ክሪፕቶ ትሬዲንግ?</strong>', 300);
        }).then(function(){
            showTopicChoice();
        });
    }

    // ── TOPIC CHOICE ───────────────────────────────────────────
    function showTopicChoice(){
        var opts = $('quizOptions');
        if(!opts) return;
        opts.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'quiz-topic-wrap';
        wrap.innerHTML =
            '<button class="quiz-topic-btn t-forex" onclick="pickTopic(\'forex\')">' +
            '  <span class="t-icon">💱</span><span>ፎሬክስ ትሬዲንግ</span>' +
            '</button>' +
            '<button class="quiz-topic-btn t-crypto" onclick="pickTopic(\'crypto\')">' +
            '  <span class="t-icon">₿</span><span>ክሪፕቶ ትሬዲንግ</span>' +
            '</button>' +
            '<button class="quiz-topic-btn t-both" onclick="pickTopic(\'both\')">' +
            '  <span class="t-icon">🚀</span><span>ሁለቱም</span>' +
            '</button>';
        opts.appendChild(wrap);
    }

    window.pickTopic = function(t){
        clearOpts();
        topic = t;
        var label = t === 'forex' ? 'ፎሬክስ ትሬዲንግ 💱' :
                    t === 'crypto'? 'ክሪፕቶ ትሬዲንግ ₿' : 'ሁለቱም 🚀';
        userMsg(label);

        if(t === 'both'){
            questions = allQ.forex.concat(allQ.crypto);
        } else {
            questions = allQ[t].slice();
        }
        // shuffle
        questions = questions.sort(function(){ return Math.random() - 0.5; }).slice(0, 30);

        score = 0; currentQ = 0; quizActive = true;
        updateProgress();

        var msg = t === 'forex'  ? 'ጥሩ! 30 ጥያቄዎች ስለ ፎሬክስ ትሬዲንግ ።' :
                  t === 'crypto' ? 'ጥሩ! 30 ጥያቄዎች ስለ ክሪፕቶ ትሬዲንግ ።' :
                                   'ጥሩ! ሁለቱም ፎሬክስ + ክሪፕቶ 30 ጥያቄዎች ።';
        botMsg(msg + ' ለእያንዳንዱ A/B/C/D ምረጥ። ዝግጁ ነህ? 💪', 200).then(function(){
            askQuestion(0);
        });
    };

    // ── ASK QUESTION ───────────────────────────────────────────
    function askQuestion(idx){
        if(idx >= questions.length){ showResult(); return; }
        updateProgress();
        var q = questions[idx];
        var qText = '<span style="opacity:0.55;font-size:0.78rem;">ጥያቄ ' + (idx+1) + '/' + questions.length + '</span><br>' + q.q;
        botMsg(qText).then(function(){
            showOptions(q.opts, function(chosen, btn){
                // disable all
                var allBtns = $('quizOptions').querySelectorAll('.quiz-opt-btn');
                allBtns.forEach(function(b){ b.disabled = true; });
                var isOk = (chosen === q.correct);
                btn.classList.add(isOk ? 'correct' : 'wrong');
                if(!isOk) allBtns[q.correct].classList.add('correct');
                if(isOk) score++;
                var letter = ['A','B','C','D'][chosen];
                userMsg(letter + '. ' + q.opts[chosen]);
                var feedback = isOk
                    ? '✅ <strong>ትክክለኛ!</strong> ' + q.explain
                    : '❌ <strong>አልሆነም።</strong> ' + q.explain;
                botMsg(feedback, 350).then(function(){
                    clearOpts();
                    currentQ = idx + 1;
                    updateProgress();
                    askQuestion(currentQ);
                });
            });
        });
    }

    // ── OPTIONS ────────────────────────────────────────────────
    function showOptions(opts, onSelect){
        var container = $('quizOptions');
        container.innerHTML = '';
        opts.forEach(function(opt, i){
            var btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.innerHTML = '<strong>' + ['A','B','C','D'][i] + '.</strong> ' + opt;
            btn.onclick = function(){ onSelect(i, btn); };
            container.appendChild(btn);
        });
    }

    // ── RESULT ─────────────────────────────────────────────────
    function showResult(){
        clearOpts();
        var total = questions.length;
        var pct   = Math.round((score / total) * 100);
        var emoji, level, msg;
        if(pct >= 80){
            emoji = '🏆'; level = 'Pro Trader!';
            msg   = score + '/' + total + ' (' + pct + '%) — አስደናቂ ውጤት! ፕሮፌሽናል ደረጃ ነህ። ስትራቴጂህን ለማሻሻል Bundle መጽሃፍ ይጠቅምሃል።';
        } else if(pct >= 55){
            emoji = '📈'; level = 'Intermediate Trader';
            msg   = score + '/' + total + ' (' + pct + '%) — ጥሩ! የተሳሳቱትን ክለሳ አድርግ። ፎሬክስ ወይም ክሪፕቶ መጽሃፍ ሙሉ ተሞክሮ ይሰጥሃል።';
        } else {
            emoji = '🌱'; level = 'Beginner Trader';
            msg   = score + '/' + total + ' (' + pct + '%) — አሳዝኖ አይሆን! ሁሉም ከዜሮ ጀምሮ ነው። መጽሃፍቱ ሙሉ ዕውቀቱን ከዜሮ ያስተምርሃል።';
        }

        var chat = $('quizChat');
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
            var bar = document.getElementById('qResBar');
            if(bar) bar.style.width = pct + '%';
        }, 300);
        // update progress to 100%
        var pb = $('quizProgressBar');
        var qc = $('quizQCount');
        if(pb) pb.style.width = '100%';
        if(qc) qc.textContent = total + ' / ' + total;
    }

    // ── RETRY ──────────────────────────────────────────────────
    window.retryQuiz = function(){
        quizActive = false;
        topic = null; score = 0; currentQ = 0;
        var landing = $('quizLanding');
        var box     = $('quizBox');
        var chat    = $('quizChat');
        if(chat)    chat.innerHTML    = '';
        clearOpts();
        if(box)     box.style.display = 'none';
        if(landing){ landing.style.display = 'flex'; landing.style.flexDirection = 'column'; landing.style.alignItems = 'center'; }
        var pb = $('quizProgressBar');
        var qc = $('quizQCount');
        if(pb) pb.style.width = '0%';
        if(qc) qc.textContent = '0 / 0';
    };

    // legacy compat
    window.startQuiz = window.launchQuiz;

})();
