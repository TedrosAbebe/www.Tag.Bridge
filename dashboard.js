/**
 * TAG BRIDGE — Trading Ecosystem Dashboard
 * dashboard.js v2.0
 * Uses: CoinGecko (free), Alternative.me (Fear & Greed), TradingView (free widgets)
 */

'use strict';

// ══════════════════════════════════════════════
//  1. THEME & LANGUAGE
// ══════════════════════════════════════════════

let currentTheme = localStorage.getItem('tb-theme') || 'dark';
let currentLang  = localStorage.getItem('tb-lang')  || 'am';

function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('tb-theme', t);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
}

function applyLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-am],[data-en]').forEach(el => {
        const txt = el.getAttribute('data-' + lang);
        if (txt) el.innerHTML = txt;
    });
    const btn = document.getElementById('langLabel');
    if (btn) btn.textContent = lang === 'am' ? 'አማ' : 'EN';
    localStorage.setItem('tb-lang', lang);
}

function toggleLang() {
    applyLang(currentLang === 'am' ? 'en' : 'am');
}

function setActiveNav(el) {
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
}

function toggleMobileMenu() {
    const wrap = document.getElementById('navLinksWrap');
    const btn  = document.getElementById('mobileMenuBtn');
    wrap.classList.toggle('mobile-open');
    btn.classList.toggle('open');
}

function togglePanel(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? '' : 'none';
    btn.classList.toggle('collapsed');
}

// ══════════════════════════════════════════════
//  2. SCROLL EFFECTS
// ══════════════════════════════════════════════

function initScrollEffects() {
    const progress = document.getElementById('scrollProgress');
    const backTop  = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (progress) progress.style.width = Math.min(pct, 100) + '%';
        if (backTop) backTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
}

// ══════════════════════════════════════════════
//  3. HERO PARTICLES
// ══════════════════════════════════════════════

