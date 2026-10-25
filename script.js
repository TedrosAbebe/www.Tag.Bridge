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
        // ── ምዕራፍ 1፦ የፎሬክስ መሠረታዊ እውቀት ──
        { q:'1. Forex ማለት ምንድን ነው?', opts:['የኩባንያዎች አክሲዮን መግዣና መሸጫ ገበያ','የተለያዩ አገራት ምንዛሬዎች የሚለወጡበት ገበያ','የዲጂታል ሳንቲሞች ብቻ የሚገበያዩበት ገበያ','የእቃዎች መገበያያ ገበያ'], correct:1, explain:'Forex = Foreign Exchange — የምንዛሬ ልውውጥ ገበያ ማለት ነው።' },
        { q:'2. የForex ገበያ ዋና ዓላማ ምንድን ነው?', opts:['ምንዛሬዎችን መለዋወጥና ከዋጋ ለውጥ ትርፍ ለማግኘት','በባንክ ብቻ ቁጠባ ማድረግ','ኩባንያ መመስረት','የመንግሥት ቦንድ ብቻ መግዛት'], correct:0, explain:'ተሳታፊዎች ምንዛሬዎችን ለመለዋወጥ ወይም ከዋጋ ለውጥ ትርፍ ለማግኘት ይገበያያሉ። ትርፍ ዋስትና የለውም።' },
        { q:'3. በEUR/USD ጥንድ ውስጥ Base Currency የትኛው ነው?', opts:['USD','EUR','GBP','JPY'], correct:1, explain:'በCurrency Pair ውስጥ በመጀመሪያ የሚቀመጠው Base Currency ነው — ስለዚህ EUR ነው።' },
        { q:'4. EUR/USD = 1.1000 ሲሆን ምን ማለት ነው?', opts:['1 USD = 1.10 EUR','1 EUR = 1.10 USD','1 EUR = 110 USD','1 USD = 110 EUR'], correct:1, explain:'1 EUR = 1.10 USD — Base currency አንድ ክፍል ምን ያህል Quote currency እንደሚዋጅ ያሳያል።' },
        { q:'5. Major Currency Pairs አብዛኛውን ጊዜ የሚጋሩት የትኛውን ምንዛሬ ነው?', opts:['Ethiopian Birr (ETB)','Chinese Yuan (CNY)','US Dollar (USD)','South African Rand (ZAR)'], correct:2, explain:'Major pairs USDን ያካትታሉ እና ከፍተኛ የግብይት ፈሳሽነት ሊኖራቸው ይችላል።' },
        { q:'6. Forex ገበያ Decentralized ነው ሲባል ምን ማለት ነው?', opts:['አንድ ማዕከላዊ ኤክስቼንጅ ብቻ ይቆጣጠረዋል','ሁሉም ዋጋዎች በአንድ ባንክ ይወሰናሉ','ግብይቶች በተለያዩ ተሳታፊዎችና መረቦች ይከናወናሉ፤ ማዕከላዊ ኤክስቼንጅ የለውም','ገበያው ምንም ዓይነት ደንብ የለውም'], correct:2, explain:'Decentralized = ግብይቶች በOTC (Over-the-Counter) የባንክና ዲልር መረቦች ይፈጸማሉ።' },
        { q:'7. OTC (Over-the-Counter) ግብይት ምንድን ነው?', opts:['በማዕከላዊ ኤክስቼንጅ ብቻ','በሁለት ወገኖች መካከል በቀጥታ ወይም በዲልር ኔትወርኮች','የገንዘብ ልውውጥ የሌለበት ግብይት','የክሪፕቶ ገበያ ብቻ'], correct:1, explain:'Forex በአብዛኛው OTC ሲሆን ግብይቶች በተለያዩ የባንክና ዲልር መረቦች ይከናወናሉ።' },
        { q:'8. Forex Broker ዋና ሚናው ምንድን ነው?', opts:['ትርፍ ዋስትና መስጠት','ገበያው የት እንደሚሄድ ማወቅ','የትሬዲንግ መለያና የግብይት አገልግሎት ማቅረብ','ሁሉንም ኪሳራ መክፈል'], correct:2, explain:'Broker ትዕዛዞችን ለማስፈጸምና የትሬዲንግ መለያ አገልግሎት ለማቅረብ ይረዳል።' },
        { q:'9. Demo Account ከLive Account የሚለየው እንዴት ነው?', opts:['Demo ላይ ሁልጊዜ ትርፍ ይገኛል','Live ላይ ኪሳራ አይኖርም','Demo ምናባዊ ገንዘብ፣ Live ደግሞ እውነተኛ ገንዘብ ይጠቀማል','ሁለቱም ተመሳሳይ ጫና አላቸው'], correct:2, explain:'Demo ለልምምድ ይጠቅማል፤ Live ላይ የገንዘብ አደጋና የስነ-ልቦና ጫና ይጨምራል።' },
        { q:'10. የForex ገበያ ዋና ተሳታፊዎች የትኞቹ ናቸው?', opts:['ማዕከላዊ ባንኮች ብቻ','የንግድ ባንኮች ብቻ','ኩባንያዎችና የችርቻሮ ነጋዴዎች ብቻ','ከላይ ያሉት ሁሉ'], correct:3, explain:'ባንኮች፣ ማዕከላዊ ባንኮች፣ ኩባንያዎች፣ ፈንዶችና ችርቻሮ ነጋዴዎች ሁሉ ይሳተፋሉ።' },
        // ── ምዕራፍ 2፦ የTrading መሠረታዊ ቃላት ──
        { q:'11. Bid Price ምንድን ነው?', opts:['ነጋዴው ምንዛሬውን ሊገዛበት የሚችለው ዋጋ ብቻ','ነጋዴው Sell የሚያደርግበት የBroker ዋጋ','የቀኑ ከፍተኛ ዋጋ','የመዝጊያ ዋጋ ብቻ'], correct:1, explain:'Bid = ነጋዴው ለBroker ሲሸጥ (Sell ሲያደርግ) ከBroker የሚያገኘው ዋጋ ነው።' },
        { q:'12. Ask Price ምንድን ነው?', opts:['ነጋዴው Buy የሚያደርግበት የBroker ዋጋ','የቀኑ ዝቅተኛ ዋጋ','የገበያው የመክፈቻ ዋጋ','የStop Loss ዋጋ'], correct:0, explain:'Ask = ነጋዴው ከBroker ሲገዛ (Buy ሲያደርግ) የሚከፍለው ዋጋ ነው።' },
        { q:'13. Spread እንዴት ይሰላል?', opts:['Bid + Ask','Ask − Bid','Ask × Bid','Bid ÷ Ask'], correct:1, explain:'Spread = Ask − Bid — ሁለቱ ዋጋዎች መካከል ያለ ልዩነት ሲሆን የBroker ክፍያ ተደርጎ ይወሰዳል።' },
        { q:'14. Bid=1.1000 Ask=1.1002 ከሆነ Spread ስንት ነው?', opts:['0.2 pip','2 pips','20 pips','200 pips'], correct:1, explain:'0.0002 ÷ 0.0001 = 2 pips። ለJPY ጥንዶች 1 pip = 0.01 ነው።' },
        { q:'15. በአብዛኛው የForex ጥንዶች 1 pip ስንት ነው?', opts:['0.01','0.0001','1.0000','0.1'], correct:1, explain:'ለአብዛኞቹ pairs 1 pip = 0.0001። ለJPY pairs ደግሞ 1 pip = 0.01 ነው።' },
        { q:'16. Lot Size ምንን ያመለክታል?', opts:['የገበያውን አቅጣጫ','የትሬድ መጠንን','የኢኮኖሚ ዕድገትን','የSpread መጠንን'], correct:1, explain:'Lot Size = ትሬዱ ምን ያህል የBase Currency ክፍል እንደያዘ ያሳያል።' },
        { q:'17. Standard Lot ምን ያህል ነው?', opts:['1,000','10,000','100,000','1,000,000'], correct:2, explain:'Standard Lot = 100,000 ክፍል። Mini = 10,000፤ Micro = 1,000 ናቸው።' },
        { q:'18. Leverage ምንድን ነው?', opts:['ትርፍ ዋስትና','ከካፒታል በላይ ገበያ ኤክስፖዠር ለማዝ','የዜና መለኪያ','የStop Loss ሌላ ስም'], correct:1, explain:'Leverage = ትንሽ ካፒታል ብዙ ትልቅ ፖዚሽን ለመከፈት ያስችላል። ትርፍም ኪሳራም ያበዛል።' },
        { q:'19. Margin ምንድን ነው?', opts:['ቦታ ለመክፈት እንደ ዋስትና የሚያስፈልግ ገንዘብ','የዕለት ትርፍ','የSpread ዋጋ','የባንክ ወለድ'], correct:0, explain:'Margin = ትሬደሩ ቦታ ለመክፈትና ለመያዝ Broker ጋር የሚያኖር ዋስትና ገንዘብ።' },
        { q:'20. 1:100 Leverage ቀላሉ ምሳሌ ምንድን ነው?', opts:['100 ዶላር ትርፍ ዋስትና','ለ100,000$ ኤክስፖዠር 1,000$ ማርጅን ሊያስፈልግ ይችላል','100 ትሬዶች ነፃ ናቸው','ኪሳራ ሊኖር አይችልም'], correct:1, explain:'ትክክለኛው ማርጅን በመሳሪያ፣ ኮንትራት መጠንና Broker ደንብ ይለያያል። ይህ ቀላል ምሳሌ ብቻ ነው።' },
        // ── ምዕራፍ 3፦ የገበያ አይነቶችና ትዕዛዞች ──
        { q:'21. Spot Forex Market ምንድን ነው?', opts:['ምንዛሬዎች በአሁኑ ዋጋ የሚገበያዩበት ገበያ','ከ10 ዓመት በኋላ ብቻ','የአክሲዮን ገበያ','የክሪፕቶ ብቻ'], correct:0, explain:'Spot Market = ምንዛሬዎች ወዲያውኑ (ወይም ጥቂት ቀናት ውስጥ) በወቅቱ ዋጋ ይወጣሉ።' },
        { q:'22. Market Order ምንድን ነው?', opts:['ወደፊት ዋጋ ብቻ','ወቅቱ ባለው ምርጥ ዋጋ ለመፈጸም ትዕዛዝ','ትዕዛዝ ሰርዣ','Stop Loss ዓይነት'], correct:1, explain:'Market Order = አሁን ባለው ዋጋ ወዲያው ለማስፈጸም ይላካል።' },
        { q:'23. Buy Limit Order መቼ ይጠቅማል?', opts:['ዋጋ ወደ ላይ ሲወጣ','ዋጋ ወደ ተወሰነ ዝቅተኛ ደረጃ ሲወርድ ለመግዛት','ትሬድ ለመዝጋት','ዋጋ ለመቀየር'], correct:1, explain:'Buy Limit = ዋጋ ወደ ታች ወርዶ ለወሰንከው ደረጃ ሲደርስ ትሬዱ ይከፈታል።' },
        { q:'24. Buy Stop Order ለምን ይጠቅማል?', opts:['ዋጋ ከተወሰነ ላይኛው ደረጃ ሲወጣ ለመግዛት','ዋጋ ሲወርድ ብቻ','ዜና ለማንበብ','ካፒታል ለማሳደግ'], correct:0, explain:'Buy Stop = ዋጋ ወደ ላይ ሰብሮ ለወሰንከው ደረጃ ሲደርስ ትሬዱ ይከፈታል — Breakout ትሬደሮች ይጠቀሙበታል።' },
        { q:'25. Stop Loss (SL) ዋና ዓላማው ምንድን ነው?', opts:['ትርፍ ማሳደግ','ትሬድ በተወሰነ ዋጋ ደረጃ ዘጋ ኪሳራን ለመገደብ','Spread ማጥፋት','Leverage ማሳደግ'], correct:1, explain:'SL = ዋጋ ተቃራኒ አቅጣጫ ሲሄድ ትሬዱን ዘግቶ ኪሳራን ይገድባል። Slippage ሊኖር ይችላል።' },
        { q:'26. Take Profit (TP) ምን ያደርጋል?', opts:['ትሬድን በተወሰነ ትርፍ ደረጃ ለመዝጋት ይረዳል','ዋጋ ይቀይራል','ካፒታል ያበዛል','ኪሳራ ወደ ትርፍ ይቀይራል'], correct:0, explain:'TP = ዋጋ ወደ ታለምከው ደረጃ ሲደርስ ትሬዱ ራሱ ዘግቶ ትርፍ ያስቆልፋል።' },
        { q:'27. Liquidity ምንን ያመለክታል?', opts:['የኢንተርኔት ፍጥነት','ንብረትን በቀላሉ ወደ ገንዘብ የመቀየርና የመገበያየት ችሎታ','የወለድ መጠን ብቻ','የመዝጊያ ሰዓት'], correct:1, explain:'ከፍተኛ Liquidity = ትሬዶች ቀላል፣ Spread ዝቅተኛ። ዝቅተኛ Liquidity = ትሬድ ፈጻሚ ያስቸግራል።' },
        { q:'28. Volatility ምንድን ነው?', opts:['የዋጋ ለውጥ መጠን ወይም ፍጥነት','Broker ስም','አካውንት ፓስዎርድ','የምንዛሬ ምልክት'], correct:0, explain:'ከፍተኛ Volatility = ዋጋ ፈጠን ብሎ ይቀያየራል። Risk እና Opportunity ሁለቱም ይጨምራሉ።' },
        { q:'29. Market Session ምን ማለት ነው?', opts:['የትሬደሩ እረፍት','የአንድ ማዕከል ንግድ በሚጨምርበት ጊዜ ክፍል','Stop Loss ደረጃ','ምንዛሬ ዋጋ'], correct:1, explain:'Sydney, Tokyo, London, New York — አራቱ ዋና sessions ናቸው።' },
        { q:'30. London እና New York sessions ሲደራረቡ ምን ሊከሰት ይችላል?', opts:['ገበያ ይዘጋል','የግብይት እንቅስቃሴና Liquidity ሊጨምር ይችላል','ሁሉም ዋጋ አንድ ይሆናል','Spread ዜሮ ይሆናል'], correct:1, explain:'Overlap ጊዜ ብዙ ተሳታፊዎች ስለሚገቡ EUR/USD ላይ እንቅስቃሴ ሊበዛ ይችላል።' },
        // ── ምዕራፍ 4፦ Risk Management እና Trading Psychology ──
        { q:'31. Risk Management ለምን አስፈላጊ ነው?', opts:['ኪሳራን ሙሉ ለማጥፋት','አደጋን ለመቆጣጠርና ካፒታልን ለመጠበቅ','ዋጋ ሁልጊዜ ለመገመት','ብዙ ትሬዶች ለመክፈት'], correct:1, explain:'Risk Management = ካፒታልህን ጠብቆ ረዘም ላለ ጊዜ ትሬዲንግ ለቀጥል — ሳይኖር ሁሉ ሊጠፋ ይችላል።' },
        { q:'32. Position Sizing ማለት ምንድን ነው?', opts:['ሰዓት መምረጥ','ትሬድ መጠን ከካፒታልና SL ጋር አዛምዶ መወሰን','Broker ስም','ዜና መተርጎም'], correct:1, explain:'Position Sizing = ትሬዱ ምን ያህል ትልቅ ቦታ ይያዝ? ካፒታልህ፣ SL ርቀት እና ሪስክ % ላይ ይተማሰናል።' },
        { q:'33. Risk:Reward Ratio = 1:2 ምን ማለት ነው?', opts:['የሚጋፈጠው 1 ክፍል ኪሳራ ሲሆን ዓላማ 2 ክፍል ትርፍ ነው','ሁለት ትሬዶች ማሸነፍ','ትርፍ ዋስትና','ሁለት አካውንቶች'], correct:0, explain:'R:R 1:2 = 100$ ሊጠፋ ሲችል 200$ ትርፍ ታለማለህ። ትርፍ ዋስትና አይሰጥም።' },
        { q:'34. FOMO ምንን ያመለክታል?', opts:['የፈሳሽነት መጠን','ያለ እቅድ ትርፍ ያመልጠኛል ብሎ ወደ ትሬድ መዝለቅ','ገበያ ሰዓት','ቻርት አይነት'], correct:1, explain:'FOMO = Fear Of Missing Out — ስሜታዊ ውሳኔ ስለሚሆን ብዙ ጊዜ ኪሳራ ያስከትላል።' },
        { q:'35. ኪሳራ ከደረሰ በኋላ ቁጣ ለመመለስ ብዙ ትሬዶች መክፈት ምን ይባላል?', opts:['Swing Trading','Risk Hedging','Revenge Trading','Fundamental Analysis'], correct:2, explain:'Revenge Trading = ስሜት ሲቆጣጠር የሚከናወን ትሬድ — ኪሳራን ሊያበዛ ይችላል።' },
        { q:'36. የTrading ዲሲፕሊን ምንን ይጠይቃል?', opts:['ሁሉም ትሬድ ትርፍ','እቅዱንና Risk ደንቡን በተከታታይ መከተል','ስትራቴጂ ደቂቃ ቀይር','ያለ SL ነግድ'], correct:1, explain:'ዲሲፕሊን = ስሜት ሳይሆን እቅድ መከተል። ትሬዲንግ ስኬት ዋና ምሰሶ ነው።' },
        { q:'37. Drawdown ምንድን ነው?', opts:['ካፒታል ወይም Equity ቀደም ከፍተኛ ደረጃ ሲቀነስ','ሰዓት','Spread','ትሬድ ብዛት'], correct:0, explain:'Drawdown = ካፒታልህ ከፍ ካለበት ደረጃ ምን ያህል ወደ ታች ወረደ — ሪስክ መለኪያ ነው።' },
        { q:'38. ካፒታልን ሙሉ ለሙሉ አደጋ ላይ ማዋል ለምን አደገኛ ነው?', opts:['ትርፍ ይቀንሳል','ተቃራኒ እንቅስቃሴ ሙሉ ኪሳራ ሊያስከትል ይችላል','Spread ዜሮ ይሆናል','ገበያ ይዘጋል'], correct:1, explain:'አንድ ትሬድ ሁሉ ሊቀጥፍ ይችላል — ሁልጊዜ ትሬድ ሀ ካፒታል ትንሽ ክፍል ብቻ አደጋ ላይ አቅም።' },
        { q:'39. ተከታታይ ኪሳራ ከደረሰ የLot መጠን ማሳደግ ትክክለኛ ዘዴ ነው?', opts:['አዎ ሁልጊዜ','አዎ ሁሉም ስትራቴጂ','አይደለም — ያለ እቅድ Lot ማሳደግ አደጋን ያበዛል','አዎ Demo ና Live ሁሉ'], correct:2, explain:'Martingale-style አሰራር ካፒታልን ሊጨርሰው ይችላል። ጊዜ ወስዶ ስትራቴጂ ገምግም።' },
        { q:'40. Trading Journal ዋና ጥቅሙ ምንድን ነው?', opts:['ዋጋ መቆጣጠር','ትሬዶችን፣ ስህተቶችን፣ ውሳኔ ሂደትን መመዝገብና መገምገም','ኪሳራ ይመልሳል','Broker ኮሚሽን ያጠፋል'], correct:1, explain:'Journal = ስህተቶችህን ለይቶ ስትራቴጂህን ለማሻሻል ዋናው መሳሪያ ነው።' },
        // ── ምዕራፍ 2፦ Market Structure ──
        { q:'51. Uptrend ምን ማለት ነው?', opts:['ዋጋ ሁልጊዜ ተመሳሳይ','Higher Highs እና Higher Lows','Lower Highs እና Lower Lows','ዋጋ አይንቀሳቀስም'], correct:1, explain:'Uptrend = ዋጋ ከቀድሞ High ከፍ (HH) እና ከቀድሞ Low ከፍ (HL) እየፈጠረ ይሄዳል።' },
        { q:'52. Downtrend የሚያመለክተው ምንድን ነው?', opts:['Higher Highs እና Higher Lows','ተመሳሳይ Highs','Lower Highs እና Lower Lows','ወደ ላይ ብቻ'], correct:2, explain:'Downtrend = Lower Highs (LH) እና Lower Lows (LL) — ዋጋ ደረጃ በደረጃ ወደ ታች ይወርዳል።' },
        { q:'53. Higher High (HH) ምንድን ነው?', opts:['አዲሱ High ከቀድሞ ዝቅ ሲል','አዲሱ Low ከቀድሞ ከፍ ሲል','አዲሱ High ከቀድሞ ከፍ ሲል','ዋጋ ያለ አቅጣጫ'], correct:2, explain:'HH = አዲሱ የዋጋ ከፍተኛ ነጥብ ከቀድሞ ከፍተኛ ነጥብ በላይ ሲሆን — Uptrend ምልክት ነው።' },
        { q:'54. Lower Low (LL) ምንድን ነው?', opts:['አዲሱ Low ከቀድሞ ዝቅ ሲል','አዲሱ High ከቀድሞ ከፍ ሲል','ዋጋ Resistance ሲነካ','ዋጋ ወደ ላይ ሲመለስ'], correct:0, explain:'LL = አዲሱ ዝቅተኛ ነጥብ ከቀድሞ ዝቅተኛ ነጥብ በታች ሲሆን — Downtrend ያጠናክራል።' },
        { q:'55. Market Structure Shift (MSS) ምን ሊያመለክት ይችላል?', opts:['ዋጋ ሁልጊዜ ወደ ላይ እንደሚሄድ','የገበያ አወቃቀር ሊቀየር እንደሚችል','ቮሊዩም መጥፋቱን','ሁሉም ትሬዶች ትርፋማ ናቸው'], correct:1, explain:'MSS = የቀድሞ አቅጣጫ ሊለወጥ እንደሚችል የሚጠቁም ምልክት ነው። ብቻውን አያረጋግጥም።' },
        { q:'56. Break of Structure (BOS) ምን ማለት ነው?', opts:['ዋጋ እንዳይንቀሳቀስ','ዋጋ አስፈላጊ Swing High/Low ሲሰብር','Account ባላንስ ሲጨምር','Session ሲጨርስ'], correct:1, explain:'BOS = ዋጋ ቀደም ያለ Swing High ወይም Low ሲሰብር — የመዋቅር ለውጥ ምልክት።' },
        { q:'57. Range-Bound Market ምንድን ነው?', opts:['ወደ ላይ ብቻ','ወደ ታች ብቻ','Support እና Resistance መካከል ሲወዛወዝ','ገበያ ሲዘጋ'], correct:2, explain:'Range = ዋጋ ግልጽ Trend ሳይኖር በተወሰነ ዞን ውስጥ ይወዛወዛል — Breakout ሊከሰት ይችላል።' },
        // ── ምዕራፍ 3፦ Support and Resistance ──
        { q:'58. Support ምንድን ነው?', opts:['ዋጋ ሁልጊዜ የሚወርድበት','የግዢ ፍላጎት ሊጨምርና ዋጋ ሊደገፍ የሚችልበት ዞን','Broker ኮሚሽን','Stop Loss መጠን'], correct:1, explain:'Support = Buyers ሊጠናከሩ የሚችሉበት ዞን። ዋጋ ሊሰብረው ይችላል — ዋስትና የለውም።' },
        { q:'59. Resistance ምንድን ነው?', opts:['የሽያጭ ግፊት ሊጨምርና ዋጋ ሊዘገይ የሚችልበት ዞን','ሰዓት','Account ባላንስ','ዋጋ መለኪያ'], correct:0, explain:'Resistance = Sellers ሊጠናከሩ የሚችሉበት ዞን። ሊሰበር ይችላል — Breakout ሊፈጠር ይችላል።' },
        { q:'60. Resistance ከተሰበረ Support ሊሆን ይችላል?', opts:['አይችልም','አዎ አንዳንድ ጊዜ (Role Reversal)','ሁልጊዜ ይሆናል','በForex ብቻ'], correct:1, explain:'Role Reversal = ቀድሞ Resistance የነበረ ዞን ከተሰበረ በኋላ Support ሊሆን ይችላል — ሁልጊዜ አይደለም።' },
        { q:'61. Support/Resistance ዞን አድርጎ ማየት ለምን ይጠቅማል?', opts:['ዋጋ ሁልጊዜ አንድ ነጥብ ላይ ስለሚቆም','ዋጋ አካባቢ ሊወዛወዝ ስለሚችል','ዞኖች SL አያስፈልጋቸውም','100% ያረጋግጣሉ'], correct:1, explain:'ዋጋ ትክክለኛ ነጥብ ሳይሆን ዞን ላይ ሊደገፍ ይችላል — ስለዚህ ዞን አድርጎ ማቀድ ተግባራዊ ነው።' },
        { q:'62. Support ላይ ዋጋ ሲመለስ ብቻ Buy ለመግባት በቂ ነው?', opts:['አዎ ሁልጊዜ','አይደለም — Market Structure፣ ማረጋገጫ፣ Risk መፈተሽ ያስፈልጋል','አዎ Bitcoin ላይ ብቻ','አይደለም — Support ላይ Sell ብቻ'], correct:1, explain:'Support ብቻ አይበቃም — Higher TF አቅጣጫ፣ Candlestick confirmation፣ R:R ሁሉ ማየት ያስፈልጋል።' },
        // ── ምዕራፍ 4፦ Candlestick Analysis ──
        { q:'63. Candlestick Body ምን ያሳያል?', opts:['Open እና Close ዋጋ','ሰዓት ብቻ','Broker ትርፍ','Account መጠን'], correct:0, explain:'Body = Open እና Close ዋጋ ይወክላል። ቀለሙ ዋጋ ከፍ ወይም ዝቅ ብሎ መዝጋቱን ያሳያል።' },
        { q:'64. Candlestick Wick/Shadow ምን ያሳያል?', opts:['ካፒታሉን','Body ውጭ የደረሰ High እና Low ዋጋ','ኮሚሽን','ወደፊቱን ዋጋ ዋስትና'], correct:1, explain:'Wick = ሻማው Body ከፍ/ዝቅ ካለ ዋጋ ጋር ያለ ርቀት ይወክላል — ዋጋ Rejection ሊያሳይ ይችላል።' },
        { q:'65. Bullish Engulfing ምን ሊያመለክት ይችላል?', opts:['ዋጋ ሁልጊዜ ይወርዳል','Bullish ግፊት ሊጨምር ይችላል','Account ተዘጋ','እንቅስቃሴ የለም'], correct:1, explain:'Bullish Engulfing = ትንሽ Bearish Candle ተከትሎ Body ቀድሞውን የሚሸፍን Bullish Candle — Support አካባቢ ሲታይ ትርጉም ይጨምራል።' },
        { q:'66. Bearish Engulfing ምን ሊያመለክት ይችላል?', opts:['Bearish ግፊት ሊጨምር ይችላል','ዋጋ ሁልጊዜ ይጨምራል','Spread ይጠፋል','Session ይጀምራል'], correct:0, explain:'Bearish Engulfing = Resistance አካባቢ ሲታይ የሽያጭ ግፊት ሊጠናከር ይችላል — Market Structure ጋር ማጣመር ያስፈልጋል።' },
        { q:'67. Doji Candle ምን ሊያመለክት ይችላል?', opts:['ወደ ላይ ዋስትና','Open እና Close ተቀራራቢ — የውሳኔ እጥረት','ሁሉም ትርፍ አገኙ','ገበያ ተዘጋ'], correct:1, explain:'Doji = Open ≈ Close — ገዢዎችና ሻጮች ሚዛናቸው ሲጠጋጋ ይሠራል። ብቻውን ሊቀጥሉ የሚሆነውን አያረጋግጥም።' },
        { q:'68. Pin Bar ምን መረጃ ሊሰጥ ይችላል?', opts:['ዋጋ ሊመለስ ወይም Rejection ሊኖር ይችላል','ትርፍ ተረጋገጠ','SL አያስፈልግም','ዋጋ አይንቀሳቀስም'], correct:0, explain:'Pin Bar = ረጅም Wick ያለው Candle — ዋጋ ሊመለስ ይችላል ይላል። ቦታና አውድ ወሳኝ ናቸው።' },
        { q:'69. Candlestick Analysis ትክክለኛ አቀራረብ የትኛው ነው?', opts:['አንድ Candle ብቻ ተመልክቶ ትሬድ','Pattern + Market Structure + Risk አጣምሮ ማየት','ትልቁ Candle ሲታይ ሁልጊዜ','Wick የሌለው ብቻ'], correct:1, explain:'Candle Pattern ብቻ አይበቃም — Market Structure፣ S/R ዞን፣ Risk Management ጋር አጣምሮ ማየት ያስፈልጋል።' },
        { q:'70. M5 ላይ Bullish Pattern ታየ ግን Higher TF Downtrend ነው — ምን ትደርጋለህ?', opts:['Buy ሁልጊዜ','Higher TF ችላ','ሁለቱን ማጥናት፣ ማረጋገጫ፣ ወይም ትሬዱን መተው','SL ሳይጠቀም Buy'], correct:2, explain:'Higher TF Downtrend ሲሆን M5 Bullish Signal ብቻ ሊያሳስት ይችላል — Confirmation ጠብቅ ወይም ተው።' },
        // ── ምዕራፍ 5፦ Liquidity ──
        { q:'71. Liquidity በTrading ምንድን ነው?', opts:['ቻርት ቀለም','ንብረትን በቀላሉ መግዛትና መሸጥ፤ SMC ውስጥ Stop Orders ሊሰበሰቡ ዞኖችም ይባላል','Account ትርፍ','Stop Loss ዋጋ'], correct:1, explain:'Liquidity = መሸጥና መግዛት ቀላል ሁኔታ። SMC ውስጥ Stop Orders ባሉ ዞን ሊሰበሰብ ይችላል ሲባልም ይጠቀምበታል።' },
        { q:'72. Buy-Side Liquidity (BSL) ብዙ ጊዜ የት ይገኛል?', opts:['ከSwing Highs/Equal Highs በላይ','ከLows በታች ብቻ','Account ውስጥ','Candle መካከል'], correct:0, explain:'BSL = ከቀድሞ Swing Highs ወይም Equal Highs በላይ — Buy Stop Orders ሊከማቹ ይችላሉ።' },
        { q:'73. Sell-Side Liquidity (SSL) ብዙ ጊዜ የት ይገኛል?', opts:['ከSwing Highs በላይ','ከEqual Lows/Swing Lows በታች','Candle Open ላይ ብቻ','Resistance በላይ'], correct:1, explain:'SSL = ከቀድሞ Lows በታች — Long ትሬደሮች SL እና Sell Stop Orders ሊኖሩ ይችላሉ።' },
        { q:'74. Equal Highs ለምን SMC ትንተና ውስጥ አስፈላጊ ናቸው?', opts:['ዋጋ ከዚያ በላይ አይሄድም','ከእነሱ በላይ BSL ሊኖር ስለሚችል','100% አቅጣጫ ያሳያሉ','ሁልጊዜ OB ናቸው'], correct:1, explain:'Equal Highs = ብዙ ትሬደሮች SL ሊያስቀምጡ ስለሚችሉ BSL ሊሰበሰብ ይችላል። ዋስትና አይሰጥም።' },
        { q:'75. Equal Lows ምን ሊያመለክቱ ይችላሉ?', opts:['ከእነሱ በታች SSL ሊኖር ይችላል','ዋጋ ወደ ላይ ዋስትና','ገበያ ተዘጋ','Spread ይጠፋል'], correct:0, explain:'Equal Lows = ከተመሳሳይ Low ነጥቦች በታች SSL ሊሰበሰብ ይችላል — Liquidity ትንተና ዋና ቦታ ነው።' },
        // ── ምዕራፍ 6፦ Liquidity Sweep & Stop Hunt ──
        { q:'76. Liquidity Sweep ምንድን ነው?', opts:['ዋጋ High/Low ሰብሮ Liquidity ወስዶ ሊመለስ የሚችል እንቅስቃሴ','Account ማጽዳት','ሁሉም ትሬዶች መዝጋት','Candle ቀለም'], correct:0, explain:'Sweep = ዋጋ ደረጃ ሰብሮ SL/Orders ካነቃ በኋላ ሲመለስ — መምለሱ ማረጋገጫ ያስፈልጋል።' },
        { q:'77. ዋጋ Equal Highs ሰብሮ ወዲያውኑ ወደ ታች ተመለሰ — ምን ሊሆን ይችላል?', opts:['Bullish Continuation ብቻ','BSL Sweep + Bearish Rejection','Account ተዘጋ','ለውጥ የለም'], correct:1, explain:'Equal Highs ሰብሮ ሲመለስ BSL Sweep ሊሆን ይችላል — Market Structure ማረጋገጫ ያስፈልጋል።' },
        { q:'78. ዋጋ Previous Low ሰብሮ ወደ ላይ ተመለሰ — ምን ሊሆን ይችላል?', opts:['SSL Sweep + Bullish Rejection','Downtrend Continuation ዋስትና','Spread ጨምሯል','ገበያ ተዘጋ'], correct:0, explain:'Previous Low ሰብሮ ሲመለስ SSL Sweep ሊሆን ይችላል — TF ማረጋገጫ + MSS ያስፈልጋል።' },
        { q:'79. Stop Hunt ምንን ያመለክታል?', opts:['Broker ሁልጊዜ ሆን ብሎ SL ይመታል','ዋጋ SL ሊኖሩ በሚችሉ ዞን ሄዶ Orders ሊያነቃ የሚችልበት ሁኔታ','ትሬድ መዝጊያ ብቻ','ትንተና ዘዴ አይደለም'], correct:1, explain:'Stop Hunt = ዋጋ ብዙ SL ሊኖሩ ወደሚችሉ ዞን ሄዶ ሲያነቃ — ሁሉም Broker ማታለያ ነው ማለት አይደለም።' },
        { q:'80. Liquidity Sweep vs Breakout — ዋናው ልዩነት ምንድን ነው?', opts:['ሁለቱ አንድ ናቸው','Breakout ቀጥሎ ሊሄድ ሲችል Sweep ሰብሮ ሊመለስ ይችላል','Sweep ክሪፕቶ ብቻ','Breakout ሁልጊዜ ስህተት'], correct:1, explain:'Breakout = ሰብሮ ቀጠለ። Sweep = ሰብሮ ተመለሰ። የቀጣይ Price Action ብቻ ሊናገር ይችላል።' },
        // ── ምዕራፍ 7፦ Order Block & FVG ──
        { q:'81. Order Block (OB) SMC ውስጥ ምንድን ነው?', opts:['ማንኛውም Candle','ከጠንካራ እንቅስቃሴ በፊት ያለ ዞን፣ ሊኖር የሚችል Demand/Supply ዞን','Account መጠን','Broker ሁኔታ'], correct:1, explain:'OB = ከጠንካራ ወደ ላይ/ታች እንቅስቃሴ በፊት ያለ ዞን ነው። Institutional Order ዋስትና አይሰጥም።' },
        { q:'82. Bullish Order Block እንዴት ይለያል?', opts:['ከጠንካራ ወደ ላይ እንቅስቃሴ በፊት ያለ Bearish Candle/ዞን','ወደ ታች ከሄደ በኋላ ብቻ','ሁሉም Green Candle','Previous High ብቻ'], correct:0, explain:'Bullish OB = ወደ ላይ ጠንካራ እንቅስቃሴ ከመጀመሩ በፊት ያለ ቀይ Candle ወይም ዞን ነው።' },
        { q:'83. Bearish Order Block እንዴት ይለያል?', opts:['ከጠንካራ ወደ ታች እንቅስቃሴ በፊት ያለ Bullish Candle/ዞን','ሁሉም Bearish Candle','Account Loss','Previous Low ብቻ'], correct:0, explain:'Bearish OB = ወደ ታች ጠንካራ እንቅስቃሴ ከመጀመሩ በፊት ያለ አረንጓዴ Candle ወይም ዞን ነው።' },
        { q:'84. ዋጋ OB ደረሰ — ወዲያው ትሬድ ትከፍታለህ?', opts:['አዎ ሁልጊዜ','አይደለም — ምላሽ፣ MSS፣ Risk ማረጋገጥ ያስፈልጋል','አዎ Gold ብቻ','አይደለም — OB ዋጋ ሁልጊዜ ይሰብራል'], correct:1, explain:'OB ደርሶ ብቻ አይበቃም — Rejection ምልክት፣ LTF MSS ወይም Plan ውስጥ ያለ Trigger ይጠብቅ።' },
        { q:'85. Fair Value Gap (FVG) ምንድን ነው?', opts:['3 Candles ውስጥ 1ኛና 3ኛ Wick የማይደራረቡ ዞን','Broker ክፍያ','ሁሉም ዋጋ ጭማሪ','SL መጠን'], correct:0, explain:'FVG = 3-Candle setup — 1ኛ High < 3ኛ Low (Bullish) ወይም 1ኛ Low > 3ኛ High (Bearish)።' },
        { q:'86. Bullish FVG ምን ያሳያል?', opts:['1ኛ Candle High < 3ኛ Candle Low — ዋጋ ሊሞላ ሊመለስ ይችላል','ዋጋ ሁልጊዜ ይወርዳል','ገበያ ይዘጋል','ኮሚሽን ይቀንሳል'], correct:0, explain:'Bullish FVG = ወደ ላይ ጠንካራ እንቅስቃሴ ወቅት ዞን ሲፈጠር — ዋጋ ሊሞላ ሊመለስ ይችላል።' },
        { q:'87. Bearish FVG ምን ያሳያል?', opts:['1ኛ Candle Low > 3ኛ Candle High — ዋጋ ሊሞላ ሊመለስ ይችላል','ዋጋ ሁልጊዜ ይጨምራል','Account ትርፍ','ሁሉም Candle አንድ ቀለም'], correct:0, explain:'Bearish FVG = ወደ ታች ጠንካራ እንቅስቃሴ ወቅት ይፈጠራል። Sell Setup ለሚፈልጉ ዞን ሊሆን ይችላል።' },
        { q:'88. FVG ተሞላ — ቀጣይ አቅጣጫ ምንድን ነው?', opts:['ወደ ላይ ብቻ','ወደ ታች ብቻ','ሊገመት አይችልም — ማረጋገጫ ያስፈልጋል','ገበያ ይዘጋል'], correct:2, explain:'FVG መሙላት ብቻ አቅጣጫ አያረጋግጥም — Market Structure፣ Liquidity፣ Price Action ሁሉ ማየት ያስፈልጋል።' },
        // ── ምዕራፍ 8፦ Inducement & Confirmation ──
        { q:'89. Inducement SMC ውስጥ ምን ለመግለጽ ይጠቅማል?', opts:['ትሬደሮችን ቀድሞ ሊስብ የሚችል የዋጋ አወቃቀር','Account ማስከፈቻ','Platform ስም','ወለድ'], correct:0, explain:'Inducement = ቀድሞ እንዲገቡ ሊያስቸኩለ የሚችል ምልክት — ሁሉም SMC ዘዴ አንድ ትርጉም አይጠቀምም።' },
        { q:'90. SSL Sweep + Bullish MSS M5 ላይ ታየ — ቀጥሎ ምን ታደርጋለህ?', opts:['ሳይመረምር ትልቅ Lot Buy','ማረጋገጫ ችላ Sell','Higher TF Bias + Entry + SL + R:R + Position Size ሁሉ መወሰን','SL ሳይጠቀም Buy'], correct:2, explain:'Setup ቢታይ — Higher TF Bias፣ Entry Trigger፣ SL፣ Position Size፣ R:R ሁሉ ካልተወሰኑ ትሬድ አትክፈት።' },
        // ── TA (ጥያቄ 41–50 ቁጥሮች) ──
        { q:'41. Technical Analysis ምንድን ነው?', opts:['ቻርት ወይም ዋጋ ውሂብ ተጠቅሞ ገበያ የመተንተን ዘዴ','አገር ሕግ ማጥናት','ወለድ ብቻ','አካውንት ሚዛን ማየት'], correct:0, explain:'TA = ያለፈ የዋጋ እንቅስቃሴ ቅጦች ወደፊቱን ሊጠቁሙ ይችላሉ ብሎ ይተናተናል።' },
        { q:'42. Candlestick Chart ምን መረጃ ይሰጣል?', opts:['Open, High, Low, Close (OHLC)','አገር ስም ብቻ','Broker ስም ብቻ','ትሬደር ዕድሜ'], correct:0, explain:'OHLC = ሻማው ሲከፈት፣ ከፍተኛ፣ ዝቅተኛ፣ ሲዘጋ ያለ ዋጋ ሁሉ ያሳያል።' },
        { q:'43. Timeframe ምንን ያሳያል?', opts:['ትሬደር ዕድሜ','እያንዳንዱ ሻማ የሚወክለው የጊዜ ርዝመት','Spread','Leverage'], correct:1, explain:'M1 = 1 ደቂቃ፤ H1 = 1 ሰዓት፤ D1 = አንድ ቀን — ተሞክሮህ ይወስናል።' },
        { q:'44. Uptrend ምን ይለያዋል?', opts:['Lower Highs እና Lower Lows','Higher Highs እና Higher Lows','ዋጋ አይንቀሳቀስም','ሁሉም ሻማ ተመሳሳይ'], correct:1, explain:'Uptrend = ዋጋ ደረጃ በደረጃ ወደ ላይ — Higher Highs (HH) እና Higher Lows (HL) ይሠራሉ።' },
        { q:'45. Downtrend ምን ይለያዋል?', opts:['Higher Highs እና Higher Lows','Lower Highs እና Lower Lows','እንቅስቃሴ አለ','ዜና ይቀልጣል'], correct:1, explain:'Downtrend = ዋጋ ደረጃ በደረጃ ወደ ታች — Lower Highs (LH) እና Lower Lows (LL) ይሠራሉ።' },
        { q:'46. Support Level ምንድን ነው?', opts:['ዋጋ መውረድ ሊዘገይ ወይም ወደ ላይ ሊመለስ የሚችልበት አካባቢ','ዋጋ ሊቆምበት ዋስትና ያለው ደረጃ','Broker አገልግሎት','አካውንት ሚዛን'], correct:0, explain:'Support = Buyers ሊጨምሩ የሚችሉበት ዞን። ዋስትና አይሰጥም — ሊሰበር ይችላል።' },
        { q:'47. Resistance Level ምንድን ነው?', opts:['ዋጋ ሁልጊዜ ሲወርድ ዋስትና','ዋጋ መጨመር ሊዘገይ ወይም ሊመለስ የሚችልበት አካባቢ','Stop Loss ሌላ ስም','Leverage'], correct:1, explain:'Resistance = Sellers ሊጨምሩ የሚችሉበት ዞን። ሊሰበር ይችላል — Breakout ሊፈጠር ይችላል።' },
        { q:'48. Moving Average ምን ያደርጋል?', opts:['ዋጋ አለስልሶ አጠቃላይ አዝማሚያ ለማሳየት','Broker ፈቃድ','ትሬድ ለመወሰን','Spread ለማጥፋት'], correct:0, explain:'MA = ዋጋ ሸካሪ ነጥቦችን ሰርቆ ለስላሳ መስመር ያሳያል — አዝማሚያ ለማወቅ ይጠቅማል።' },
        { q:'49. RSI ምን ሊያሳይ ይረዳል?', opts:['አካውንት ሚዛን','የዋጋ ጥንካሬ፣ Overbought ወይም Oversold ሁኔታ','Broker ኮሚሽን ብቻ','GDP ቀጥታ'], correct:1, explain:'RSI > 70 = ሊሸጥ ይቻላል (Overbought)፤ RSI < 30 = ሊገዛ ይቻላል (Oversold)። ዋስትና አይሰጥም።' },
        { q:'50. Live Trading ከመጀመርህ በፊት የትኛው አቀራረብ ተገቢ ነው?', opts:['ያለ እቅድ','ሲግናሎች ብቻ ተከተል','መሠረት ተማር፣ Demo ለምምድ፣ ስትራቴጂ ፈትሽ፣ Risk ደንብ አዘጋጅ','ከፍተኛ Leverage ጠቀም'], correct:2, explain:'ትምህርት + ልምምድ + ዲሲፕሊን + Risk Management = ትሬዲንግ መሠረት። ትርፍ ዋስትና የለውም።' }
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

        botMsg('ሰላም! 👋 እንኳን ወደ THE FOREX BRIDGE ፈተና በደህና መጡ! 🎯').then(function() {
            return botMsg('50 ጥያቄዎች አሉ — ከጀማሪ እስከ ፕሮፌሽናል። ለእያንዳንዱ A/B/C/D ምረጥ። 🚀', 300);
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
