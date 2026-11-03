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

function loadTVChart(symbol) {
    const container = document.getElementById('tvChartContainer');
    if (!container) return;
    container.innerHTML = '';
    const isDark = currentTheme === 'dark';
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
        timezone: 'Africa/Nairobi', theme: isDark ? 'dark' : 'light',
        style: '1', locale: 'en',
        toolbar_bg: isDark ? '#1c2333' : '#f1f5f9',
        enable_publishing: false, withdateranges: true, range: '3M',
        hide_side_toolbar: false, allow_symbol_change: true, save_image: false,
        studies: ['STD;RSI','STD;MACD'], show_popup_button: true,
        popup_width: '1000', popup_height: '650'
    });
    wrap.appendChild(s);
    container.appendChild(wrap);
}

function loadTVMarketOverview() {
    const container = document.getElementById('tvMarketOverview');
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
    el.classList.toggle('fullscreen');
    const i = document.querySelector('.chart-fs-btn i');
    if (i) i.className = el.classList.contains('fullscreen') ? 'fas fa-compress' : 'fas fa-expand';
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

    // Charts: load default EUR/USD
    loadTVChart('EURUSD');
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

    // Journal
    renderJournal();

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