function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({length:55}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        dx: (Math.random()-0.5)*0.35, dy: (Math.random()-0.5)*0.35,
        a: Math.random()*0.5+0.1
    }));
    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pts.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(99,102,241,${p.a})`; ctx.fill();
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(draw);
    })();
}

// ══════════════════════════════════════════════
//  4. LIVE MARKET DATA (CoinGecko FREE API)
// ══════════════════════════════════════════════

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const COIN_MAP = {
    bitcoin:     { tickId:'tick-btc',  mcId:'mc-btc',  spId:'sp-btc'  },
    ethereum:    { tickId:'tick-eth',  mcId:'mc-eth',  spId:'sp-eth'  },
    binancecoin: { tickId:'tick-bnb',  mcId:'mc-bnb',  spId:'sp-bnb'  },
    solana:      { tickId:'tick-sol',  mcId:'mc-sol',  spId:'sp-sol'  },
    ripple:      { tickId:'tick-xrp',  mcId:'mc-xrp',  spId:'sp-xrp'  }
};

const COIN_ICONS = {
    bitcoin:'₿',ethereum:'Ξ',binancecoin:'B',solana:'◎',ripple:'✕',
    cardano:'₳',polkadot:'●',dogecoin:'Ð',avalanche:'△',chainlink:'⬡',
    'shiba-inu':'🐕',litecoin:'Ł',tron:'T',stellar:'★',monero:'ɱ'
};

function fmt$(n) {
    if (n == null) return '--';
    if (n >= 1000) return '$'+n.toLocaleString('en-US',{maximumFractionDigits:0});
    if (n >= 1)    return '$'+n.toFixed(4);
    return '$'+n.toFixed(6);
}

function fmtChg(n) {
    if (n == null) return '--';
    return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function drawSparkline(canvasId, prices, isUp) {
    const c = document.getElementById(canvasId);
    if (!c || !prices || prices.length < 2) return;
    const ctx = c.getContext('2d'), w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...prices), max = Math.max(...prices), rng = max - min || 1;
    const pts = prices.map((v,i) => ({ x:(i/(prices.length-1))*w, y:h-((v-min)/rng)*(h-4)-2 }));
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, isUp ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fill();
}

function updateTickerItem(id, price, chg) {
    const el = document.getElementById(id);
    if (!el) return;
    const pe = el.querySelector('.tick-price'), ce = el.querySelector('.tick-chg');
    if (pe) pe.textContent = price != null ? fmt$(price) : '--';
    if (ce) { ce.textContent = chg != null ? fmtChg(chg) : ''; ce.className = 'tick-chg '+(chg >= 0 ? 'up' : 'down'); }
}

function updateMarketCard(mcId, spId, coin) {
    const card = document.getElementById(mcId);
    if (!card) return;
    card.classList.remove('loading');
    const isUp = coin.price_change_percentage_24h >= 0;
    card.classList.toggle('up', isUp); card.classList.toggle('down', !isUp);
    const pe = card.querySelector('.mc-price'), ce = card.querySelector('.mc-change');
    if (pe) pe.textContent = fmt$(coin.current_price);
    if (ce) { ce.textContent = fmtChg(coin.price_change_percentage_24h); ce.className = 'mc-change '+(isUp?'up':'down'); }
    if (coin.sparkline_in_7d?.price) {
        const raw = coin.sparkline_in_7d.price;
        const step = Math.max(1, Math.floor(raw.length/40));
        drawSparkline(spId, raw.filter((_,i)=>i%step===0), isUp);
    }
}

async function fetchCoins() {
    try {
        const ids = 'bitcoin,ethereum,binancecoin,solana,ripple';
        const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
        const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
        return res.ok ? res.json() : null;
    } catch(e) { return null; }
}

async function fetchTopMovers() {
    try {
        const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
        const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
        return res.ok ? res.json() : null;
    } catch(e) { return null; }
}

async function fetchFearGreed() {
    try {
        const res = await fetch('https://api.alternative.me/fng/', { signal: AbortSignal.timeout(6000) });
        const d = await res.json();
        return d.data?.[0] || null;
    } catch(e) { return null; }
}

async function refreshMarketData() {
    const coins = await fetchCoins();
    if (!coins) return;
    coins.forEach(c => {
        const m = COIN_MAP[c.id];
        if (!m) return;
        updateTickerItem(m.tickId, c.current_price, c.price_change_percentage_24h);
        updateMarketCard(m.mcId, m.spId, c);
    });
    duplicateTicker();
}

function duplicateTicker() {
    const track = document.getElementById('tickerItems');
    if (!track || track.dataset.doubled) return;
    track.innerHTML += track.innerHTML;
    track.dataset.doubled = '1';
}

async function refreshMovers() {
    const coins = await fetchTopMovers();
    if (!coins) return;
    const sorted = [...coins].sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    renderMovers('moversList', sorted.slice(0,5));
    renderMovers('marketCapList', coins.slice(0,5), true);
}

function renderMovers(id, coins, showMcap) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = coins.map((c,i) => {
        const chg = c.price_change_percentage_24h;
        const up  = chg >= 0;
        const val = showMcap ? '$'+(c.market_cap/1e9).toFixed(1)+'B' : fmtChg(chg);
        return `<div class="mover-item">
            <span class="mover-rank">${i+1}</span>
            <span class="mover-icon">${COIN_ICONS[c.id]||'●'}</span>
            <div><div class="mover-name">${c.symbol.toUpperCase()}</div><div class="mover-sym">${c.name}</div></div>
            <span class="mover-chg ${up?'up':'down'}">${val}</span>
        </div>`;
    }).join('');
}

async function refreshFearGreed() {
    const d = await fetchFearGreed();
    if (!d) return;
    const val = parseInt(d.value), cls = d.value_classification;
    const color = val>=70?'#ef4444':val>=50?'#f59e0b':val>=30?'#6366f1':'#10b981';
    const valEl = document.getElementById('fgiValue'), lblEl = document.getElementById('fgiLabel');
    const badge = document.getElementById('fgiBadge');
    if (valEl) { valEl.textContent = val; valEl.style.color = color; }
    if (lblEl) lblEl.textContent = cls;
    if (badge) { badge.textContent = cls; badge.style.background = color+'22'; badge.style.color = color; }
    drawFGIGauge(val, color);
}

function drawFGIGauge(value, color) {
    const c = document.getElementById('fgiGauge');
    if (!c) return;
    const ctx = c.getContext('2d'), cx=100, cy=100, r=75;
    ctx.clearRect(0,0,200,110);
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,2*Math.PI);
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=14; ctx.stroke();
    const angle = Math.PI + (value/100)*Math.PI;
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,angle);
    ctx.strokeStyle=color; ctx.lineWidth=14; ctx.lineCap='round'; ctx.stroke();
    ctx.font='9px Inter'; ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.textAlign='center';
    ctx.fillText('Fear',cx-66,cy-10); ctx.fillText('Greed',cx+66,cy-10);
}

// ══════════════════════════════════════════════
//  5. TRADINGVIEW CHARTS
// ══════════════════════════════════════════════

function switchChart(btn) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const sym = btn.dataset.sym, label = btn.dataset.label;
    const pe  = document.getElementById('chartPairLabel');
    if (pe) pe.textContent = label;
    loadTVChart(sym);
}

// ── Chart category / pairs data ──
const CHART_PAIRS = {
    forex: [
        { sym: 'XAUUSD',  label: 'XAU/USD',  icon: 'fas fa-coins',          name: 'Gold' },
        { sym: 'EURUSD',  label: 'EUR/USD',   icon: 'fas fa-euro-sign',      name: 'Euro' },
        { sym: 'GBPUSD',  label: 'GBP/USD',   icon: 'fas fa-sterling-sign',  name: 'Pound' },
        { sym: 'USDJPY',  label: 'USD/JPY',   icon: 'fas fa-yen-sign',       name: 'Yen' },
        { sym: 'AUDUSD',  label: 'AUD/USD',   icon: 'fas fa-dollar-sign',    name: 'Aussie' },
        { sym: 'USDCHF',  label: 'USD/CHF',   icon: 'fas fa-franc-sign',     name: 'Swissie' },
        { sym: 'USDCAD',  label: 'USD/CAD',   icon: 'fas fa-dollar-sign',    name: 'Loonie' },
        { sym: 'NZDUSD',  label: 'NZD/USD',   icon: 'fas fa-dollar-sign',    name: 'Kiwi' },
        { sym: 'EURGBP',  label: 'EUR/GBP',   icon: 'fas fa-euro-sign',      name: 'EG' },
        { sym: 'EURJPY',  label: 'EUR/JPY',   icon: 'fas fa-yen-sign',       name: 'EJ' },
    ],
    crypto: [
        { sym: 'BTCUSDT',  label: 'BTC/USDT',  icon: 'fab fa-bitcoin',        name: 'Bitcoin' },
        { sym: 'ETHUSDT',  label: 'ETH/USDT',  icon: 'fab fa-ethereum',       name: 'Ethereum' },
        { sym: 'SOLUSDT',  label: 'SOL/USDT',  icon: 'fas fa-sun',            name: 'Solana' },
        { sym: 'BNBUSDT',  label: 'BNB/USDT',  icon: 'fas fa-certificate',    name: 'BNB' },
        { sym: 'XRPUSDT',  label: 'XRP/USDT',  icon: 'fas fa-water',          name: 'XRP' },
        { sym: 'ADAUSDT',  label: 'ADA/USDT',  icon: 'fas fa-circle',         name: 'Cardano' },
        { sym: 'DOGEUSDT', label: 'DOGE/USDT', icon: 'fas fa-dog',            name: 'Doge' },
        { sym: 'AVAXUSDT', label: 'AVAX/USDT', icon: 'fas fa-mountain',       name: 'Avalanche' },
        { sym: 'DOTUSDT',  label: 'DOT/USDT',  icon: 'fas fa-circle-dot',     name: 'Polkadot' },
        { sym: 'LTCUSDT',  label: 'LTC/USDT',  icon: 'fas fa-coins',          name: 'Litecoin' },
    ],
    commodity: [
        { sym: 'XAUUSD',  label: 'XAU/USD',   icon: 'fas fa-coins',          name: 'Gold' },
        { sym: 'XAGUSD',  label: 'XAG/USD',   icon: 'fas fa-circle',         name: 'Silver' },
        { sym: 'USOIL',   label: 'WTI Oil',   icon: 'fas fa-oil-well',       name: 'WTI Crude' },
        { sym: 'UKOIL',   label: 'Brent Oil', icon: 'fas fa-droplet',        name: 'Brent' },
        { sym: 'XPTUSD',  label: 'XPT/USD',   icon: 'fas fa-gem',            name: 'Platinum' },
        { sym: 'NATGAS',  label: 'Nat Gas',   icon: 'fas fa-fire',           name: 'Nat Gas' },
        { sym: 'CORN',    label: 'Corn',      icon: 'fas fa-seedling',       name: 'Corn' },
        { sym: 'WHEAT',   label: 'Wheat',     icon: 'fas fa-wheat-awn',      name: 'Wheat' },
    ]
};

let currentChartCat = 'forex';

// ── Category icon map ──
const CHART_CAT_ICONS = {
    forex:     'fas fa-dollar-sign',
    crypto:    'fab fa-bitcoin',
    commodity: 'fas fa-coins'
};

function switchChartCategory(btn) {
    document.querySelectorAll('.chart-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentChartCat = btn.dataset.cat;
    renderChartPairs(currentChartCat);
    // Auto-load first pair
    const sel = document.getElementById('chartPairSelect');
    if (sel && sel.options.length) {
        sel.selectedIndex = 0;
        switchChartFromSelect(sel);
    }
}

function renderChartPairs(cat) {
    const sel  = document.getElementById('chartPairSelect');
    const icon = document.getElementById('chartDropdownIcon');
    if (!sel) return;
    const pairs = CHART_PAIRS[cat] || [];
    sel.innerHTML = pairs.map(p =>
        `<option value="${p.sym}" data-label="${p.label}">${p.label}</option>`
    ).join('');
    // Update icon to match category
    if (icon) icon.innerHTML = `<i class="${CHART_CAT_ICONS[cat] || 'fas fa-chart-line'}"></i>`;
}

function switchChartFromSelect(sel) {
    const opt   = sel.options[sel.selectedIndex];
    const sym   = sel.value;
    const label = opt?.dataset.label || opt?.text || sym;
    const pe    = document.getElementById('chartPairLabel');
    if (pe) pe.textContent = label;
    loadTVChart(sym);
}

function switchChart(btn) {
    // Legacy — kept for any old calls
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const sym   = btn?.dataset.sym;
    const label = btn?.dataset.label;
    const pe    = document.getElementById('chartPairLabel');
    if (pe && label) pe.textContent = label;
    if (sym) loadTVChart(sym);
}

// Chart-local theme: starts as 'light' (white background by default)
let chartTheme = localStorage.getItem('tb-chart-theme') || 'light';

function toggleChartTheme() {
    chartTheme = chartTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tb-chart-theme', chartTheme);

    const btn   = document.getElementById('chartThemeToggle');
    const icon  = btn ? btn.querySelector('.ctt-icon') : null;
    const label = document.getElementById('chartThemeLabel');
    const container = document.getElementById('chartContainer');

    if (chartTheme === 'light') {
        if (btn)   btn.classList.add('ctt-light');
        if (btn)   btn.title = 'Switch to dark chart';
        if (icon)  icon.textContent = '🌙';
        if (label) label.textContent = 'Dark';
        if (container) container.style.background = '#ffffff';
    } else {
        if (btn)   btn.classList.remove('ctt-light');
        if (btn)   btn.title = 'Switch to white chart';
        if (icon)  icon.textContent = '☀️';
        if (label) label.textContent = 'White';
        if (container) container.style.background = '';
    }

    // Reload the active chart with new theme
    const activeTab = document.querySelector('.chart-tab.active');
    if (activeTab) loadTVChart(activeTab.dataset.sym);
}

function loadTVChart(symbol) {
    const container = document.getElementById('tvChartContainer');
    if (!container) return;
    container.innerHTML = '';
    const isChartLight = chartTheme === 'light';
    const fullSym = symbol.includes(':') ? symbol :
        (['EURUSD','GBPUSD','USDJPY','XAUUSD','AUDUSD'].includes(symbol) ? 'FX:'+symbol : 'BINANCE:'+symbol);
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    wrap.style.cssText = 'height:100%;width:100%;';
    wrap.innerHTML = '<div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%;"></div>';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    s.async = true;
    s.textContent = JSON.stringify({
        autosize: true, symbol: fullSym, interval: 'D',
        timezone: 'Africa/Nairobi', theme: isChartLight ? 'light' : 'dark',
        style: '1', locale: 'en',
        toolbar_bg: isChartLight ? '#ffffff' : '#1c2333',
        enable_publishing: false, withdateranges: true, range: '3M',
        hide_side_toolbar: false, allow_symbol_change: true, save_image: false,
        show_popup_button: false,
        enable_replay: true,
        popup_width: '1000', popup_height: '650'
    });
    wrap.appendChild(s);
    container.appendChild(wrap);
}

function loadTVMarketOverview() {
    // Load into both containers (top inline + main dashboard section)
    ['tvMarketOverviewTop', 'tvMarketOverview'].forEach(function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const isDark = currentTheme === 'dark';
        const s = document.createElement('script');
        s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        s.async = true;
        s.textContent = JSON.stringify({
            colorTheme: isDark ? 'dark' : 'light', dateRange:'12M', showChart:true,
            locale:'en', isTransparent:true, showSymbolLogo:true, width:'100%', height:420,
            tabs:[
                { title:'Crypto', symbols:[
                    {s:'BINANCE:BTCUSDT',d:'Bitcoin'},{s:'BINANCE:ETHUSDT',d:'Ethereum'},
                    {s:'BINANCE:BNBUSDT',d:'BNB'},{s:'BINANCE:SOLUSDT',d:'Solana'},{s:'BINANCE:XRPUSDT',d:'XRP'}
                ], originalTitle:'Cryptocurrencies' },
                { title:'Forex', symbols:[
                    {s:'FX:EURUSD'},{s:'FX:GBPUSD'},{s:'FX:USDJPY'},{s:'FX:USDCHF'},{s:'FX:AUDUSD'}
                ], originalTitle:'Forex' },
                { title:'Commodities', symbols:[
                    {s:'TVC:GOLD',d:'Gold'},{s:'TVC:SILVER',d:'Silver'},{s:'NYMEX:CL1!',d:'Crude Oil'}
                ], originalTitle:'Commodities' }
            ]
        });
        container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
        container.appendChild(s);
    });
}

function loadTVEconomicCalendar() {
    const container = document.getElementById('tvCalendarContainer');
    if (!container) return;
    const isDark = currentTheme === 'dark';
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    wrap.style.cssText = 'height:100%;width:100%;min-height:480px;';
    wrap.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%;"></div>';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    s.async = true;
    s.textContent = JSON.stringify({
        colorTheme: isDark ? 'dark' : 'light',
        isTransparent: true,
        width: '100%',
        height: '480',
        locale: 'en',
        importanceFilter: '0,1',
        countryFilter: 'us,eu,gb,jp,ch,ca,au'
    });
    wrap.appendChild(s);
    container.innerHTML = '';
    container.appendChild(wrap);
}

function loadTVMarketNews() {
    const container = document.getElementById('tvNewsContainer');
    if (!container) return;
    const isDark = currentTheme === 'dark';
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    wrap.style.cssText = 'height:100%;width:100%;min-height:480px;';
    wrap.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%;"></div>';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    s.async = true;
    s.textContent = JSON.stringify({
        feedMode: 'all_symbols',
        isTransparent: true,
        displayMode: 'regular',
        width: '100%',
        height: '480',
        colorTheme: isDark ? 'dark' : 'light',
        locale: 'en'
    });
    wrap.appendChild(s);
    container.innerHTML = '';
    container.appendChild(wrap);
}

function toggleChartFullscreen() {
    const el = document.getElementById('chartContainer');
    if (!el) return;
    const isNowFS = el.classList.toggle('fullscreen');
    const i = document.querySelector('.chart-fs-btn i');
    if (i) i.className = isNowFS ? 'fas fa-compress' : 'fas fa-expand';

    const existingClose = document.getElementById('chartFsCloseBtn');
    if (isNowFS) {
        if (!existingClose) {
            const closeBtn = document.createElement('button');
            closeBtn.id = 'chartFsCloseBtn';
            closeBtn.innerHTML = '<i class="fas fa-compress"></i> Minimize';
            closeBtn.setAttribute('aria-label', 'Exit fullscreen');
            closeBtn.onclick = toggleChartFullscreen;
            // Append to BODY so iframe cannot block it on mobile
            document.body.appendChild(closeBtn);
        }
        document.addEventListener('keydown', _chartFsEscHandler);
    } else {
        if (existingClose) existingClose.remove();
        document.removeEventListener('keydown', _chartFsEscHandler);
    }
}

function _chartFsEscHandler(e) {
    if (e.key === 'Escape') toggleChartFullscreen();
}

// ══════════════════════════════════════════════
//  6. TRADING ACADEMY
//  Free preview removed — full content at /academy (password protected)
//  switchAcademy / renderAcademy stubs kept to avoid any residual calls
// ══════════════════════════════════════════════
function switchAcademy() {}
function renderAcademy() {}

// ══════════════════════════════════════════════
//  7. TRADING CALCULATORS
// ══════════════════════════════════════════════

const CALCS = {
    possize:{
        title:'Position Size Calculator',
        desc:'Calculate correct lot size from account balance and risk %.',
        fields:[
            {id:'ps-bal',  label:'Account Balance ($)', type:'number', ph:'10000'},
            {id:'ps-risk', label:'Risk % per Trade',    type:'number', ph:'1', step:'0.1'},
            {id:'ps-entry',label:'Entry Price',          type:'number', ph:'1.0850', step:'any'},
            {id:'ps-sl',   label:'Stop Loss Price',      type:'number', ph:'1.0800', step:'any'},
            {id:'ps-type', label:'Instrument',           type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Crypto (USD quote)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const bal=+v['ps-bal'], rp=+v['ps-risk']/100, en=+v['ps-entry'], sl=+v['ps-sl'];
            if(!bal||!rp||!en||!sl||en<=0||sl<=0||bal<=0) return null;
            if(rp<=0||rp>1) return null; // max 100% risk guard
            const riskUSD = bal * rp;
            const slDist  = Math.abs(en - sl);
            if(slDist === 0) return null;
            let lots, pipVal, pipDist;
            const type = v['ps-type'] || '';
            if(type.includes('JPY')) {
                // JPY pairs: pip = 0.01, contract = 100,000, pip value = (0.01/price)*100000
                pipDist = slDist / 0.01; // pips
                pipVal  = (0.01 / en) * 100000; // $ per pip per std lot
                lots    = riskUSD / (pipDist * pipVal);
            } else if(type.includes('Crypto')) {
                // Crypto: no fixed pip, direct $ value
                lots = riskUSD / (slDist * en);
            } else if(type.includes('Gold')) {
                // Gold (XAU/USD): 1 lot = 100 oz, pip = $0.01
                pipDist = slDist / 0.01;
                pipVal  = 1.00; // $1 per pip per std lot (100 oz × $0.01)
                lots    = riskUSD / (pipDist * pipVal);
            } else {
                // Standard Forex xxx/USD: pip = 0.0001, contract = 100,000, pip value = $10
                pipDist = slDist / 0.0001;
                pipVal  = 10;
                lots    = riskUSD / (pipDist * pipVal);
            }
            const miniLots  = lots * 10;
            const microLots = lots * 100;
            return [
                {v: lots.toFixed(3) + ' lots', l:'Position Size'},
                {v: '$' + riskUSD.toFixed(2),  l:'Risk Amount'},
                {v: (type.includes('Crypto') ? slDist.toFixed(6) : (type.includes('JPY') ? pipDist.toFixed(1)+' pips' : pipDist.toFixed(1)+' pips')), l:'SL Distance'},
                {v: miniLots.toFixed(2) + ' mini', l:'Mini Lots'},
                {v: microLots.toFixed(1) + ' micro', l:'Micro Lots'},
                {v: (rp*100).toFixed(2) + '%', l:'Risk %'}
            ];
        }
    },
    riskpct:{
        title:'Risk % Calculator',
        desc:'Find what percentage of your account you are risking.',
        fields:[
            {id:'rp-bal',   label:'Account Balance ($)', type:'number', ph:'10000'},
            {id:'rp-entry', label:'Entry Price',          type:'number', ph:'1.0850', step:'any'},
            {id:'rp-sl',    label:'Stop Loss Price',      type:'number', ph:'1.0800', step:'any'},
            {id:'rp-lot',   label:'Lot Size',             type:'number', ph:'0.20',   step:'0.01'},
            {id:'rp-type',  label:'Instrument',           type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const bal=+v['rp-bal'], en=+v['rp-entry'], sl=+v['rp-sl'], lot=+v['rp-lot'];
            if(!bal||!en||!sl||!lot||bal<=0||lot<=0) return null;
            const slDist = Math.abs(en - sl);
            if(slDist === 0) return null;
            const type = v['rp-type'] || '';
            let pipVal, pipDist, riskUSD;
            if(type.includes('JPY')) {
                pipDist = slDist / 0.01;
                pipVal  = (0.01 / en) * 100000;
                riskUSD = pipDist * pipVal * lot;
            } else if(type.includes('Gold')) {
                pipDist = slDist / 0.01;
                pipVal  = 1.00;
                riskUSD = pipDist * pipVal * lot;
            } else {
                pipDist = slDist / 0.0001;
                pipVal  = 10;
                riskUSD = pipDist * pipVal * lot;
            }
            const pct     = (riskUSD / bal) * 100;
            const remain  = bal - riskUSD;
            const status  = pct <= 1 ? '✅ Conservative' : pct <= 2 ? '⚠️ Moderate' : '❌ High Risk!';
            return [
                {v: pct.toFixed(2) + '%',       l:'Risk %'},
                {v: '$' + riskUSD.toFixed(2),   l:'Risk Amount'},
                {v: status,                      l:'Assessment'},
                {v: '$' + remain.toFixed(2),     l:'Remaining Balance'},
                {v: pipDist.toFixed(1) + ' pips',l:'SL in Pips'},
                {v: '$' + pipVal.toFixed(4),     l:'Pip Value / Std Lot'}
            ];
        }
    },
    pip:{
        title:'Pip Value Calculator',
        desc:'Monetary value of 1 pip based on lot size and instrument.',
        fields:[
            {id:'pv-type', label:'Instrument',                 type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Forex (EUR/USD)','Forex (GBP/USD)','Gold (XAU/USD)','Silver (XAG/USD)']},
            {id:'pv-lot',  label:'Lot Size',                   type:'number', ph:'1.0', step:'0.01'},
            {id:'pv-px',   label:'Current Price (required for JPY)', type:'number', ph:'150.00', step:'any'}
        ],
        fn(v) {
            const lot = +v['pv-lot'] || 1, px = +v['pv-px'] || 150;
            const type = v['pv-type'] || '';
            let pipPerStdLot;
            if(type.includes('JPY')) {
                // JPY: pip = 0.01, contract 100,000 units, pip value in USD = (0.01/price)*100,000
                pipPerStdLot = (0.01 / px) * 100000;
            } else if(type.includes('Gold')) {
                // XAU/USD: 1 lot = 100 oz, 1 pip = $0.01/oz → $1 per pip per lot
                pipPerStdLot = 1.00;
            } else if(type.includes('Silver')) {
                // XAG/USD: 1 lot = 5000 oz, pip = $0.001/oz → $5 per pip per lot
                pipPerStdLot = 5.00;
            } else {
                // Standard xxx/USD: pip = 0.0001, contract 100,000 → $10 per pip per lot
                pipPerStdLot = 10.00;
            }
            const pipValue  = pipPerStdLot * lot;
            const miniPip   = pipPerStdLot * 0.1 * lot;
            const microPip  = pipPerStdLot * 0.01 * lot;
            return [
                {v: '$' + pipValue.toFixed(4),  l:'1 Pip (your lot)'},
                {v: '$' + pipPerStdLot.toFixed(4), l:'1 Pip (1 std lot)'},
                {v: '$' + miniPip.toFixed(4),   l:'1 Pip (mini lot)'},
                {v: '$' + microPip.toFixed(4),  l:'1 Pip (micro lot)'},
                {v: '$' + (pipValue*10).toFixed(3), l:'10 Pips'},
                {v: '$' + (pipValue*50).toFixed(3), l:'50 Pips'}
            ];
        }
    },
    lotsize:{
        title:'Lot Size Calculator',
        desc:'Ideal lot size from account balance, risk % and SL pips.',
        fields:[
            {id:'ls-bal',  label:'Account Balance ($)', type:'number', ph:'10000'},
            {id:'ls-risk', label:'Risk % per Trade',    type:'number', ph:'1', step:'0.1'},
            {id:'ls-pips', label:'Stop Loss (Pips)',     type:'number', ph:'50'},
            {id:'ls-type', label:'Instrument',           type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const bal=+v['ls-bal'], riskPct=+v['ls-risk']/100, pips=+v['ls-pips'];
            const type = v['ls-type'] || '';
            if(!bal||!riskPct||!pips||bal<=0||pips<=0) return null;
            const riskUSD = bal * riskPct;
            let pipVal;
            if(type.includes('JPY'))  pipVal = 6.67;  // approx for USD/JPY ~150
            else if(type.includes('Gold')) pipVal = 1.00;
            else                           pipVal = 10.00;
            const lots      = riskUSD / (pips * pipVal);
            const miniLots  = lots * 10;
            const microLots = lots * 100;
            const units     = lots * 100000;
            return [
                {v: lots.toFixed(3),             l:'Standard Lots'},
                {v: miniLots.toFixed(2),          l:'Mini Lots'},
                {v: microLots.toFixed(1),         l:'Micro Lots'},
                {v: Math.round(units).toLocaleString(), l:'Units'},
                {v: '$' + riskUSD.toFixed(2),     l:'Risk Amount'},
                {v: (riskPct*100).toFixed(2)+'%', l:'Risk %'}
            ];
        }
    },
    rr:{
        title:'Risk:Reward Calculator',
        desc:'Calculate R:R ratio, break-even win rate and potential P&L.',
        fields:[
            {id:'rr-en',  label:'Entry Price',   type:'number', ph:'1.0850', step:'any'},
            {id:'rr-sl',  label:'Stop Loss',     type:'number', ph:'1.0800', step:'any'},
            {id:'rr-tp',  label:'Take Profit',   type:'number', ph:'1.0950', step:'any'},
            {id:'rr-lot', label:'Lot Size',       type:'number', ph:'0.1',    step:'0.01'},
            {id:'rr-dir', label:'Direction',      type:'select', opts:['BUY','SELL']}
        ],
        fn(v) {
            const en=+v['rr-en'], sl=+v['rr-sl'], tp=+v['rr-tp'], lot=+v['rr-lot']||0.1;
            const dir = v['rr-dir'] || 'BUY';
            if(!en||!sl||!tp||en<=0||sl<=0||tp<=0) return null;
            // Validate direction
            if(dir==='BUY'  && !(sl < en && tp > en)) return null;
            if(dir==='SELL' && !(sl > en && tp < en)) return null;
            const riskDist   = Math.abs(en - sl);
            const rewardDist = Math.abs(tp - en);
            if(riskDist === 0) return null;
            const rr         = rewardDist / riskDist;
            const be         = (1 / (1 + rr)) * 100;
            const riskPips   = riskDist / 0.0001;
            const rewardPips = rewardDist / 0.0001;
            const riskUSD    = riskPips * 10 * lot;
            const rewardUSD  = rewardPips * 10 * lot;
            const status     = rr >= 3 ? '✅ Excellent' : rr >= 2 ? '✅ Good' : rr >= 1 ? '⚠️ Acceptable' : '❌ Poor';
            return [
                {v: '1 : ' + rr.toFixed(2),         l:'R:R Ratio'},
                {v: be.toFixed(1) + '%',             l:'Break-Even Win Rate'},
                {v: status,                           l:'Assessment'},
                {v: '-$' + riskUSD.toFixed(2),        l:'Potential Loss'},
                {v: '+$' + rewardUSD.toFixed(2),      l:'Potential Profit'},
                {v: riskPips.toFixed(0) + ' / ' + rewardPips.toFixed(0) + ' pips', l:'Risk / Reward Pips'}
            ];
        }
    },
    pl:{
        title:'P&L Calculator',
        desc:'Calculate profit or loss accurately for Forex trades.',
        fields:[
            {id:'pl-en',  label:'Entry Price', type:'number', ph:'1.0850', step:'any'},
            {id:'pl-ex',  label:'Exit Price',  type:'number', ph:'1.0950', step:'any'},
            {id:'pl-lot', label:'Lot Size',    type:'number', ph:'0.1',    step:'0.01'},
            {id:'pl-dir', label:'Direction',   type:'select', opts:['BUY','SELL']},
            {id:'pl-type',label:'Instrument',  type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const en=+v['pl-en'], ex=+v['pl-ex'], lot=+v['pl-lot'], dir=v['pl-dir'];
            const type = v['pl-type'] || '';
            if(!en||!ex||!lot||en<=0||ex<=0||lot<=0) return null;
            const priceDiff = dir === 'BUY' ? (ex - en) : (en - ex);
            let pipVal, pips, profit;
            if(type.includes('JPY')) {
                pips    = priceDiff / 0.01;
                pipVal  = (0.01 / en) * 100000;
                profit  = pips * pipVal * lot;
            } else if(type.includes('Gold')) {
                pips    = priceDiff / 0.01;
                pipVal  = 1.00;
                profit  = pips * pipVal * lot;
            } else {
                pips    = priceDiff / 0.0001;
                pipVal  = 10;
                profit  = pips * pipVal * lot;
            }
            const result = profit >= 0 ? '✅ Profit' : '❌ Loss';
            const pctGain = profit / (en * lot * 100000) * 100; // rough % on notional
            return [
                {v: (profit >= 0 ? '+' : '') + '$' + profit.toFixed(2), l:'Net P&L'},
                {v: (pips >= 0 ? '+' : '') + pips.toFixed(1) + ' pips', l:'Pips'},
                {v: result,                                               l:'Result'},
                {v: '$' + pipVal.toFixed(4) + '/pip',                    l:'Pip Value (std lot)'},
                {v: lot + ' lots',                                        l:'Position Size'},
                {v: (pctGain >= 0 ? '+' : '') + pctGain.toFixed(3) + '%', l:'% on Notional'}
            ];
        }
    },
    compound:{
        title:'Compound Growth Calculator',
        desc:'Project account growth with consistent returns over time.',
        fields:[
            {id:'cg-bal',    label:'Starting Balance ($)',        type:'number', ph:'1000'},
            {id:'cg-rate',   label:'Return % per Period',          type:'number', ph:'5', step:'0.1'},
            {id:'cg-periods',label:'Number of Periods (months)',   type:'number', ph:'24'},
            {id:'cg-contrib',label:'Monthly Contribution ($)',     type:'number', ph:'0'}
        ],
        fn(v) {
            const start=+v['cg-bal'], rate=+v['cg-rate']/100, periods=+v['cg-periods'], contrib=+v['cg-contrib']||0;
            if(!start||!rate||!periods||start<=0||periods<=0) return null;
            if(periods > 600) return null; // safety cap
            // Compound with optional monthly contribution
            let balance = start;
            for(let i = 0; i < periods; i++){
                balance = balance * (1 + rate) + contrib;
            }
            const gain       = balance - start - (contrib * periods);
            const totalIn    = start + (contrib * periods);
            const growthPct  = ((balance - totalIn) / totalIn) * 100;
            const doublingPeriods = Math.log(2) / Math.log(1 + rate);
            return [
                {v: '$' + balance.toLocaleString('en-US', {maximumFractionDigits:2}),    l:'Final Balance'},
                {v: '$' + gain.toLocaleString('en-US', {maximumFractionDigits:2}),       l:'Total Gain'},
                {v: '$' + totalIn.toLocaleString('en-US', {maximumFractionDigits:2}),    l:'Total Invested'},
                {v: growthPct.toFixed(2) + '%',                                           l:'Return on Investment'},
                {v: (balance/start).toFixed(2) + 'x',                                    l:'Growth Multiple'},
                {v: doublingPeriods.toFixed(1) + ' periods',                             l:'Doubling Time'}
            ];
        }
    },
    fibonacci:{
        title:'Fibonacci Retracement Calculator',
        desc:'Calculate standard Fibonacci retracement and extension levels.',
        fields:[
            {id:'fib-hi',  label:'Swing High', type:'number', ph:'1.1000', step:'any'},
            {id:'fib-lo',  label:'Swing Low',  type:'number', ph:'1.0500', step:'any'},
            {id:'fib-dir', label:'Trend Direction', type:'select', opts:['Uptrend — Retracement pulls DOWN','Downtrend — Retracement pulls UP']}
        ],
        fn(v) {
            const hi=+v['fib-hi'], lo=+v['fib-lo'];
            if(!hi||!lo||hi<=lo||lo<=0) return null;
            const diff = hi - lo;
            const up   = v['fib-dir']?.includes('Uptrend');
            // Standard Fibonacci levels: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%
            const levels = [
                {pct:0,     label:'0.0% (Swing High)'},
                {pct:0.236, label:'23.6%'},
                {pct:0.382, label:'38.2%'},
                {pct:0.5,   label:'50.0%'},
                {pct:0.618, label:'61.8% — Golden Ratio'},
                {pct:0.786, label:'78.6%'},
                {pct:1.0,   label:'100% (Swing Low)'}
            ];
            return levels.map(lv => ({
                v: (up ? hi - diff * lv.pct : lo + diff * lv.pct).toFixed(5),
                l: lv.label
            }));
        }
    },
    sl:{
        title:'Stop Loss Calculator',
        desc:'Calculate SL placement, risk amount and recommended position size.',
        fields:[
            {id:'sl-bal',  label:'Account Balance ($)', type:'number', ph:'10000'},
            {id:'sl-risk', label:'Risk % per Trade',    type:'number', ph:'1', step:'0.1'},
            {id:'sl-en',   label:'Entry Price',         type:'number', ph:'1.0850', step:'any'},
            {id:'sl-pips', label:'Stop Loss Distance (Pips)', type:'number', ph:'50'},
            {id:'sl-dir',  label:'Direction',           type:'select', opts:['BUY','SELL']},
            {id:'sl-type', label:'Instrument',          type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const bal=+v['sl-bal'], riskPct=+v['sl-risk']/100, en=+v['sl-en'], pips=+v['sl-pips'];
            const dir=v['sl-dir']||'BUY', type=v['sl-type']||'';
            if(!bal||!riskPct||!en||!pips||bal<=0||pips<=0||en<=0) return null;
            // Pip size by instrument
            let pipSize, pipVal;
            if(type.includes('JPY'))  { pipSize=0.01;   pipVal=(0.01/en)*100000; }
            else if(type.includes('Gold')){ pipSize=0.01; pipVal=1.00; }
            else                          { pipSize=0.0001; pipVal=10.00; }
            const slMove  = pips * pipSize;
            const slPrice = dir === 'BUY' ? en - slMove : en + slMove;
            const tp1     = dir === 'BUY' ? en + slMove : en - slMove;       // 1:1
            const tp2     = dir === 'BUY' ? en + slMove*2 : en - slMove*2;   // 1:2
            const tp3     = dir === 'BUY' ? en + slMove*3 : en - slMove*3;   // 1:3
            const riskUSD = bal * riskPct;
            const lots    = riskUSD / (pips * pipVal);
            return [
                {v: slPrice.toFixed(5),              l:'Stop Loss Price'},
                {v: pips + ' pips',                  l:'SL Distance'},
                {v: '$' + riskUSD.toFixed(2),        l:'Risk Amount'},
                {v: (riskPct*100).toFixed(2) + '%',  l:'Risk %'},
                {v: lots.toFixed(3) + ' lots',       l:'Recommended Lot Size'},
                {v: tp1.toFixed(5) + ' (1:1) / ' + tp2.toFixed(5) + ' (1:2)', l:'TP Targets'}
            ];
        }
    }
};

function switchCalc(btn, id) {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderCalc(id);
}

function renderCalc(id) {
    const c = CALCS[id]; if(!c) return;
    const el = document.getElementById('calcContainer'); if(!el) return;
    const flds = c.fields.map(f => {
        if(f.type==='select')
            return `<div class="form-group"><label>${f.label}</label><select id="${f.id}">${f.opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`;
        return `<div class="form-group"><label>${f.label}</label><input type="${f.type}" id="${f.id}" placeholder="${f.ph||''}" step="${f.step||1}"></div>`;
    }).join('');
    el.innerHTML = `
        <h3 class="calc-title">${c.title}</h3>
        <p class="calc-desc">${c.desc}</p>
        <div class="calc-form">${flds}
            <button class="calc-btn" onclick="runCalc('${id}')"><i class="fas fa-calculator"></i> Calculate</button>
        </div>
        <div class="calc-result" id="calcResult">
            <div class="result-grid" id="resultGrid"></div>
            <p class="result-note" id="resultNote"></p>
        </div>`;
}

function runCalc(id) {
    const c = CALCS[id]; if(!c) return;
    const vals = {};
    c.fields.forEach(f => { const el=document.getElementById(f.id); if(el) vals[f.id]=el.value; });
    const res = c.fn(vals);
    const re = document.getElementById('calcResult'), rg = document.getElementById('resultGrid');
    if(!res||!re) { if(re) re.classList.remove('show'); return; }
    rg.innerHTML = res.map(r=>`<div class="result-item"><div class="result-val">${r.v}</div><div class="result-lbl">${r.l}</div></div>`).join('');
    document.getElementById('resultNote').textContent = '⚠️ Educational use only. Always verify before trading. Pip values vary by broker.';
    re.classList.add('show');
}

// ══════════════════════════════════════════════
//  200+ TECHNICAL INDICATORS MODULE
// ══════════════════════════════════════════════
let activeIndicatorCategory = 'all';
let indicatorSearchQuery = '';
let visibleIndicatorCount = 18;

function initIndicators() {
    renderIndicatorCategories();
    renderIndicators();
}

function renderIndicatorCategories() {
    const tabsContainer = document.getElementById('indicatorCategoryTabs');
    if (!tabsContainer || !window.INDICATOR_CATEGORIES) return;

    tabsContainer.innerHTML = window.INDICATOR_CATEGORIES.map(cat => `
        <button class="indicator-cat-btn ${cat.id === activeIndicatorCategory ? 'active' : ''}" 
                onclick="switchIndicatorCategory('${cat.id}')">
            <i class="${cat.icon}"></i>
            <span>${currentLang === 'am' ? cat.nameAm : cat.nameEn}</span>
        </button>
    `).join('');
}

function switchIndicatorCategory(catId) {
    activeIndicatorCategory = catId;
    visibleIndicatorCount = 18;
    renderIndicatorCategories();
    renderIndicators();
}

function handleIndicatorSearch(q) {
    indicatorSearchQuery = (q || '').trim().toLowerCase();
    visibleIndicatorCount = 18;
    renderIndicators();
}

function renderIndicators() {
    const grid = document.getElementById('indicatorsGrid');
    const badge = document.getElementById('indicatorCountBadge');
    const loadMoreWrap = document.getElementById('indicatorLoadMoreWrap');
    if (!grid || !window.INDICATORS_DATA) return;

    let filtered = window.INDICATORS_DATA;

    // Filter by Category
    if (activeIndicatorCategory !== 'all') {
        filtered = filtered.filter(item => item.cat === activeIndicatorCategory);
    }

    // Filter by Search Query
    if (indicatorSearchQuery) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(indicatorSearchQuery) ||
            item.short.toLowerCase().includes(indicatorSearchQuery) ||
            (item.desc && item.desc.toLowerCase().includes(indicatorSearchQuery)) ||
            (item.descAm && item.descAm.toLowerCase().includes(indicatorSearchQuery))
        );
    }

    if (badge) {
        badge.textContent = `${filtered.length} Indicators`;
    }

    if (!filtered.length) {
        grid.innerHTML = `
            <div class="indicator-empty-state">
                <i class="fas fa-search" style="font-size:2rem;color:var(--brand-primary);margin-bottom:10px;"></i>
                <p>ምንም የሚዛመድ ኢንዲኬተር አልተገኘም / No matching indicators found.</p>
            </div>
        `;
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
        return;
    }

    const toShow = filtered.slice(0, visibleIndicatorCount);

    grid.innerHTML = toShow.map(ind => {
        const hasCalc = !!ind.calcKey && !!window.INDICATOR_CALCULATORS && !!window.INDICATOR_CALCULATORS[ind.calcKey];
        const catObj = (window.INDICATOR_CATEGORIES || []).find(c => c.id === ind.cat);
        const catLabel = catObj ? (currentLang === 'am' ? catObj.nameAm : catObj.nameEn) : ind.cat;

        return `
            <div class="indicator-card" onclick="openIndicatorModal('${ind.id}')">
                <div class="ind-card-top">
                    <span class="ind-cat-tag"><i class="fas fa-tag"></i> ${catLabel}</span>
                    <span class="ind-short-badge">${ind.short}</span>
                </div>
                <h4 class="ind-name">${ind.name}</h4>
                <p class="ind-desc">${currentLang === 'am' && ind.descAm ? ind.descAm : ind.desc}</p>
                <div class="ind-card-footer">
                    <span class="ind-tf"><i class="fas fa-clock"></i> ${ind.timeframe || 'All TFs'}</span>
                    <span class="ind-action-link">
                        ${hasCalc ? '<i class="fas fa-calculator"></i> Test Live' : '<i class="fas fa-info-circle"></i> View Formula'}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    if (loadMoreWrap) {
        loadMoreWrap.style.display = visibleIndicatorCount < filtered.length ? 'block' : 'none';
    }
}

function loadMoreIndicators() {
    visibleIndicatorCount += 18;
    renderIndicators();
}

let activeIndicatorForCalc = null;

function openIndicatorModal(id) {
    const ind = (window.INDICATORS_DATA || []).find(x => x.id === id);
    if (!ind) return;

    activeIndicatorForCalc = ind;

    const overlay = document.getElementById('indicatorModalOverlay');
    const modal = document.getElementById('indicatorModal');
    if (!overlay || !modal) return;

    document.getElementById('imTitle').textContent = ind.name;
    document.getElementById('imShort').textContent = ind.short;
    document.getElementById('imCatBadge').textContent = ind.cat.toUpperCase();
    document.getElementById('imDesc').innerHTML = `
        <p style="font-size:0.95rem;line-height:1.6;margin-bottom:8px"><strong>English:</strong> ${ind.desc}</p>
        <p style="font-size:0.95rem;line-height:1.6;color:var(--brand-gold);"><strong>አማርኛ:</strong> ${ind.descAm || ind.desc}</p>
    `;
    document.getElementById('imFormula').textContent = ind.formula;
    document.getElementById('imBullish').textContent = ind.bullish;
    document.getElementById('imBearish').textContent = ind.bearish;
    document.getElementById('imTimeframe').textContent = ind.timeframe || 'All Timeframes (15M, 1H, 4H, 1D)';

    // Calculator Section
    const calcBox = document.getElementById('imCalcBox');
    const calcFields = document.getElementById('imCalcFields');
    const calcResult = document.getElementById('imCalcResult');
    if (calcResult) { calcResult.style.display = 'none'; calcResult.innerHTML = ''; }

    const calcConfig = ind.calcKey && window.INDICATOR_CALCULATORS ? window.INDICATOR_CALCULATORS[ind.calcKey] : null;

    if (calcConfig) {
        calcBox.style.display = 'block';
        document.getElementById('imCalcTitle').textContent = calcConfig.title;
        calcFields.innerHTML = calcConfig.fields.map(f => {
            if (f.type === 'select') {
                return `
                    <div class="form-group">
                        <label>${f.label}</label>
                        <select id="imf_${f.id}">
                            ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            return `
                <div class="form-group">
                    <label>${f.label}</label>
                    <input type="number" id="imf_${f.id}" value="${f.val || ''}" step="${f.step || 'any'}">
                </div>
            `;
        }).join('');
    } else {
        calcBox.style.display = 'none';
    }

    overlay.classList.add('open');
}

function closeIndicatorModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
    const overlay = document.getElementById('indicatorModalOverlay');
    if (overlay) overlay.classList.remove('open');
    activeIndicatorForCalc = null;
}

function runIndicatorCalc() {
    if (!activeIndicatorForCalc || !activeIndicatorForCalc.calcKey) return;
    const calcConfig = window.INDICATOR_CALCULATORS[activeIndicatorForCalc.calcKey];
    if (!calcConfig) return;

    const vals = {};
    calcConfig.fields.forEach(f => {
        const el = document.getElementById('imf_' + f.id);
        if (el) vals[f.id] = el.value;
    });

    const res = calcConfig.calc(vals);
    const resultBox = document.getElementById('imCalcResult');
    if (!res || !resultBox) return;

    const metricsHtml = (res.metrics || []).map(m => `
        <div class="im-metric-pill">
            <span class="lbl">${m.label}</span>
            <span class="val">${m.val}</span>
        </div>
    `).join('');

    resultBox.innerHTML = `
        <div class="im-calc-status-badge ${res.color || 'blue'}">
            <i class="fas fa-signal"></i> ${res.signal}
        </div>
        <p class="im-calc-explanation">${res.text}</p>
        <div class="im-metrics-row">${metricsHtml}</div>
    `;
    resultBox.style.display = 'block';
}

// ══════════════════════════════════════════════
//  8. ENHANCED TRADING JOURNAL (localStorage)
// ══════════════════════════════════════════════

const JKEY = 'tb-journal-v3';

function jLoad() {
    try {
        const v3 = localStorage.getItem(JKEY);
        if (v3) return JSON.parse(v3);
        const v2 = localStorage.getItem('tb-journal-v2');
        if (v2) {
            const parsed = JSON.parse(v2);
            localStorage.setItem(JKEY, JSON.stringify(parsed));
            return parsed;
        }
        return [];
    } catch(e) {
        return [];
    }
}

function jSave(t) {
    try {
        localStorage.setItem(JKEY, JSON.stringify(t));
    } catch(e) {}
}

function openTradeModal(editId) {
    const ov = document.getElementById('tradeModalOverlay');
    if (!ov) return;
    document.getElementById('tradeForm').reset();
    const di = document.getElementById('tf-date');
    if (di) di.value = new Date().toISOString().split('T')[0];
    document.getElementById('tf-editid').value = '';
    document.getElementById('modalTitle').textContent = currentLang === 'am' ? 'አዲስ ትሬድ መዝግብ' : 'Add Trade';

    if (editId) {
        const t = jLoad().find(x => x.id === editId);
        if (t) {
            ['date','pair','dir','entry','exit','sl','tp','size','pl','strategy','screenshot','notes','instrument'].forEach(k => {
                const el = document.getElementById('tf-' + k);
                if (el) el.value = t[k] ?? '';
            });
            document.getElementById('tf-editid').value = editId;
            document.getElementById('modalTitle').textContent = currentLang === 'am' ? 'ትሬድ አስተካክል' : 'Edit Trade';
        }
    }
    ov.classList.add('open');
}

function closeTradeModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
    const ov = document.getElementById('tradeModalOverlay');
    if (ov) ov.classList.remove('open');
}

function saveTrade(e) {
    e.preventDefault();
    const editId = document.getElementById('tf-editid').value;
    const trades = jLoad();

    const en = parseFloat(document.getElementById('tf-entry').value) || 0;
    const ex = parseFloat(document.getElementById('tf-exit').value) || null;
    const sl = parseFloat(document.getElementById('tf-sl').value) || 0;
    const tp = parseFloat(document.getElementById('tf-tp').value) || 0;
    const plRaw = document.getElementById('tf-pl').value;
    const pl = plRaw !== '' ? parseFloat(plRaw) : null;

    const risk = Math.abs(en - sl);
    const reward = Math.abs(tp - en);
    const rr = risk > 0 ? (reward / risk).toFixed(2) : '1:2';

    const trade = {
        id: editId || Date.now().toString(),
        date: document.getElementById('tf-date').value,
        instrument: document.getElementById('tf-instrument')?.value || 'Forex',
        pair: document.getElementById('tf-pair').value.toUpperCase().trim(),
        dir: document.getElementById('tf-dir').value,
        entry: en,
        exit: ex,
        sl: sl,
        tp: tp,
        size: parseFloat(document.getElementById('tf-size').value) || 0,
        pl: pl,
        rr: rr,
        strategy: document.getElementById('tf-strategy').value,
        screenshot: document.getElementById('tf-screenshot')?.value?.trim() || '',
        notes: document.getElementById('tf-notes').value.trim()
    };

    if (editId) {
        const idx = trades.findIndex(x => x.id === editId);
        if (idx > -1) trades[idx] = trade;
        else trades.push(trade);
    } else {
        trades.push(trade);
    }

    jSave(trades);
    closeTradeModal();
    renderJournal();
}

function deleteTrade(id) {
    if (!confirm(currentLang === 'am' ? 'ይህን ትሬድ ማጥፋት ይፈልጋሉ?' : 'Delete this trade from your journal?')) return;
    jSave(jLoad().filter(t => t.id !== id));
    renderJournal();
}

function exportJournal() {
    const trades = jLoad();
    if (!trades.length) return alert(currentLang === 'am' ? 'ምንም የሚወጣ ትሬድ የለም።' : 'No trades to export.');
    const header = ['Date','Instrument','Pair','Direction','Entry','Exit','SL','TP','Size','PL','RR','Strategy','Screenshot','Notes'];
    const rows = trades.map(t => [
        t.date || '',
        t.instrument || 'Forex',
        t.pair || '',
        t.dir || '',
        t.entry || '',
        t.exit || '',
        t.sl || '',
        t.tp || '',
        t.size || '',
        t.pl ?? '',
        t.rr || '',
        t.strategy || '',
        t.screenshot || '',
        (t.notes || '').replace(/,/g, ' ').replace(/\n/g, ' ')
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `tagbridge-trading-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function importJournal(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const lines = (evt.target.result || '').split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) return alert('Invalid or empty CSV file.');
            const existing = jLoad();

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length >= 4) {
                    existing.push({
                        id: Date.now().toString() + '_' + i,
                        date: cols[0] || new Date().toISOString().split('T')[0],
                        instrument: cols[1] || 'Forex',
                        pair: cols[2] ? cols[2].toUpperCase() : 'EUR/USD',
                        dir: cols[3] || 'BUY',
                        entry: parseFloat(cols[4]) || 0,
                        exit: parseFloat(cols[5]) || null,
                        sl: parseFloat(cols[6]) || 0,
                        tp: parseFloat(cols[7]) || 0,
                        size: parseFloat(cols[8]) || 0.1,
                        pl: cols[9] !== '' ? parseFloat(cols[9]) : null,
                        rr: cols[10] || '1:2',
                        strategy: cols[11] || '',
                        screenshot: cols[12] || '',
                        notes: cols.slice(13).join(' ') || ''
                    });
                }
            }
            jSave(existing);
            renderJournal();
            alert(`Successfully imported trades! Total: ${existing.length}`);
        } catch(err) {
            alert('Failed to parse CSV file: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function clearJournal() {
    if (!confirm(currentLang === 'am' ? 'ሁሉንም ትሬዶች ማጥፋት ይፈልጋሉ? ይህ አይመለስም።' : 'Clear ALL trades? This cannot be undone.')) return;
    jSave([]);
    renderJournal();
}

function renderJournal() {
    const trades = jLoad();
    const tbody = document.getElementById('tradeTableBody');
    if (!tbody) return;

    if (!trades.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="13"><i class="fas fa-journal-whills"></i><br>${currentLang === 'am' ? 'ምንም የተመዘገበ ትሬድ የለም — አዲስ ትሬድ መዝግብ የሚለውን ይጫኑ!' : 'No trades logged yet — start adding!'}</td></tr>`;
        updateJournalStats([]);
        return;
    }

    tbody.innerHTML = trades.sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => {
        const plCls = t.pl != null ? (t.pl >= 0 ? 'win' : 'loss') : '';
        const plStr = t.pl != null ? (t.pl >= 0 ? '+' : '') + '$' + t.pl.toFixed(2) : '--';
        const chartLink = t.screenshot ? `<a href="${t.screenshot}" target="_blank" rel="noopener noreferrer" class="trade-chart-thumb-link" title="Open Chart"><i class="fas fa-image"></i></a>` : '<span style="opacity:0.4;">--</span>';

        return `<tr>
            <td>${t.date || '--'}</td>
            <td><strong>${t.pair || '--'}</strong> <small style="opacity:0.7;display:block;">${t.instrument || ''}</small></td>
            <td><span class="trade-dir ${(t.dir || '').toLowerCase()}">${t.dir || '--'}</span></td>
            <td>${t.entry || '--'}</td>
            <td>${t.exit != null ? t.exit : '--'}</td>
            <td>${t.sl || '--'}</td>
            <td>${t.tp || '--'}</td>
            <td>${t.size || '--'}</td>
            <td class="trade-pl ${plCls}">${plStr}</td>
            <td>${t.rr || '--'}</td>
            <td title="${t.notes || ''}">${(t.strategy || '--')}</td>
            <td style="text-align:center;">${chartLink}</td>
            <td>
                <button class="trade-action-btn" onclick="openTradeModal('${t.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="trade-action-btn del" onclick="deleteTrade('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');

    updateJournalStats(trades);
}

function updateJournalStats(trades) {
    const settled = trades.filter(t => t.pl != null);
    const wins = settled.filter(t => t.pl > 0).length;
    const losses = settled.filter(t => t.pl < 0).length;
    const total = settled.length;
    const wr = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0%';
    const totalPL = settled.reduce((s,t) => s + (t.pl || 0), 0);
    const avgRR = trades.filter(t => t.rr).reduce((s,t) => s + parseFloat(t.rr || 0), 0) / (trades.filter(t => t.rr).length || 1);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('js-winrate', wr);
    set('js-totalpl', (totalPL >= 0 ? '+' : '') + '$' + totalPL.toFixed(2));
    set('js-totaltrades', trades.length);
    set('js-avgrr', avgRR.toFixed(2));

    const plEl = document.getElementById('js-totalpl');
    if (plEl) plEl.style.color = totalPL >= 0 ? 'var(--brand-green)' : 'var(--brand-red)';

    const winBar = document.getElementById('journalWinBar');
    if (winBar) {
        const pct = total > 0 ? Math.round((wins / total) * 100) : 50;
        winBar.style.width = pct + '%';
        winBar.title = `Wins: ${wins} | Losses: ${losses}`;
    }
}

// ══════════════════════════════════════════════
//  9. AI BOT (preserved from original + improved)
// ══════════════════════════════════════════════

function toggleBot() {
    const sidebar = document.getElementById('botSidebar');
    const overlay = document.getElementById('botOverlay');
    if(!sidebar) return;
    const isOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
    if(!isOpen && !sidebar.dataset.initialized) {
        sidebar.dataset.initialized = '1';
        initBotGreeting();
    }
}

function initBotGreeting() {
    botMsg('bot', currentLang==='am'
        ? 'ሰላም! 👋 እኔ ታግ ብሪጅ AI ረዳት ነኝ። ስለ ፎሬክስ፣ ክሪፕቶ፣ SMC፣ ቴክኒካል እና ፈንደመንታል ትንታኔ፣ ወይም የስጋት አስተዳደር ጥያቄዎችን በነፃነት ይጠይቁኝ!'
        : 'Hello! 👋 I\'m the Tag Bridge AI Assistant. Ask me anything about Forex, Crypto, Smart Money Concepts (SMC), Technical & Fundamental analysis, or Risk Management!');
    setQuickOpts([
        '📊 What is Forex trading?',
        '🧠 Explain Smart Money Concepts (SMC)',
        '📐 How to calculate Position Size?',
        '📈 What is RSI Divergence?',
        '₿ How does Crypto & DeFi work?',
        '🧘 How to overcome FOMO in trading?'
    ]);
}

function handleTopicChip(topic) {
    const prompts = {
        'Forex': currentLang === 'am' ? 'ስለ ፎሬክስ ገበያ መሰረታዊ ህጎች እና ከጀማሪነት ወደ ፕሮፌሽናልነት እንዴት መሸጋገር እንዳለብኝ አብራራልኝ?' : 'Explain the fundamentals of Forex trading and how beginners can become consistent.',
        'Crypto': currentLang === 'am' ? 'የክሪፕቶ ከረንሲ እና የብሎክቼይን መሰረታዊ መርሆዎችን አብራራልኝ?' : 'Explain the core principles of Cryptocurrency, DeFi, and Blockchain.',
        'SMC': currentLang === 'am' ? 'Smart Money Concepts (SMC) ምንድን ነው? Order Block እና Fair Value Gap (FVG) እንዴት እንደሚሰሩ አብራራልኝ?' : 'What are Smart Money Concepts (SMC)? Explain Order Blocks and Fair Value Gaps in detail.',
        'Technical': currentLang === 'am' ? 'ዋና ዋና የቴክኒካል አናሊሲስ ሻማዎች (Candlestick patterns) እና ድጋፍና ተቃውሞን እንዴት መለየት እችላለሁ?' : 'What are the most reliable candlestick and chart patterns in technical analysis?',
        'Risk': currentLang === 'am' ? 'የትሬዲንግ 1% Risk Rule እና የ Position Size ስሌት እንዴት ካፒታሌን ይጠብቅልኛል?' : 'How does the 1% risk rule and proper position sizing protect trading capital?',
        'Psychology': currentLang === 'am' ? 'የትሬዲንግ ጭንቀትን፣ ስግብግብነትን (Greed) እና FOMOን እንዴት መቆጣጠር እችላለሁ?' : 'How can a trader overcome psychological barriers like FOMO, fear, and revenge trading?',
        'Terminology': currentLang === 'am' ? 'ዋና ዋና የፎሬክስ ቃላትን (Pips, Lots, Spread, Leverage, Margin) በአጭሩ አስረዳኝ?' : 'Provide a clear glossary of key trading terms: Pip, Lot, Leverage, Margin, Spread.'
    };

    const text = prompts[topic] || `Tell me about ${topic}`;
    sendBotMsg(text);
}

function botMsg(type, text) {
    const msgs = document.getElementById('botMessages'); if(!msgs) return;
    const div = document.createElement('div');
    div.className = 'bot-msg ' + type;
    div.innerHTML = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function setQuickOpts(opts) {
    const el = document.getElementById('botOpts'); if(!el) return;
    el.innerHTML = opts.map(o=>
        `<button class="bot-opt" onclick="handleQuickOpt(this, '${o.replace(/'/g,"&#39;")}')">${o}</button>`
    ).join('');
}

function handleQuickOpt(btn, text) {
    btn.disabled = true;
    sendBotMsg(text);
}

async function sendBotMsg(prefill) {
    const input = document.getElementById('botInput');
    const text  = prefill || (input ? input.value.trim() : '');
    if(!text) return;
    if(input) input.value = '';
    const opts = document.getElementById('botOpts');
    if(opts) opts.innerHTML = '';
    botMsg('user', text);
    showTyping();
    try {
        const reply = await callGeminiProxy(text);
        hideTyping();
        botMsg('bot', formatBotReply(reply));
    } catch(e) {
        hideTyping();
        botMsg('bot', '⚠️ Network error. Please try again later. / ኔትወርክ ችግር። ቆየት ብለው ይሞክሩ።');
    }
    setQuickOpts(['📊 More Forex','₿ More Crypto','🧠 SMC concepts','📐 Risk tips','🔙 Main menu']);
}

let typingEl = null;
function showTyping() {
    const msgs = document.getElementById('botMessages'); if(!msgs) return;
    typingEl = document.createElement('div');
    typingEl.className = 'bot-msg typing';
    typingEl.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    msgs.appendChild(typingEl);
    msgs.scrollTop = msgs.scrollHeight;
}
function hideTyping() { if(typingEl) { typingEl.remove(); typingEl=null; } }

async function callGeminiProxy(text) {
    const systemPrompt = `You are Tag Bridge AI Bot — a professional trading education assistant specializing in Forex and Cryptocurrency trading.
Rules:
1. Always respond in the same language as the user's message (Amharic or English).
2. Explain concepts clearly for beginners while supporting advanced traders.
3. NEVER provide specific buy/sell signals or guaranteed profit predictions.
4. ALWAYS emphasize risk management and capital protection.
5. Keep responses concise but informative.
6. Mention Tag Bridge books when relevant (Forex Book at 350 Birr on Telegram: https://t.me/tagbridge123).
7. For calculations, encourage the user to use the built-in calculators.`;

    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, system: systemPrompt })
    });
    if(!res.ok) throw new Error('API '+res.status);
    const data = await res.json();
    return data.reply || 'No response received.';
}

function formatBotReply(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/#{1,3}\s+(.*)/g, '<strong style="display:block;margin-top:8px">$1</strong>');
}

// ══════════════════════════════════════════════
//  10. BOOK ORDER — REDIRECTION TO TELEGRAM
//  Forex book MUST redirect directly to: https://t.me/tagbridge123
// ══════════════════════════════════════════════

document.addEventListener('click', e => {
    // Intercept clicks on any element with data-book or specific class
    const btn = e.target.closest('.btn-buy');
    if(btn) {
        const book = btn.dataset.book;
        const msgs = {
            forex:  'https://t.me/tagbridge123',
            crypto: 'https://t.me/tagbridge_book_bot?start=crypto_book',
            bundle: 'https://t.me/tagbridge_book_bot?start=bundle_order'
        };
        if(msgs[book]) {
            e.preventDefault();
            window.open(msgs[book], '_blank', 'noopener,noreferrer');
        }
        return;
    }

    // Intercept any clicks on Forex book elements
    const forexTarget = e.target.closest('.btn-buy-forex-hero, .forex-title-link, .hero-price-link, .forex-book-3d-link, .product-card--forex-link');
    if(forexTarget) {
        // Let natural <a> link open in new tab or ensure redirection
        window.open('https://t.me/tagbridge123', '_blank', 'noopener,noreferrer');
        e.preventDefault();
    }
});

// ══════════════════════════════════════════════
//  11. SERVICE WORKER UPDATE BANNER
// ══════════════════════════════════════════════

function initSWBanner() {
    if(!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            worker.addEventListener('statechange', () => {
                if(worker.state==='installed' && navigator.serviceWorker.controller) {
                    const banner = document.getElementById('updateBanner');
                    if(banner) banner.style.display='flex';
                    const btn = document.getElementById('updateNowBtn');
                    if(btn) btn.onclick = () => { worker.postMessage({type:'SKIP_WAITING'}); location.reload(); };
                }
            });
        });
    });
}

// ══════════════════════════════════════════════
//  12. INIT
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Theme & lang
    applyTheme(currentTheme);
    applyLang(currentLang);

    // Scroll effects
    initScrollEffects();

    // Particles
    initParticles();

    // Charts: render Forex pairs by default, load Gold
    renderChartPairs('forex');
    // Select Gold (index 0 in forex = XAUUSD) as default
    const chartSel = document.getElementById('chartPairSelect');
    if (chartSel) { chartSel.selectedIndex = 0; switchChartFromSelect(chartSel); }
    else loadTVChart('XAUUSD');
    const pe = document.getElementById('chartPairLabel');
    if (pe) pe.textContent = 'XAU/USD';
    // Apply saved chart theme state
    if (chartTheme === 'light') {
        const btn   = document.getElementById('chartThemeToggle');
        const label = document.getElementById('chartThemeLabel');
        const cont  = document.getElementById('chartContainer');
        if (btn)   btn.classList.add('ctt-light');
        if (label) label.textContent = 'Dark';
        if (cont)  cont.style.background = '#ffffff';
    }
    loadTVMarketOverview();

    // Load Economic Calendar & Market News
    loadTVEconomicCalendar();
    loadTVMarketNews();

    // Initialize 200+ Indicators
    if (typeof initIndicators === 'function') {
        initIndicators();
    }

    // Academy preview removed — full content lives at /academy (password protected)

    // Calculators: load default
    renderCalc('possize');

    // Backtesting: init strategy params
    btUpdateStrategyFields();

    // Journal
    renderJournal();

    // Demo account
    initDemo();

    // Market data (staggered to avoid rate-limiting)
    refreshMarketData();
    setTimeout(refreshMovers, 1500);
    setTimeout(refreshFearGreed, 3000);

    // Refresh prices every 60 seconds
    setInterval(refreshMarketData, 60000);

    // SW update banner
    initSWBanner();

    // Smooth nav click to close mobile menu
    document.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', () => {
            const wrap = document.getElementById('navLinksWrap');
            const btn  = document.getElementById('mobileMenuBtn');
            if(wrap) wrap.classList.remove('mobile-open');
            if(btn)  btn.classList.remove('open');
        });
    });

    console.log('🚀 Tag Bridge Trading Ecosystem v2.0 Upgraded & Initialized');
});


// ══════════════════════════════════════════════
//  BACKTESTING ENGINE
//  Strategies: MA Cross, RSI, Breakout, MACD
//  Features: Equity curve, price chart with signals,
//            monthly P&L bar chart, trade log, CSV export
// ══════════════════════════════════════════════

const BT_STRATEGY_PARAMS = {
    ma_cross: [
        { id: 'bt-fast-ma', label: 'Fast EMA Period', val: 9,  min: 2,  max: 50  },
        { id: 'bt-slow-ma', label: 'Slow EMA Period', val: 21, min: 5,  max: 200 }
    ],
    rsi: [
        { id: 'bt-rsi-period',    label: 'RSI Period',         val: 14, min: 2,  max: 50  },
        { id: 'bt-rsi-oversold',  label: 'Oversold Level',     val: 30, min: 10, max: 45  },
        { id: 'bt-rsi-overbought',label: 'Overbought Level',   val: 70, min: 55, max: 90  }
    ],
    breakout: [
        { id: 'bt-bk-period',  label: 'Lookback Periods', val: 20, min: 5, max: 100 }
    ],
    macd: [
        { id: 'bt-macd-fast',   label: 'Fast EMA',   val: 12, min: 2,  max: 50  },
        { id: 'bt-macd-slow',   label: 'Slow EMA',   val: 26, min: 5,  max: 200 },
        { id: 'bt-macd-signal', label: 'Signal Line',val: 9,  min: 2,  max: 50  }
    ]
};

function btUpdateStrategyFields() {
    const strategy = document.getElementById('bt-strategy').value;
    const params   = BT_STRATEGY_PARAMS[strategy] || [];
    const container = document.getElementById('btStrategyParams');
    container.innerHTML = params.map(p => `
        <div class="bt-field">
            <label>${p.label}</label>
            <input type="number" id="${p.id}" value="${p.val}" min="${p.min}" max="${p.max}" step="1">
        </div>
    `).join('');
    container.style.display = params.length ? 'grid' : 'none';
}

// ── OHLC Generator (seeded pseudo-random walk) ──
function btGenerateOHLC(instrument, bars) {
    const seeds = { EURUSD:1.0850, GBPUSD:1.2650, XAUUSD:1950, BTCUSD:42000, USDJPY:148.5 };
    const volatility = { EURUSD:.0020, GBPUSD:.0028, XAUUSD:8, BTCUSD:400, USDJPY:.25 };
    let price  = seeds[instrument] || 1.0850;
    const vol  = volatility[instrument] || .002;
    const data = [];
    // simple seeded LCG for reproducibility
    let seed = 12345 + bars;
    function rng() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }
    const trend = (rng() > 0.5 ? 1 : -1) * 0.0001 * vol;
    for (let i = 0; i < bars; i++) {
        const move   = (rng() - 0.499) * vol * 2;
        const open   = price;
        price       += move + trend;
        const hi     = Math.max(open, price) + rng() * vol * 0.5;
        const lo     = Math.min(open, price) - rng() * vol * 0.5;
        const close  = price;
        const date   = new Date(Date.now() - (bars - i) * 4 * 3600 * 1000); // 4H bars
        data.push({ date, open, high: hi, low: lo, close, i });
    }
    return data;
}

// ── Indicator Helpers ──
function calcEMA(prices, period) {
    const k = 2 / (period + 1);
    const ema = [];
    let prev = null;
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) { ema.push(null); continue; }
        if (prev === null) {
            prev = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
            ema.push(prev); continue;
        }
        prev = prices[i] * k + prev * (1 - k);
        ema.push(prev);
    }
    return ema;
}

function calcRSI(prices, period) {
    const rsi = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period) { rsi.push(null); continue; }
        let gains = 0, losses = 0;
        for (let j = i - period + 1; j <= i; j++) {
            const d = prices[j] - prices[j - 1];
            if (d > 0) gains += d; else losses -= d;
        }
        const rs = gains / (losses || 0.0001);
        rsi.push(100 - 100 / (1 + rs));
    }
    return rsi;
}

function calcMACD(prices, fast, slow, signal) {
    const fastEMA   = calcEMA(prices, fast);
    const slowEMA   = calcEMA(prices, slow);
    const macdLine  = prices.map((_, i) =>
        fastEMA[i] !== null && slowEMA[i] !== null ? fastEMA[i] - slowEMA[i] : null);
    const filled    = macdLine.filter(v => v !== null);
    const signalRaw = calcEMA(filled, signal);
    const signalLine = [];
    let fi = 0;
    for (let i = 0; i < macdLine.length; i++) {
        if (macdLine[i] === null) { signalLine.push(null); continue; }
        signalLine.push(signalRaw[fi++] ?? null);
    }
    return { macdLine, signalLine };
}

// ── Signal Generators ──
function btSignalMACross(data, fastP, slowP) {
    const closes = data.map(d => d.close);
    const fast   = calcEMA(closes, fastP);
    const slow   = calcEMA(closes, slowP);
    const signals = [];
    for (let i = 1; i < data.length; i++) {
        if (fast[i] === null || slow[i] === null || fast[i-1] === null || slow[i-1] === null) {
            signals.push(0); continue;
        }
        if (fast[i-1] <= slow[i-1] && fast[i] > slow[i]) { signals.push(1);  continue; }
        if (fast[i-1] >= slow[i-1] && fast[i] < slow[i]) { signals.push(-1); continue; }
        signals.push(0);
    }
    signals.unshift(0);
    return signals;
}

function btSignalRSI(data, period, oversold, overbought) {
    const closes  = data.map(d => d.close);
    const rsi     = calcRSI(closes, period);
    const signals = [];
    for (let i = 1; i < data.length; i++) {
        if (rsi[i] === null || rsi[i-1] === null) { signals.push(0); continue; }
        if (rsi[i-1] <= oversold  && rsi[i] > oversold)  { signals.push(1);  continue; }
        if (rsi[i-1] >= overbought && rsi[i] < overbought) { signals.push(-1); continue; }
        signals.push(0);
    }
    signals.unshift(0);
    return signals;
}

function btSignalBreakout(data, lookback) {
    const signals = [];
    for (let i = 0; i < data.length; i++) {
        if (i < lookback) { signals.push(0); continue; }
        const window = data.slice(i - lookback, i);
        const hh = Math.max(...window.map(d => d.high));
        const ll = Math.min(...window.map(d => d.low));
        if (data[i].close > hh) { signals.push(1); }
        else if (data[i].close < ll) { signals.push(-1); }
        else signals.push(0);
    }
    return signals;
}

function btSignalMACD(data, fast, slow, signal) {
    const closes  = data.map(d => d.close);
    const { macdLine, signalLine } = calcMACD(closes, fast, slow, signal);
    const signals = [];
    for (let i = 1; i < data.length; i++) {
        if (macdLine[i] === null || signalLine[i] === null || macdLine[i-1] === null || signalLine[i-1] === null) {
            signals.push(0); continue;
        }
        if (macdLine[i-1] <= signalLine[i-1] && macdLine[i] > signalLine[i]) { signals.push(1); continue; }
        if (macdLine[i-1] >= signalLine[i-1] && macdLine[i] < signalLine[i]) { signals.push(-1); continue; }
        signals.push(0);
    }
    signals.unshift(0);
    return signals;
}

// ── Trade Simulator ──
function btSimulate(data, signals, balance, riskPct, slPips, tpPips, instrument) {
    const pipSize  = instrument === 'USDJPY' ? 0.01 : instrument === 'XAUUSD' ? 0.01 : instrument === 'BTCUSD' ? 1 : 0.0001;
    const pipValue = instrument === 'USDJPY' ? (0.01 / data[0].close) * 100000 : instrument === 'XAUUSD' ? 1 : instrument === 'BTCUSD' ? 1 : 10;
    const trades   = [];
    const equity   = [{ date: data[0].date, balance }];
    let inTrade    = false;
    let entry      = null;

    for (let i = 1; i < data.length; i++) {
        const bar = data[i];

        if (inTrade && entry) {
            const sl = entry.direction === 'BUY'
                ? entry.price - slPips * pipSize
                : entry.price + slPips * pipSize;
            const tp = entry.direction === 'BUY'
                ? entry.price + tpPips * pipSize
                : entry.price - tpPips * pipSize;

            let exitPrice = null, exitType = null;
            if (entry.direction === 'BUY') {
                if (bar.low  <= sl) { exitPrice = sl; exitType = 'SL'; }
                if (bar.high >= tp) { exitPrice = tp; exitType = 'TP'; }
            } else {
                if (bar.high >= sl) { exitPrice = sl; exitType = 'SL'; }
                if (bar.low  <= tp) { exitPrice = tp; exitType = 'TP'; }
            }

            if (exitPrice !== null) {
                const priceDiff = entry.direction === 'BUY' ? exitPrice - entry.price : entry.price - exitPrice;
                const pips      = priceDiff / pipSize;
                const pnl       = pips * pipValue * entry.lots;
                balance        += pnl;

                trades.push({
                    n:         trades.length + 1,
                    entryDate: entry.date,
                    direction: entry.direction,
                    entry:     entry.price,
                    exit:      exitPrice,
                    sl, tp,
                    pips:      +pips.toFixed(1),
                    pnl:       +pnl.toFixed(2),
                    balance:   +balance.toFixed(2),
                    result:    exitType === 'TP' ? 'WIN' : 'LOSS',
                    entryBar:  entry.bar,
                    exitBar:   i
                });
                equity.push({ date: bar.date, balance: +balance.toFixed(2) });
                inTrade = false;
                entry   = null;
            }
        }

        if (!inTrade && signals[i] !== 0) {
            const riskUSD = balance * (riskPct / 100);
            const lots    = +(riskUSD / (slPips * pipValue)).toFixed(2) || 0.01;
            inTrade       = true;
            entry         = {
                direction: signals[i] === 1 ? 'BUY' : 'SELL',
                price:     bar.close,
                date:      bar.date,
                lots,
                bar:       i
            };
        }

        if (i % 10 === 0) equity.push({ date: bar.date, balance: +balance.toFixed(2) });
    }

    return { trades, equity };
}

// ── Statistics Calculator ──
function btCalcStats(trades, startBalance, equity) {
    if (!trades.length) return null;
    const wins   = trades.filter(t => t.result === 'WIN');
    const losses = trades.filter(t => t.result === 'LOSS');
    const totalPnl   = trades.reduce((s, t) => s + t.pnl, 0);
    const winRate    = (wins.length / trades.length) * 100;
    const avgWin     = wins.length   ? wins.reduce((s, t) => s + t.pnl, 0)   / wins.length   : 0;
    const avgLoss    = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const profitFactor = losses.length ? Math.abs(wins.reduce((s,t)=>s+t.pnl,0)) / Math.abs(losses.reduce((s,t)=>s+t.pnl,0)) : Infinity;

    // Max Drawdown
    let peak = startBalance, maxDD = 0;
    equity.forEach(e => {
        if (e.balance > peak) peak = e.balance;
        const dd = ((peak - e.balance) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
    });

    // Sharpe (simplified)
    const returns = equity.map((e, i) => i === 0 ? 0 : (e.balance - equity[i-1].balance) / equity[i-1].balance);
    const meanR   = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdR    = Math.sqrt(returns.map(r => (r - meanR) ** 2).reduce((a, b) => a + b, 0) / returns.length);
    const sharpe  = stdR > 0 ? ((meanR / stdR) * Math.sqrt(252)).toFixed(2) : 'N/A';

    // Consecutive wins/losses
    let maxWinStreak = 0, maxLossStreak = 0, streak = 0, prevResult = null;
    trades.forEach(t => {
        if (t.result === prevResult) { streak++; } else { streak = 1; }
        prevResult = t.result;
        if (t.result === 'WIN'  && streak > maxWinStreak)  maxWinStreak  = streak;
        if (t.result === 'LOSS' && streak > maxLossStreak) maxLossStreak = streak;
    });

    return {
        total: trades.length, wins: wins.length, losses: losses.length,
        winRate: +winRate.toFixed(1),
        totalPnl: +totalPnl.toFixed(2),
        finalBalance: +(startBalance + totalPnl).toFixed(2),
        returnPct: +((totalPnl / startBalance) * 100).toFixed(2),
        avgWin: +avgWin.toFixed(2), avgLoss: +avgLoss.toFixed(2),
        profitFactor: isFinite(profitFactor) ? +profitFactor.toFixed(2) : '∞',
        maxDD: +maxDD.toFixed(2), sharpe,
        maxWinStreak, maxLossStreak
    };
}

// ── Monthly P&L aggregation ──
function btMonthlyPnL(trades) {
    const map = {};
    trades.forEach(t => {
        const d   = new Date(t.entryDate);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        map[key]  = (map[key] || 0) + t.pnl;
    });
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({ month: k, pnl: +v.toFixed(2) }));
}

// ══════════════════════════════════════════════
//  SPLIT CHART ENGINE
// ══════════════════════════════════════════════

const BTC = {           // chart state
    data:       [],     // full OHLC array
    trades:     [],
    equity:     [],
    startBal:   10000,
    viewStart:  0,      // first visible bar index
    viewBars:   80,     // how many bars to show
    pricePH:    380,    // price pane height (px) — updated by splitter
    equityPH:   140,
    candleMode: true,   // true = candles, false = line
    replayBar:  -1,     // current replay position (-1 = off)
    replayTimer: null,
    crossX:     -1,
    crossY:     -1,
    isDragging: false,
    dragStartX: 0,
    dragStartView: 0
};

const PAD = { t: 14, r: 60, b: 28, l: 10 };

// ── coordinate helpers ──
function btPriceRange(start, end) {
    const slice = BTC.data.slice(start, end);
    if (!slice.length) return { min: 0, max: 1 };
    const min = Math.min(...slice.map(d => d.low))  * 0.9985;
    const max = Math.max(...slice.map(d => d.high)) * 1.0015;
    return { min, max };
}

function btToX(canvas, barIdx) {
    const W    = canvas.width;
    const cW   = W - PAD.l - PAD.r;
    const relI = barIdx - BTC.viewStart;
    return PAD.l + (relI + 0.5) * (cW / BTC.viewBars);
}

function btToY(canvas, price, min, max) {
    const H  = canvas.height;
    const cH = H - PAD.t - PAD.b;
    return PAD.t + (1 - (price - min) / (max - min)) * cH;
}

function btBarWidth(canvas) {
    const cW = canvas.width - PAD.l - PAD.r;
    return Math.max(1.5, cW / BTC.viewBars);
}

// ── draw grid + price axis ──
function btDrawGrid(ctx, W, H, min, max, gridLines = 5) {
    const C = btColors();
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 1;
    for (let g = 0; g <= gridLines; g++) {
        const y   = PAD.t + ((H - PAD.t - PAD.b) * g / gridLines);
        const val = max - (max - min) * (g / gridLines);
        ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
        ctx.fillStyle  = C.axisText;
        ctx.font       = '9px Inter';
        ctx.textAlign  = 'left';
        ctx.fillText(val.toFixed(val > 100 ? 1 : 5), W - PAD.r + 4, y + 3);
    }
}

// ── draw time axis labels ──
function btDrawTimeAxis(ctx, canvas) {
    const W    = canvas.width;
    const H    = canvas.height;
    const C    = btColors();
    const step = Math.max(1, Math.floor(BTC.viewBars / 6));
    ctx.fillStyle = C.timeText;
    ctx.font      = '9px Inter';
    ctx.textAlign = 'center';
    for (let i = 0; i < BTC.viewBars; i += step) {
        const idx = BTC.viewStart + i;
        if (idx >= BTC.data.length) break;
        const d = new Date(BTC.data[idx].date);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const x = btToX(canvas, idx);
        ctx.fillText(label, x, H - 4);
    }
}

// ── draw candles ──
function btDrawCandles(ctx, canvas, min, max) {
    const bW  = btBarWidth(canvas);
    const end = Math.min(BTC.viewStart + BTC.viewBars, BTC.data.length);
    const limit = BTC.replayBar >= 0 ? Math.min(BTC.replayBar + 1, end) : end;

    for (let i = BTC.viewStart; i < limit; i++) {
        const d  = BTC.data[i];
        const x  = btToX(canvas, i);
        const oY = btToY(canvas, d.open,  min, max);
        const cY = btToY(canvas, d.close, min, max);
        const hY = btToY(canvas, d.high,  min, max);
        const lY = btToY(canvas, d.low,   min, max);
        const up = d.close >= d.open;
        const col = up ? '#10b981' : '#ef4444';

        if (BTC.candleMode) {
            // Wick
            ctx.strokeStyle = col; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, hY); ctx.lineTo(x, lY); ctx.stroke();
            // Body
            const bodyH = Math.max(1, Math.abs(cY - oY));
            const bodyY = Math.min(oY, cY);
            ctx.fillStyle   = up ? col : col;
            ctx.strokeStyle = col;
            ctx.lineWidth   = 1;
            if (bW > 4) {
                ctx.fillRect(x - bW * 0.4, bodyY, bW * 0.8, bodyH);
            } else {
                ctx.fillRect(x - 0.5, bodyY, 1, bodyH);
            }
        } else {
            // Line mode — draw segment to next
            if (i > BTC.viewStart) {
                const prev  = BTC.data[i - 1];
                const prevX = btToX(canvas, i - 1);
                const prevY = btToY(canvas, prev.close, min, max);
                ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(x, cY);
                ctx.strokeStyle = btColors().priceLine; ctx.lineWidth = 1.5; ctx.stroke();
            }
        }
    }
}

// ── draw SL/TP & trade markers ──
function btDrawTradeOverlays(ctx, canvas, min, max) {
    const C   = btColors();
    const bW  = btBarWidth(canvas);
    const end = Math.min(BTC.viewStart + BTC.viewBars, BTC.data.length);
    const limit = BTC.replayBar >= 0 ? BTC.replayBar + 1 : end;

    BTC.trades.forEach(t => {
        if (t.entryBar > limit || t.exitBar < BTC.viewStart) return;

        const ex  = btToX(canvas, t.entryBar);
        const ey  = btToY(canvas, t.entry, min, max);
        const xx  = btToX(canvas, t.exitBar);
        const xy  = btToY(canvas, t.exit,  min, max);
        const slY = btToY(canvas, t.sl,    min, max);
        const tpY = btToY(canvas, t.tp,    min, max);
        const win = t.result === 'WIN';
        const buy = t.direction === 'BUY';

        // SL dashed line (red)
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = C.slLine; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ex, slY); ctx.lineTo(xx, slY); ctx.stroke();
        // TP dashed line (green)
        ctx.strokeStyle = C.tpLine;
        ctx.beginPath(); ctx.moveTo(ex, tpY); ctx.lineTo(xx, tpY); ctx.stroke();
        ctx.setLineDash([]);

        // Connector between entry & exit
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(xx, xy);
        ctx.strokeStyle = win ? 'rgba(16,185,129,.5)' : 'rgba(239,68,68,.5)';
        ctx.lineWidth   = 1.5; ctx.stroke();

        // Entry marker (triangle)
        ctx.fillStyle = buy ? '#10b981' : '#ef4444';
        ctx.beginPath();
        if (buy) {
            ctx.moveTo(ex, ey - 6); ctx.lineTo(ex - 5, ey + 2); ctx.lineTo(ex + 5, ey + 2);
        } else {
            ctx.moveTo(ex, ey + 6); ctx.lineTo(ex - 5, ey - 2); ctx.lineTo(ex + 5, ey - 2);
        }
        ctx.closePath(); ctx.fill();

        // Exit marker (circle)
        ctx.beginPath(); ctx.arc(xx, xy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle   = win ? '#10b981' : '#ef4444';
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.fill(); ctx.stroke();

        // Labels visible when zoomed in
        if (bW > 4) {
            ctx.font      = '9px Inter'; ctx.textAlign = 'center';
            ctx.fillStyle = buy ? '#10b981' : '#ef4444';
            ctx.fillText(buy ? '▲ BUY' : '▼ SELL', ex, ey + (buy ? 14 : -8));
        }
    });
}

// ── draw crosshair ──
function btDrawCrosshair(ctx, W, H, x, y) {
    if (x < 0) return;
    const C = btColors();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = C.crosshair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, H - PAD.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
    ctx.setLineDash([]);
}

// ── MAIN price pane draw ──
function btRenderPrice() {
    const canvas = document.getElementById('btPriceCanvas');
    if (!canvas || !BTC.data.length) return;
    const ctx = canvas.getContext('2d');
    const C   = btColors();

    // Resize to DOM size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 800;
    canvas.height = rect.height || BTC.pricePH;
    const W = canvas.width, H = canvas.height;

    // Fill background
    ctx.fillStyle = C.bg || (document.getElementById('btSplitWrap')?.classList.contains('bt-chart-light') ? '#ffffff' : '#161b22');
    ctx.fillRect(0, 0, W, H);

    const end        = Math.min(BTC.viewStart + BTC.viewBars, BTC.data.length);
    const { min, max } = btPriceRange(BTC.viewStart, end);

    btDrawGrid(ctx, W, H, min, max, 6);
    btDrawTimeAxis(ctx, canvas);
    btDrawCandles(ctx, canvas, min, max);
    btDrawTradeOverlays(ctx, canvas, min, max);
    btDrawCrosshair(ctx, W, H, BTC.crossX, BTC.crossY);

    // Replay progress bar
    if (BTC.replayBar >= 0) {
        const pct = (BTC.replayBar - BTC.viewStart) / BTC.viewBars;
        ctx.fillStyle = C.replayBar;
        ctx.fillRect(PAD.l, H - PAD.b + 2, (W - PAD.l - PAD.r) * Math.max(0, Math.min(1, pct)), 2);
    }
}

// ── equity pane draw ──
function btRenderEquity() {
    const canvas = document.getElementById('btEquityCanvas');
    if (!canvas || !BTC.equity.length) return;
    const ctx  = canvas.getContext('2d');
    const C    = btColors();
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 800;
    canvas.height = rect.height || BTC.equityPH;
    const W = canvas.width, H = canvas.height;
    const EP = { t: 8, r: 60, b: 4, l: 10 };

    // Background
    ctx.fillStyle = C.bg || (document.getElementById('btSplitWrap')?.classList.contains('bt-chart-light') ? '#f8fafc' : '#161b22');
    ctx.fillRect(0, 0, W, H);

    const limit = BTC.replayBar >= 0 ? BTC.replayBar + 1 : BTC.data.length;
    const vals  = BTC.equity.filter((e, i) => i < limit).map(e => e.balance);
    if (vals.length < 2) return;

    const minV = Math.min(...vals) * 0.999;
    const maxV = Math.max(...vals) * 1.001;
    const rng  = maxV - minV || 1;
    const cW   = W - EP.l - EP.r;
    const cH   = H - EP.t - EP.b;
    const toX  = i => EP.l + (i / (vals.length - 1)) * cW;
    const toY  = v => EP.t + (1 - (v - minV) / rng) * cH;
    const isUp = vals[vals.length - 1] >= BTC.startBal;
    const col  = isUp ? C.equityUp : C.equityDown;

    // Fill
    const grad = ctx.createLinearGradient(0, EP.t, 0, H - EP.b);
    grad.addColorStop(0, isUp ? C.equityFillUp : C.equityFillDown);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.moveTo(toX(0), toY(vals[0]));
    vals.slice(1).forEach((v, i) => ctx.lineTo(toX(i+1), toY(v)));
    ctx.lineTo(toX(vals.length-1), H - EP.b);
    ctx.lineTo(toX(0), H - EP.b);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath(); ctx.moveTo(toX(0), toY(vals[0]));
    vals.slice(1).forEach((v, i) => ctx.lineTo(toX(i+1), toY(v)));
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();

    // Baseline
    const baseY = toY(BTC.startBal);
    if (baseY > EP.t && baseY < H - EP.b) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = C.baseline; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(EP.l, baseY); ctx.lineTo(W - EP.r, baseY); ctx.stroke();
        ctx.setLineDash([]);
    }

    // Current balance label
    const lastVal = vals[vals.length - 1];
    ctx.fillStyle  = col;
    ctx.font       = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('$' + lastVal.toFixed(0), W - EP.r + 4, toY(lastVal) + 3);
}

function btRenderBoth() {
    btRenderPrice();
    btRenderEquity();
}

// ── Splitter drag ──
function btInitSplitter() {
    const splitter  = document.getElementById('btSplitter');
    const pricePane = document.getElementById('btPricePane');
    const eqPane    = document.getElementById('btEquityPane');
    if (!splitter || !pricePane || !eqPane) return;

    let startY = 0, startPH = 0, startEH = 0;

    splitter.addEventListener('mousedown', e => {
        startY  = e.clientY;
        startPH = pricePane.getBoundingClientRect().height;
        startEH = eqPane.getBoundingClientRect().height;
        splitter.classList.add('dragging');
        e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
        if (!splitter.classList.contains('dragging')) return;
        const dy  = e.clientY - startY;
        const newP = Math.max(120, Math.min(600, startPH + dy));
        const newE = Math.max(60,  Math.min(300, startEH - dy));
        pricePane.style.height = newP + 'px';
        eqPane.style.height    = newE + 'px';
        BTC.pricePH = newP; BTC.equityPH = newE;
        btRenderBoth();
    });

    window.addEventListener('mouseup', () => {
        splitter.classList.remove('dragging');
    });

    // Touch support
    splitter.addEventListener('touchstart', e => {
        startY  = e.touches[0].clientY;
        startPH = pricePane.getBoundingClientRect().height;
        startEH = eqPane.getBoundingClientRect().height;
        splitter.classList.add('dragging');
    }, { passive: true });
    window.addEventListener('touchmove', e => {
        if (!splitter.classList.contains('dragging')) return;
        const dy  = e.touches[0].clientY - startY;
        const newP = Math.max(120, Math.min(600, startPH + dy));
        const newE = Math.max(60,  Math.min(300, startEH - dy));
        pricePane.style.height = newP + 'px';
        eqPane.style.height    = newE + 'px';
        BTC.pricePH = newP; BTC.equityPH = newE;
        btRenderBoth();
    }, { passive: true });
    window.addEventListener('touchend', () => splitter.classList.remove('dragging'));
}

// ── Mouse interactions on price canvas ──
function btInitMouseEvents() {
    const canvas = document.getElementById('btPriceCanvas');
    if (!canvas) return;

    // Crosshair + tooltip
    canvas.addEventListener('mousemove', e => {
        const rect  = canvas.getBoundingClientRect();
        const mx    = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my    = (e.clientY - rect.top)  * (canvas.height / rect.height);
        BTC.crossX  = mx;
        BTC.crossY  = my;

        // Find hovered bar
        const cW   = canvas.width - PAD.l - PAD.r;
        const bIdx = BTC.viewStart + Math.floor((mx - PAD.l) / (cW / BTC.viewBars));
        if (bIdx >= 0 && bIdx < BTC.data.length) {
            const d   = BTC.data[bIdx];
            const end = Math.min(BTC.viewStart + BTC.viewBars, BTC.data.length);
            const { min, max } = btPriceRange(BTC.viewStart, end);
            const price = max - ((my - PAD.t) / (canvas.height - PAD.t - PAD.b)) * (max - min);
            const dt = new Date(d.date).toLocaleDateString('en-US', { month:'short', day:'numeric' });
            const chg = (((d.close - d.open) / d.open) * 100).toFixed(2);
            const up  = d.close >= d.open;
            const el  = document.getElementById('btCrosshairInfo');
            if (el) el.innerHTML =
                `<span style="color:#8b949e">${dt}</span> &nbsp;` +
                `O:<b style="color:${up?'#10b981':'#ef4444'}">${d.open.toFixed(5)}</b> &nbsp;` +
                `H:<b style="color:#10b981">${d.high.toFixed(5)}</b> &nbsp;` +
                `L:<b style="color:#ef4444">${d.low.toFixed(5)}</b> &nbsp;` +
                `C:<b style="color:${up?'#10b981':'#ef4444'}">${d.close.toFixed(5)}</b> &nbsp;` +
                `<b style="color:${up?'#10b981':'#ef4444'}">${up?'+':''}${chg}%</b>`;
        }
        btRenderPrice();
    });

    canvas.addEventListener('mouseleave', () => {
        BTC.crossX = -1; BTC.crossY = -1;
        const el = document.getElementById('btCrosshairInfo');
        if (el) el.innerHTML = '';
        btRenderPrice();
    });

    // Pan by drag
    canvas.addEventListener('mousedown', e => {
        BTC.isDragging    = true;
        BTC.dragStartX    = e.clientX;
        BTC.dragStartView = BTC.viewStart;
        canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
        BTC.isDragging = false;
        if (canvas) canvas.style.cursor = 'crosshair';
    });
    window.addEventListener('mousemove', e => {
        if (!BTC.isDragging) return;
        const rect   = canvas.getBoundingClientRect();
        const cW     = rect.width - PAD.l - PAD.r;
        const pxPerBar = cW / BTC.viewBars;
        const delta  = Math.round((BTC.dragStartX - e.clientX) / pxPerBar);
        BTC.viewStart = Math.max(0, Math.min(BTC.data.length - BTC.viewBars, BTC.dragStartView + delta));
        btRenderBoth();
    });

    // Zoom with wheel
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        btZoom(e.deltaY > 0 ? 1.25 : 0.8);
    }, { passive: false });
}

// ── Zoom ──
function btZoom(factor) {
    const newBars = Math.round(BTC.viewBars * factor);
    BTC.viewBars  = Math.max(20, Math.min(BTC.data.length, newBars));
    // Keep center bar
    BTC.viewStart = Math.max(0, Math.min(BTC.data.length - BTC.viewBars, BTC.viewStart));
    btRenderBoth();
}

// ── Fit to screen ──
function btFitScreen() {
    BTC.viewStart = 0;
    BTC.viewBars  = BTC.data.length;
    btRenderBoth();
}

// ── Chart color palette (reads chart-local theme) ──
function btColors() {
    const isLight = document.getElementById('btSplitWrap')?.classList.contains('bt-chart-light');
    return {
        bg:          isLight ? '#ffffff'                    : 'transparent',
        grid:        isLight ? 'rgba(0,0,0,.07)'           : 'rgba(255,255,255,.04)',
        axisText:    isLight ? 'rgba(71,85,105,.85)'       : 'rgba(139,148,158,.65)',
        timeText:    isLight ? 'rgba(71,85,105,.7)'        : 'rgba(139,148,158,.6)',
        crosshair:   isLight ? 'rgba(0,0,0,.2)'            : 'rgba(255,255,255,.25)',
        priceLine:   isLight ? '#6366f1'                   : '#6366f1',
        baseline:    isLight ? 'rgba(0,0,0,.15)'           : 'rgba(255,255,255,.18)',
        slLine:      isLight ? 'rgba(220,38,38,.35)'       : 'rgba(239,68,68,.4)',
        tpLine:      isLight ? 'rgba(5,150,105,.35)'       : 'rgba(16,185,129,.4)',
        candleUp:    '#10b981',
        candleDown:  '#ef4444',
        equityUp:    '#10b981',
        equityDown:  '#ef4444',
        equityFillUp:   isLight ? 'rgba(16,185,129,.15)'  : 'rgba(16,185,129,.25)',
        equityFillDown: isLight ? 'rgba(239,68,68,.15)'   : 'rgba(239,68,68,.25)',
        replayBar:   '#6366f1',
    };
}

// ── Toggle chart-local theme ──
function btToggleChartTheme() {
    const wrap  = document.getElementById('btSplitWrap');
    const icon  = document.getElementById('btChartThemeIcon');
    const label = document.getElementById('btChartThemeLabel');
    const btn   = document.getElementById('btChartThemeBtn');
    if (!wrap) return;
    const isNowLight = wrap.classList.toggle('bt-chart-light');
    if (isNowLight) {
        icon.className  = 'fas fa-moon';
        label.textContent = 'Dark';
        btn.title = 'Switch to dark chart';
    } else {
        icon.className  = 'fas fa-sun';
        label.textContent = 'Light';
        btn.title = 'Switch to light chart';
    }
    btRenderBoth();
}

// ── Toggle candle/line mode ──
function btToggleCandleMode() {
    BTC.candleMode = !BTC.candleMode;
    const icon = document.getElementById('btCandleModeIcon');
    if (icon) icon.className = BTC.candleMode ? 'fas fa-chart-bar' : 'fas fa-chart-line';
    btRenderPrice();
}

// ── Replay ──
function btToggleReplay() {
    if (BTC.replayBar >= 0) { btStopReplay(); return; }
    BTC.replayBar = Math.min(50, BTC.data.length - 1); // start at bar 50
    BTC.viewStart = 0;
    BTC.viewBars  = Math.min(80, BTC.data.length);
    const btn = document.getElementById('btReplayBtn');
    const stepBtn = document.getElementById('btReplayStepBtn');
    const stopBtn = document.getElementById('btReplayStopBtn');
    if (btn)  { btn.classList.add('active'); btn.innerHTML = '<i class="fas fa-play-circle"></i> Replaying'; }
    if (stepBtn) stepBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    btRenderBoth();
}

function btReplayStep() {
    if (BTC.replayBar < 0) return;
    BTC.replayBar = Math.min(BTC.data.length - 1, BTC.replayBar + 1);
    // Auto-scroll view to follow replay
    const margin = Math.floor(BTC.viewBars * 0.2);
    if (BTC.replayBar >= BTC.viewStart + BTC.viewBars - margin) {
        BTC.viewStart = Math.max(0, BTC.replayBar - BTC.viewBars + margin + 1);
    }
    btRenderBoth();
}

function btStopReplay() {
    BTC.replayBar = -1;
    clearInterval(BTC.replayTimer);
    BTC.replayTimer = null;
    const btn = document.getElementById('btReplayBtn');
    const stepBtn = document.getElementById('btReplayStepBtn');
    const stopBtn = document.getElementById('btReplayStopBtn');
    if (btn)  { btn.classList.remove('active'); btn.innerHTML = '<i class="fas fa-play-circle"></i> Replay'; }
    if (stepBtn) stepBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    btRenderBoth();
}

// ── Initialize split chart after backtest runs ──
function btInitSplitChart(instrument, timeframe) {
    // Update toolbar label
    const lbl = document.getElementById('btChartLabel');
    if (lbl) lbl.textContent = instrument + ' · ' + timeframe;

    // Stop any existing replay
    btStopReplay();

    btInitSplitter();
    btInitMouseEvents();

    // Zoom to last 80 bars by default (most recent data)
    BTC.viewBars  = Math.min(80, BTC.data.length);
    BTC.viewStart = Math.max(0, BTC.data.length - BTC.viewBars);

    btRenderBoth();
}

// ── Window resize: re-render ──
window.addEventListener('resize', () => {
    clearTimeout(window._btResizeTimer);
    window._btResizeTimer = setTimeout(() => {
        if (document.getElementById('btResults')?.style.display !== 'none') {
            btRenderBoth();
        }
    }, 150);
});

// ── Legacy wrapper stubs (called from runBacktest) ──
function btDrawEquity(canvas, equity, startBalance) {
    // Handled by btRenderEquity() — this stub is intentionally empty
}
function btDrawPriceChart(canvas, data, trades) {
    // Handled by btRenderPrice() — this stub is intentionally empty
}

// ── btDrawMonthly  (kept — Monthly P&L bar chart) ──
function btDrawMonthly(canvas, monthly) {
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.clientWidth || 600;
    canvas.height = canvas.offsetHeight || 130;
    const W = canvas.width, H = canvas.height;
    const PAD = { t: 10, r: 10, b: 40, l: 60 };
    const cW  = W - PAD.l - PAD.r;
    const cH  = H - PAD.t - PAD.b;
    ctx.clearRect(0, 0, W, H);
    if (!monthly.length) return;
    const vals = monthly.map(m => m.pnl);
    const maxA = Math.max(...vals.map(Math.abs)) || 1;
    const zero = PAD.t + cH / 2;
    const bW   = Math.max(4, cW / monthly.length - 4);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.l, zero); ctx.lineTo(W - PAD.r, zero); ctx.stroke();

    monthly.forEach((m, i) => {
        const x   = PAD.l + i * (cW / monthly.length) + (cW / monthly.length - bW) / 2;
        const h   = (Math.abs(m.pnl) / maxA) * (cH / 2);
        const isUp = m.pnl >= 0;
        ctx.fillStyle = isUp ? 'rgba(16,185,129,.8)' : 'rgba(239,68,68,.8)';
        ctx.beginPath();
        if (isUp) { ctx.roundRect(x, zero - h, bW, h, [3,3,0,0]); }
        else       { ctx.roundRect(x, zero,     bW, h, [0,0,3,3]); }
        ctx.fill();
        // Label
        ctx.fillStyle = 'rgba(139,148,158,.8)'; ctx.font = '8px Inter'; ctx.textAlign = 'center';
        ctx.fillText(m.month.slice(5), x + bW / 2, H - PAD.b + 12);
    });

    // Y labels
    ctx.fillStyle = 'rgba(139,148,158,.7)'; ctx.font = '9px Inter'; ctx.textAlign = 'right';
    ctx.fillText('+$'+maxA.toFixed(0), PAD.l - 4, PAD.t + 10);
    ctx.fillText('-$'+maxA.toFixed(0), PAD.l - 4, H - PAD.b - 4);
}

// ── Render Stats Cards ──
function btRenderStats(stats, startBalance) {
    const cards = [
        { icon:'💰', val: '$'+stats.totalPnl.toFixed(2), lbl:'Net P&L', cls: stats.totalPnl >= 0 ? 'up' : 'down' },
        { icon:'📈', val: stats.winRate+'%',              lbl:'Win Rate',      cls: stats.winRate >= 50 ? 'up' : 'down' },
        { icon:'📊', val: stats.total,                    lbl:'Total Trades',  cls: '' },
        { icon:'🎯', val: stats.profitFactor,             lbl:'Profit Factor', cls: parseFloat(stats.profitFactor) >= 1 ? 'up' : 'down' },
        { icon:'📉', val: stats.maxDD+'%',                lbl:'Max Drawdown',  cls: stats.maxDD > 20 ? 'down' : 'up' },
        { icon:'⚡', val: stats.returnPct+'%',            lbl:'Total Return',  cls: stats.returnPct >= 0 ? 'up' : 'down' },
        { icon:'🏆', val: '$'+stats.finalBalance.toFixed(2), lbl:'Final Balance', cls: stats.finalBalance >= startBalance ? 'up' : 'down' },
        { icon:'📐', val: stats.sharpe,                   lbl:'Sharpe Ratio',  cls: parseFloat(stats.sharpe) >= 1 ? 'up' : '' },
        { icon:'🔥', val: stats.maxWinStreak+' in a row', lbl:'Best Streak',   cls: 'up' },
        { icon:'🧩', val: stats.wins+' / '+stats.losses,  lbl:'Wins / Losses', cls: '' }
    ];
    document.getElementById('btStatsRow').innerHTML = cards.map(c => `
        <div class="bt-stat-card">
            <div class="bt-stat-icon">${c.icon}</div>
            <div class="bt-stat-val ${c.cls}">${c.val}</div>
            <div class="bt-stat-lbl">${c.lbl}</div>
        </div>`).join('');
}

// ── Render Trade Table ──
function btRenderTable(trades) {
    const fmt = n => new Date(n).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    document.getElementById('btTradeTableBody').innerHTML = trades.slice(0, 200).map(t => `
        <tr>
            <td>${t.n}</td>
            <td>${fmt(t.entryDate)}</td>
            <td class="dir-${t.direction.toLowerCase()}">${t.direction}</td>
            <td>${t.entry.toFixed(5)}</td>
            <td>${t.exit.toFixed(5)}</td>
            <td>${t.sl.toFixed(5)}</td>
            <td>${t.tp.toFixed(5)}</td>
            <td class="${t.pips >= 0 ? 'win':'loss'}">${t.pips > 0 ? '+' : ''}${t.pips}</td>
            <td class="${t.pnl >= 0 ? 'win':'loss'}">${t.pnl >= 0 ? '+$' : '-$'}${Math.abs(t.pnl).toFixed(2)}</td>
            <td>$${t.balance.toFixed(2)}</td>
            <td class="${t.result === 'WIN' ? 'win':'loss'}">${t.result === 'WIN' ? '✅ WIN' : '❌ LOSS'}</td>
        </tr>`).join('') || '<tr><td colspan="11" style="text-align:center;color:#8b949e;padding:20px;">No trades generated with current settings.</td></tr>';
}

// ── Main Run Function ──
let _btLastTrades = [];

function runBacktest() {
    const btn = document.querySelector('.bt-run-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="bt-spinner"></div> Running...';

    setTimeout(() => {
        try {
            const instrument = document.getElementById('bt-instrument').value;
            const strategy   = document.getElementById('bt-strategy').value;
            const bars       = Math.min(1000, Math.max(100, +document.getElementById('bt-bars').value || 300));
            const balance    = Math.max(100, +document.getElementById('bt-balance').value || 10000);
            const riskPct    = Math.min(10, Math.max(0.1, +document.getElementById('bt-risk').value || 1));
            const slPips     = Math.max(1, +document.getElementById('bt-sl').value || 20);
            const tpPips     = Math.max(1, +document.getElementById('bt-tp').value || 40);

            const data     = btGenerateOHLC(instrument, bars);
            let   signals;

            if (strategy === 'ma_cross') {
                const fast = +document.getElementById('bt-fast-ma').value || 9;
                const slow = +document.getElementById('bt-slow-ma').value || 21;
                signals = btSignalMACross(data, fast, slow);
            } else if (strategy === 'rsi') {
                const period     = +document.getElementById('bt-rsi-period').value    || 14;
                const oversold   = +document.getElementById('bt-rsi-oversold').value  || 30;
                const overbought = +document.getElementById('bt-rsi-overbought').value|| 70;
                signals = btSignalRSI(data, period, oversold, overbought);
            } else if (strategy === 'breakout') {
                const lookback = +document.getElementById('bt-bk-period').value || 20;
                signals = btSignalBreakout(data, lookback);
            } else {
                const fast   = +document.getElementById('bt-macd-fast').value   || 12;
                const slow   = +document.getElementById('bt-macd-slow').value   || 26;
                const signal = +document.getElementById('bt-macd-signal').value || 9;
                signals = btSignalMACD(data, fast, slow, signal);
            }

            const { trades, equity } = btSimulate(data, signals, balance, riskPct, slPips, tpPips, instrument);
            _btLastTrades = trades;
            const stats = btCalcStats(trades, balance, equity);

            if (!stats) {
                alert('No trades were generated. Try adjusting your strategy parameters or increasing the number of bars.');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Run Backtest';
                return;
            }

            const resultsEl = document.getElementById('btResults');
            resultsEl.style.display = 'block';
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            btRenderStats(stats, balance);
            btRenderTable(trades);

            const monthly = btMonthlyPnL(trades);
            const timeframe = document.getElementById('bt-timeframe').value;

            // Populate split chart state
            BTC.data      = data;
            BTC.trades    = trades;
            BTC.equity    = equity;
            BTC.startBal  = balance;
            BTC.replayBar = -1;

            // Draw charts after layout is painted
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    btInitSplitChart(instrument, timeframe);
                    btDrawMonthly(document.getElementById('btMonthlyCanvas'), monthly);
                });
            });

        } catch (e) {
            console.error('Backtest error:', e);
            alert('An error occurred during backtesting. Please check your inputs and try again.');
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Run Backtest';
    }, 50); // defer to allow spinner to render
}

function btReset() {
    btStopReplay();
    BTC.data = []; BTC.trades = []; BTC.equity = [];
    document.getElementById('btResults').style.display = 'none';
    document.getElementById('btTradeTableBody').innerHTML = '';
    document.getElementById('btStatsRow').innerHTML = '';
    _btLastTrades = [];
}

function btExportCSV() {
    if (!_btLastTrades.length) return;
    const header = ['#','Entry Date','Direction','Entry','Exit','SL','TP','Pips','P&L ($)','Balance','Result'];
    const rows   = _btLastTrades.map(t => [
        t.n,
        new Date(t.entryDate).toLocaleDateString(),
        t.direction,
        t.entry.toFixed(5), t.exit.toFixed(5), t.sl.toFixed(5), t.tp.toFixed(5),
        t.pips, t.pnl.toFixed(2), t.balance.toFixed(2), t.result
    ]);
    const csv  = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'tagbridge_backtest.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

// (resize handled by btInitSplitChart resize listener above)


// ══════════════════════════════════════════════
//  DEMO TRADING ACCOUNT (localStorage, no DB)
// ══════════════════════════════════════════════

const DEMO_KEY   = 'tb-demo-v1';
const DEMO_START = 10000;

// ── State ──
function demoLoad() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || demoDefault(); }
    catch(e) { return demoDefault(); }
}
function demoDefault() {
    return { balance: DEMO_START, positions: [], history: [], totalPL: 0, tradeCount: 0 };
}
function demoSave(state) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(state)); } catch(e) {}
}

let demoDirection = 'BUY';

// ── Unified real-time price cache ──
const DEMO_PRICES = {};

// ── Best strategy: Binance for crypto + EUR + GBP + Gold (PAXG)
//                  Frankfurter.dev for JPY, CHF, CAD, AUD, NZD
async function demoFetchAllPrices() {
    // 1. Binance — crypto + forex pairs it supports + PAXG for Gold
    const binanceSyms = [
        'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT',
        'XRPUSDT','ADAUSDT','DOGEUSDT','LTCUSDT',
        'EURUSDT','GBPUSDT','PAXGUSDT'
    ];
    try {
        const url  = `https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(binanceSyms)}`;
        const r    = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (r.ok) {
            const data = await r.json();
            data.forEach(d => {
                const price = parseFloat(d.price);
                const sym   = d.symbol;
                if (sym === 'EURUSDT')  DEMO_PRICES['EURUSD']  = price;
                else if (sym === 'GBPUSDT')  DEMO_PRICES['GBPUSD']  = price;
                else if (sym === 'PAXGUSDT') DEMO_PRICES['XAUUSD']  = price; // PAX Gold ≈ XAU/USD
                else DEMO_PRICES[sym] = price; // crypto as-is
            });
        }
    } catch(e) {}

    // 2. Frankfurter.dev — USD/JPY, USD/CHF, USD/CAD, AUD/USD, NZD/USD
    try {
        const url = 'https://api.frankfurter.dev/v1/latest?from=USD&to=JPY,CHF,CAD,AUD,NZD';
        const r   = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (r.ok) {
            const d = await r.json();
            const rates = d.rates || {};
            if (rates.JPY) DEMO_PRICES['USDJPY'] = +rates.JPY.toFixed(3);
            if (rates.CHF) DEMO_PRICES['USDCHF'] = +rates.CHF.toFixed(5);
            if (rates.CAD) DEMO_PRICES['USDCAD'] = +rates.CAD.toFixed(5);
            if (rates.AUD) DEMO_PRICES['AUDUSD'] = +(1 / rates.AUD).toFixed(5);
            if (rates.NZD) DEMO_PRICES['NZDUSD'] = +(1 / rates.NZD).toFixed(5);
        }
    } catch(e) {}

    // 3. Silver — fawazahmed0 CDN (only one not on Binance)
    try {
        const url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xag.json';
        const r   = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (r.ok) {
            const d = await r.json();
            if (d.xag?.usd) DEMO_PRICES['XAGUSD'] = +d.xag.usd.toFixed(3);
        }
    } catch(e) {}
}

async function demoFetchCryptoPrices() { await demoFetchAllPrices(); }
async function demoFetchForexPrices()  {}

function demoGetPrice(sym) {
    return DEMO_PRICES[sym] || null;
}

function demoSetDir(dir) {
    demoDirection = dir;
    document.getElementById('demoDirBuy') .classList.toggle('active', dir === 'BUY');
    document.getElementById('demoDirSell').classList.toggle('active', dir === 'SELL');
}

// ── Pair definitions — ONLY pairs with confirmed real-time prices ──
const DEMO_PAIR_OPTS = {
    forex: [
        { v:'XAUUSD',  pip:'0.01',   pv:'1',   label:'XAU/USD — Gold'   },
        { v:'EURUSD',  pip:'0.0001', pv:'10',  label:'EUR/USD'           },
        { v:'GBPUSD',  pip:'0.0001', pv:'10',  label:'GBP/USD'           },
        { v:'USDJPY',  pip:'0.01',   pv:'6.7', label:'USD/JPY'           },
        { v:'AUDUSD',  pip:'0.0001', pv:'10',  label:'AUD/USD'           },
        { v:'USDCHF',  pip:'0.0001', pv:'10',  label:'USD/CHF'           },
        { v:'USDCAD',  pip:'0.0001', pv:'10',  label:'USD/CAD'           },
        { v:'NZDUSD',  pip:'0.0001', pv:'10',  label:'NZD/USD'           },
    ],
    crypto: [
        { v:'BTCUSDT',  pip:'1',      pv:'1',  label:'BTC/USDT'          },
        { v:'ETHUSDT',  pip:'0.1',    pv:'1',  label:'ETH/USDT'          },
        { v:'SOLUSDT',  pip:'0.01',   pv:'1',  label:'SOL/USDT'          },
        { v:'BNBUSDT',  pip:'0.1',    pv:'1',  label:'BNB/USDT'          },
        { v:'XRPUSDT',  pip:'0.0001', pv:'1',  label:'XRP/USDT'          },
        { v:'ADAUSDT',  pip:'0.0001', pv:'1',  label:'ADA/USDT'          },
        { v:'DOGEUSDT', pip:'0.00001',pv:'1',  label:'DOGE/USDT'         },
        { v:'LTCUSDT',  pip:'0.01',   pv:'1',  label:'LTC/USDT'          },
    ]
};
function demoCatSwitch(btn) {
    document.querySelectorAll('.dma-mkt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat  = btn.dataset.cat;
    const sel  = document.getElementById('demoPair');
    const icon = document.getElementById('demoPairIcon');
    if (!sel) return;
    sel.innerHTML = DEMO_PAIR_OPTS[cat].map(p =>
        `<option value="${p.v}" data-pip="${p.pip}" data-pv="${p.pv}" data-type="${cat}">${p.label}</option>`
    ).join('');
    if (icon) icon.className = cat === 'crypto'
        ? 'fab fa-bitcoin dma-pair-icon'
        : 'fas fa-dollar-sign dma-pair-icon';
    if (document.getElementById('demoEntry'))  document.getElementById('demoEntry').value = '';
    if (document.getElementById('demoSL'))     document.getElementById('demoSL').value    = '';
    if (document.getElementById('demoTP'))     document.getElementById('demoTP').value    = '';
    demoUpdateFormPrice();
}

// ── Editable balance ──
function demoEditBalance() {
    const state = demoLoad();
    const form  = document.getElementById('demoBalEditForm');
    const input = document.getElementById('demoBalInput');
    if (!form || !input) return;
    input.value = state.balance.toFixed(2);
    form.style.display = 'flex';
    input.focus(); input.select();
}
function demoSaveBalance() {
    const input = document.getElementById('demoBalInput');
    const val   = parseFloat(input?.value);
    if (!val || val < 100) { demoShowToast('Minimum balance is $100'); return; }
    const state     = demoLoad();
    const oldBal    = state.balance;
    state.balance   = +val.toFixed(2);
    state.totalPL   = +(state.totalPL + (val - oldBal)).toFixed(2);
    demoSave(state);
    document.getElementById('demoBalEditForm').style.display = 'none';
    demoRenderAll();
    demoShowToast(`Balance updated to $${val.toFixed(2)} ✅`);
}
function demoCancelEditBalance() {
    const form = document.getElementById('demoBalEditForm');
    if (form) form.style.display = 'none';
}

// ── Show live price in form ──
function demoUpdateFormPrice() {
    const sym     = document.getElementById('demoPair')?.value;
    const priceEl = document.getElementById('demoLivePrice');
    const entryEl = document.getElementById('demoEntry');
    if (!sym || !priceEl) return;
    const p = demoGetPrice(sym);
    if (p) {
        const decimals = p > 500 ? 2 : p > 10 ? 3 : 5;
        priceEl.textContent = p.toFixed(decimals);
        priceEl.classList.remove('loading');
        priceEl.classList.add('live');
        if (entryEl && !entryEl.value) entryEl.placeholder = p.toFixed(decimals);
    } else {
        priceEl.textContent = '…';
        priceEl.classList.add('loading');
        priceEl.classList.remove('live');
    }
}

// ── Place trade ──
function demoPlaceTrade() {
    const state  = demoLoad();
    const sym    = document.getElementById('demoPair').value;
    const dir    = demoDirection;
    const lot    = parseFloat(document.getElementById('demoLot').value) || 0.1;
    const slVal  = parseFloat(document.getElementById('demoSL').value)  || null;
    const tpVal  = parseFloat(document.getElementById('demoTP').value)  || null;
    const price  = demoGetPrice(sym);

    if (!price) { alert('Price not available yet — wait a moment and try again.'); return; }

    const entryInput = parseFloat(document.getElementById('demoEntry').value);
    const entry = entryInput || price;

    const pos = {
        id:        Date.now().toString(),
        sym, dir, lot, entry,
        sl:        slVal,
        tp:        tpVal,
        openTime:  new Date().toISOString(),
        openPrice: price
    };

    state.positions.push(pos);
    state.tradeCount++;
    demoSave(state);
    demoRenderAll();

    // Clear form
    document.getElementById('demoEntry').value = '';
    document.getElementById('demoSL').value    = '';
    document.getElementById('demoTP').value    = '';

    demoShowToast(`${dir} ${sym} @ ${entry.toFixed(entry > 100 ? 2 : 5)} opened ✅`);
}

// ── Close a position ──
function demoClosePosition(id) {
    const state = demoLoad();
    const idx   = state.positions.findIndex(p => p.id === id);
    if (idx < 0) return;
    const pos   = state.positions[idx];
    const exitPrice = demoGetPrice(pos.sym) || pos.entry;
    const pnl   = demoCalcPnL(pos, exitPrice);

    // Remove from open
    state.positions.splice(idx, 1);

    // Add to history
    const closed = {
        ...pos, exit: exitPrice,
        pnl: +pnl.toFixed(2),
        closeTime: new Date().toISOString(),
        result: pnl >= 0 ? 'WIN' : 'LOSS'
    };
    state.history.unshift(closed);
    state.balance  = +(state.balance + pnl).toFixed(2);
    state.totalPL  = +(state.totalPL  + pnl).toFixed(2);
    demoSave(state);

    // Auto-log to Journal
    demoLogToJournal(closed);

    demoRenderAll();
    demoShowToast(`${pos.dir} ${pos.sym} closed: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} ${pnl >= 0 ? '✅' : '❌'}`);
}

// ── P&L calculation ──
function demoCalcPnL(pos, currentPrice) {
    const opt    = document.querySelector(`#demoPair option[value="${pos.sym}"]`);
    const pipSz  = parseFloat(opt?.dataset.pip)  || 0.0001;
    const pipVal = parseFloat(opt?.dataset.pv)   || 10;
    const type   = opt?.dataset.type || 'forex';

    let pnl;
    if (type === 'crypto') {
        const diff = pos.dir === 'BUY' ? currentPrice - pos.entry : pos.entry - currentPrice;
        pnl = diff * pos.lot;
    } else {
        const diff  = pos.dir === 'BUY' ? currentPrice - pos.entry : pos.entry - currentPrice;
        const pips  = diff / pipSz;
        pnl = pips * pipVal * pos.lot;
    }
    return pnl;
}

// ── Auto-close on SL/TP hit ──
function demoCheckSLTP() {
    const state = demoLoad();
    let changed = false;
    state.positions.forEach(pos => {
        const price = demoGetPrice(pos.sym);
        if (!price) return;
        let hit = false;
        if (pos.sl && pos.dir === 'BUY'  && price <= pos.sl) hit = true;
        if (pos.sl && pos.dir === 'SELL' && price >= pos.sl) hit = true;
        if (pos.tp && pos.dir === 'BUY'  && price >= pos.tp) hit = true;
        if (pos.tp && pos.dir === 'SELL' && price <= pos.tp) hit = true;
        if (hit) { demoClosePosition(pos.id); changed = true; }
    });
}

// ── Log closed trade to Journal ──
function demoLogToJournal(closed) {
    const trades = jLoad();
    const d      = new Date(closed.openTime);
    trades.push({
        id:         'demo-' + closed.id,
        date:       d.toISOString().split('T')[0],
        instrument: closed.sym.includes('USDT') ? 'Crypto' : 'Forex',
        pair:       closed.sym,
        dir:        closed.dir,
        entry:      closed.entry,
        exit:       closed.exit,
        sl:         closed.sl || 0,
        tp:         closed.tp || 0,
        size:       closed.lot,
        pl:         closed.pnl,
        rr:         '1:2',
        strategy:   'Demo Account',
        screenshot: '',
        notes:      `Auto-logged from Demo Account. Closed at ${new Date(closed.closeTime).toLocaleTimeString()}`
    });
    jSave(trades);
    renderJournal();
}

// ── Price formatter ──
function fmtDemoPrice(p) {
    if (!p && p !== 0) return '--';
    if (p > 500)  return p.toFixed(2);
    if (p > 10)   return p.toFixed(3);
    return p.toFixed(5);
}

// ── Render everything ──
function demoRenderAll() {
    const state = demoLoad();

    // Balance + stats
    const balEl   = document.getElementById('demoBalance');
    const openEl  = document.getElementById('demoOpenPL');
    const totalEl = document.getElementById('demoTotalPL');
    const cntEl   = document.getElementById('demoTradeCount');

    if (balEl)   balEl.textContent   = '$' + state.balance.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
    if (totalEl) {
        totalEl.textContent = (state.totalPL >= 0 ? '+$' : '-$') + Math.abs(state.totalPL).toFixed(2);
        totalEl.className   = 'dma-card-val ' + (state.totalPL >= 0 ? 'up' : 'down');
    }
    if (cntEl) cntEl.textContent = state.tradeCount;

    // Open positions
    const posTable  = document.getElementById('demoPosTable');
    const openCount = document.getElementById('demoOpenCount');
    if (openCount) openCount.textContent = state.positions.length;

    if (!state.positions.length) {
        if (posTable) posTable.innerHTML = `
            <div class="dma-empty">
                <i class="fas fa-chart-candlestick"></i>
                <p>No open trades</p>
                <small>Place your first trade →</small>
            </div>`;
        if (openEl) { openEl.textContent = '$0.00'; openEl.className = 'dma-card-val'; }
    } else {
        let totalOpen = 0;
        const rows = state.positions.map(pos => {
            const price = demoGetPrice(pos.sym) || pos.entry;
            const pnl   = demoCalcPnL(pos, price);
            totalOpen  += pnl;
            const up    = pnl >= 0;
            const since = new Date(pos.openTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
            return `<div class="dma-pos-card">
                <div class="dma-pos-top">
                    <span class="dma-pos-sym">${pos.sym}</span>
                    <span class="dma-pos-dir ${pos.dir === 'BUY' ? 'buy' : 'sell'}">
                        <i class="fas fa-arrow-trend-${pos.dir === 'BUY' ? 'up' : 'down'}"></i> ${pos.dir}
                    </span>
                    <span class="dma-pos-pnl ${up ? 'up' : 'down'}">${up ? '+' : ''}$${pnl.toFixed(2)}</span>
                </div>
                <div class="dma-pos-meta">
                    <span>${pos.lot} lots @ ${fmtDemoPrice(pos.entry)}</span>
                    <span class="dma-pos-now">Now: ${fmtDemoPrice(price)}</span>
                    ${pos.sl ? `<span class="dma-pos-sl">SL ${fmtDemoPrice(pos.sl)}</span>` : ''}
                    ${pos.tp ? `<span class="dma-pos-tp">TP ${fmtDemoPrice(pos.tp)}</span>` : ''}
                    <span class="dma-pos-time">${since}</span>
                </div>
                <button class="dma-close-btn" onclick="demoClosePosition('${pos.id}')">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>`;
        }).join('');
        if (posTable) posTable.innerHTML = rows;

        if (openEl) {
            openEl.textContent = (totalOpen >= 0 ? '+$' : '-$') + Math.abs(totalOpen).toFixed(2);
            openEl.className   = 'dma-card-val ' + (totalOpen >= 0 ? 'up' : 'down');
        }
    }

    // History
    const histWrap = document.getElementById('demoHistoryWrap');
    const histBody = document.getElementById('demoHistoryBody');
    if (state.history.length && histWrap) {
        histWrap.style.display = '';
        if (histBody) histBody.innerHTML = state.history.slice(0, 50).map((t, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><b>${t.sym}</b></td>
                <td class="${t.dir === 'BUY' ? 'dir-buy' : 'dir-sell'}">${t.dir}</td>
                <td>${fmtDemoPrice(t.entry)}</td>
                <td>${fmtDemoPrice(t.exit)}</td>
                <td>${t.lot}</td>
                <td class="${t.pnl >= 0 ? 'win' : 'loss'}">${t.pnl >= 0 ? '+$' : '-$'}${Math.abs(t.pnl).toFixed(2)}</td>
                <td class="${t.result === 'WIN' ? 'win' : 'loss'}">${t.result === 'WIN' ? '✅' : '❌'}</td>
                <td>${new Date(t.openTime).toLocaleDateString()}</td>
            </tr>`).join('');
    }
}
    const state = demoLoad();

    // Balance bar
    const totalPLEl = document.getElementById('demoTotalPL');
    const balEl     = document.getElementById('demoBalance');
    const countEl   = document.getElementById('demoTradeCount');
    if (balEl)     balEl.textContent     = '$' + state.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (totalPLEl) {
        totalPLEl.textContent = (state.totalPL >= 0 ? '+$' : '-$') + Math.abs(state.totalPL).toFixed(2);
        totalPLEl.className   = 'demo-bal-val ' + (state.totalPL >= 0 ? 'up' : 'down');
    }
    if (countEl) countEl.textContent = state.tradeCount;

    // Open positions
    const posTable  = document.getElementById('demoPosTable');
    const openCount = document.getElementById('demoOpenCount');
    if (openCount) openCount.textContent = state.positions.length;

    if (!state.positions.length) {
        if (posTable) posTable.innerHTML = '<div class="demo-empty"><i class="fas fa-chart-line"></i><br>No open trades — place your first trade!</div>';
        const openPLEl = document.getElementById('demoOpenPL');
        if (openPLEl) { openPLEl.textContent = '$0.00'; openPLEl.className = 'demo-bal-val'; }
    } else {
        let totalOpen = 0;
        const rows = state.positions.map(pos => {
            const price = demoGetPrice(pos.sym) || pos.entry;
            const pnl   = demoCalcPnL(pos, price);
            totalOpen  += pnl;
            const up    = pnl >= 0;
            return `<div class="demo-pos-row">
                <div class="demo-pos-info">
                    <span class="demo-pos-pair">${pos.sym}</span>
                    <span class="demo-pos-dir ${pos.dir.toLowerCase()}">${pos.dir === 'BUY' ? '▲' : '▼'} ${pos.dir}</span>
                    <span class="demo-pos-detail">${pos.lot} lots @ ${fmtDemoPrice(pos.entry)}</span>
                    ${pos.sl ? `<span class="demo-pos-sl">SL ${fmtDemoPrice(pos.sl)}</span>` : ''}
                    ${pos.tp ? `<span class="demo-pos-tp">TP ${fmtDemoPrice(pos.tp)}</span>` : ''}
                </div>
                <div class="demo-pos-right">
                    <span class="demo-pos-pnl ${up ? 'up' : 'down'}">${up ? '+' : ''}$${pnl.toFixed(2)}</span>
                    <span class="demo-pos-price">@ ${fmtDemoPrice(price)}</span>
                    <button class="demo-close-btn" onclick="demoClosePosition('${pos.id}')">✕ Close</button>
                </div>
            </div>`;
        }).join('');
        if (posTable) posTable.innerHTML = rows;

        const openPLEl = document.getElementById('demoOpenPL');
        if (openPLEl) {
            openPLEl.textContent = (totalOpen >= 0 ? '+$' : '-$') + Math.abs(totalOpen).toFixed(2);
            openPLEl.className   = 'demo-bal-val ' + (totalOpen >= 0 ? 'up' : 'down');
        }
    }

    // History
    const histWrap = document.getElementById('demoHistoryWrap');
    const histBody = document.getElementById('demoHistoryBody');
    if (state.history.length && histWrap) {
        histWrap.style.display = '';
        if (histBody) histBody.innerHTML = state.history.slice(0, 50).map((t, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><b>${t.sym}</b></td>
                <td class="${t.dir === 'BUY' ? 'dir-buy' : 'dir-sell'}">${t.dir}</td>
                <td>${fmtDemoPrice(t.entry)}</td>
                <td>${fmtDemoPrice(t.exit)}</td>
                <td>${t.lot}</td>
                <td class="${t.pnl >= 0 ? 'win' : 'loss'}">${t.pnl >= 0 ? '+$' : '-$'}${Math.abs(t.pnl).toFixed(2)}</td>
                <td class="${t.result === 'WIN' ? 'win' : 'loss'}">${t.result === 'WIN' ? '✅' : '❌'}</td>
                <td>${new Date(t.openTime).toLocaleDateString()}</td>
            </tr>`).join('');
    }
}

// ── Reset demo account ──
function demoReset() {
    if (!confirm('Reset demo account to $10,000? All open trades and history will be cleared.')) return;
    demoSave(demoDefault());
    demoRenderAll();
    demoShowToast('Demo account reset to $10,000 ✅');
}

// ── Toast notification ──
function demoShowToast(msg) {
    let toast = document.getElementById('demoToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'demoToast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Init demo account ──
function initDemo() {
    // Populate Forex pairs by default
    const forexBtn = document.querySelector('.dma-mkt-btn[data-cat="forex"]');
    if (forexBtn) demoCatSwitch(forexBtn);

    demoRenderAll();

    // Fetch all prices immediately
    demoFetchAllPrices().then(() => {
        demoUpdateFormPrice();
        demoRenderAll();
    });

    // Refresh every 15s
    setInterval(async () => {
        await demoFetchAllPrices();
        demoCheckSLTP();
        demoRenderAll();
    }, 15000);

    // Update form live price every 3s
    setInterval(demoUpdateFormPrice, 3000);

    // Pair change → refresh price immediately
    const pairSel = document.getElementById('demoPair');
    if (pairSel) pairSel.addEventListener('change', () => {
        const e = document.getElementById('demoEntry');
        if (e) e.value = '';
        demoUpdateFormPrice();
    });
}
// v2.1

