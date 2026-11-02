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

function toggleChartFullscreen() {
    const el = document.getElementById('chartContainer');
    if (!el) return;
    el.classList.toggle('fullscreen');
    const i = document.querySelector('.chart-fs-btn i');
    if (i) i.className = el.classList.contains('fullscreen') ? 'fas fa-compress' : 'fas fa-expand';
}

// ══════════════════════════════════════════════
//  6. TRADING ACADEMY
// ══════════════════════════════════════════════

const ACADEMY = {
    forex:[
        {n:'01',t:'ፎሬክስ ምንድን ነው?',d:'Foreign Exchange Market — $7.5T daily volume, world\'s largest financial market. 5 days/week, 24 hours. Major participants: banks, institutions, hedge funds, retail traders.',tags:['Beginner','Forex']},
        {n:'02',t:'Currency Pairs',d:'Major pairs (EUR/USD, GBP/USD, USD/JPY). Minor & Exotic pairs. Base vs Quote currency. Bid/Ask/Spread explained.',tags:['Beginner','Pairs']},
        {n:'03',t:'Pips & Lots',d:'1 pip = 0.0001 for most pairs. Standard = 100,000 units. Mini = 10,000. Micro = 1,000. Leverage amplifies both profit and loss.',tags:['Beginner','Pips','Lots']},
        {n:'04',t:'Market Structure — HH, HL, LH, LL',d:'Higher Highs (HH) + Higher Lows (HL) = Uptrend. Lower Highs + Lower Lows = Downtrend. BOS (Break of Structure) signals continuation. CHOCH signals reversal.',tags:['Intermediate','SMC','Structure']},
        {n:'05',t:'Support & Resistance',d:'Key price levels where price reacts. Historical S/R areas are powerful. Role reversal: broken support becomes resistance. Confluence = multiple factors aligning.',tags:['Beginner','S&R']},
        {n:'06',t:'Candlestick Patterns',d:'Doji, Engulfing, Hammer, Shooting Star, Marubozu, Pinbar. Each candle = Open, High, Low, Close. Pattern + context + level = entry signal.',tags:['Intermediate','Candles']},
        {n:'07',t:'Fibonacci Retracement',d:'0.236, 0.382, 0.5, 0.618, 0.786. Golden pocket = 0.618–0.65. Draw from major swing high to low. Use with OBs and FVGs for confluence.',tags:['Intermediate','Fibonacci']},
        {n:'08',t:'Trading Sessions',d:'Tokyo (23:00-08:00 UTC): Low volatility. London (07:00-16:00): Most active. New York (12:00-21:00): High volume. NY+London overlap = best setups.',tags:['Beginner','Sessions']},
        {n:'09',t:'Risk Management — Essential',d:'Never risk > 1-2% per trade. Position sizing formula: Risk$ / (Entry-SL in pips × pip value). Risk:Reward ≥ 1:2. Protect capital above all.',tags:['Essential','Risk']},
        {n:'10',t:'Trading Plan — Structure',d:'Define: entry criteria, SL placement, TP targets, position size, max daily loss, session preference. Trade the plan, not emotions.',tags:['Essential','Plan']}
    ],
    crypto:[
        {n:'01',t:'Blockchain Basics',d:'Decentralized distributed ledger. Blocks linked cryptographically. Immutable. Bitcoin was first (2009). Consensus mechanisms: PoW vs PoS.',tags:['Beginner','Blockchain']},
        {n:'02',t:'Bitcoin vs Altcoins',d:'Bitcoin = store of value, digital gold. Ethereum = programmable blockchain, smart contracts. Altcoins vary in use case. Market cap = price × circulating supply.',tags:['Beginner','BTC','ETH']},
        {n:'03',t:'DeFi — Decentralized Finance',d:'Uniswap, Aave, Compound. No intermediaries. Liquidity pools, yield farming, staking. Smart contracts automate everything. High risk/reward.',tags:['Advanced','DeFi']},
        {n:'04',t:'Crypto Market Cycles',d:'Bull → Distribution → Bear → Accumulation. 4-year Bitcoin halving cycle historically drives bull markets. Understanding cycles helps timing.',tags:['Intermediate','Cycles']},
        {n:'05',t:'Exchange & Wallet Guide',d:'CEX (Binance, Coinbase) vs DEX (Uniswap). Hot wallet = convenience, cold wallet = security. Hardware wallets best for large amounts. Never share seed phrase.',tags:['Beginner','Security']},
        {n:'06',t:'NFTs & Web3',d:'Non-fungible tokens = unique digital ownership. ERC-721. Use cases: art, gaming, real estate, identity. Gas fees on Ethereum can be high.',tags:['Intermediate','NFT','Web3']}
    ],
    ta:[
        {n:'01',t:'RSI — Relative Strength Index',d:'Momentum oscillator 0-100. Overbought >70, Oversold <30. RSI divergence = powerful reversal signal. Default period: 14.',tags:['Indicator','RSI']},
        {n:'02',t:'MACD',d:'MACD line crosses signal = buy/sell. Histogram = momentum. Zero line crossover confirms trend. Use on higher timeframes for reliability.',tags:['Indicator','MACD']},
        {n:'03',t:'Moving Averages',d:'SMA = equal weight. EMA = recency-weighted. Golden cross (50>200 MA) = bull. Death cross = bear. 200 MA = key institutional level.',tags:['Indicator','MA','EMA']},
        {n:'04',t:'Bollinger Bands',d:'20 SMA ± 2 SD. Upper band touch = potentially overbought. Lower band = oversold. BB squeeze before breakout. Walk the bands in trending markets.',tags:['Indicator','Volatility']},
        {n:'05',t:'Volume Analysis',d:'Volume confirms price moves. High-volume breakout = strong. Volume divergence (price up, volume down) = weakness. OBV, VWAP indicators.',tags:['Intermediate','Volume']},
        {n:'06',t:'Chart Patterns',d:'Head & Shoulders, Double Top/Bottom, Triangle, Wedge, Flag, Pennant. Each has a measured move. Pattern + volume + level = high probability.',tags:['Intermediate','Patterns']}
    ],
    smc:[
        {n:'01',t:'Smart Money Concepts Intro',d:'SMC = trading with institutional footprints. Banks and institutions move markets. Retail is on the opposite side. Learn to align with smart money.',tags:['SMC','ICT']},
        {n:'02',t:'Order Blocks',d:'Bullish OB = last bearish candle before bullish displacement. Bearish OB = last bullish candle before bearish move. Institutional entry zones. Expect reactions.',tags:['SMC','OB']},
        {n:'03',t:'Liquidity',d:'Buy-side: above swing highs (stop losses of shorts). Sell-side: below swing lows. Banks hunt liquidity BEFORE reversing. This creates stop hunts.',tags:['SMC','Liquidity']},
        {n:'04',t:'Fair Value Gaps (FVG)',d:'3-candle pattern with a gap (imbalance). Price returns to fill FVGs. Bullish FVG = bottom of candle 1 to top of candle 3. Used as entry zones.',tags:['SMC','FVG']},
        {n:'05',t:'BOS & CHOCH',d:'Break of Structure (BOS) = trend continuation. Change of Character (CHOCH) = reversal signal. Wait for displacement + retest for entry.',tags:['SMC','BOS','CHOCH']},
        {n:'06',t:'Displacement & Mitigation',d:'Displacement = fast, strong move leaving imbalance. Smart money returns to mitigate (fill) its OB. Mitigation entry = wait for price to return to origin zone.',tags:['Advanced','SMC']}
    ],
    risk:[
        {n:'01',t:'The 1% Rule',d:'Risk ≤ 1-2% of account per trade. $1000 account → $10-$20 max risk. 10 consecutive losses = only 10-20% drawdown. This rule prevents account ruin.',tags:['Essential','Rule']},
        {n:'02',t:'Position Sizing Formula',d:'Lots = Account Risk $ ÷ (SL in pips × pip value). Example: $1000, 1% = $10 risk. SL=20 pips, pip value=$10 → 0.05 lots. Always calculate before entry.',tags:['Essential','Formula']},
        {n:'03',t:'Risk:Reward Ratio',d:'Minimum 1:2 RR. At 50% WR with 1:2 RR = profit. Higher RR = need lower WR. Never take trades below 1:1. Log every RR to find your edge.',tags:['Essential','R:R']},
        {n:'04',t:'Drawdown Management',d:'Max drawdown limit = 10-15%. If hit → stop, review. Never revenge trade. Drawdown is normal. Protect capital to fight another day.',tags:['Advanced','Drawdown']},
        {n:'05',t:'Correlation Risk',d:'EUR/USD and GBP/USD highly correlated = double risk. Diversify across uncorrelated pairs. Check correlation before trading multiple pairs simultaneously.',tags:['Intermediate','Correlation']}
    ],
    psychology:[
        {n:'01',t:'Trading Psychology',d:'90% of trading success = mindset. Fear and greed destroy accounts. Stick to your plan. Keep a journal for self-awareness and continuous improvement.',tags:['Psychology','Mindset']},
        {n:'02',t:'FOMO',d:'Fear of Missing Out leads to late entries = poor RR. Miss one? Another comes. The market is always there. Missing trades > taking bad setups.',tags:['Psychology','FOMO']},
        {n:'03',t:'Revenge Trading',d:'Never try to "win back" a loss immediately. Step away, breathe, review objectively. Revenge = emotional decision = another loss. Break the cycle.',tags:['Psychology','Discipline']},
        {n:'04',t:'The Trading Plan',d:'Setup criteria + entry rules + SL placement + TP targets + position size + max daily loss. Write it down. Review it before every trading session.',tags:['Essential','Plan']},
        {n:'05',t:'The Trading Journal',d:'Record every trade: entry, SL, TP, reason, result, emotion. Review weekly. Find patterns in mistakes. A journal turns losses into lessons.',tags:['Essential','Journal']}
    ]
};

function switchAcademy(btn, cat) {
    document.querySelectorAll('.academy-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderAcademy(cat);
}

function renderAcademy(cat) {
    const lessons = ACADEMY[cat] || [];
    const el = document.getElementById('academyContent');
    if (!el) return;
    el.innerHTML = '<div class="academy-grid">' + lessons.map(l =>
        `<div class="lesson-card">
            <div class="lesson-num">Lesson ${l.n}</div>
            <div class="lesson-title">${l.t}</div>
            <div class="lesson-desc">${l.d}</div>
            <div class="lesson-tags">${l.tags.map(t=>`<span class="lesson-tag">${t}</span>`).join('')}</div>
        </div>`
    ).join('') + '</div>';
}

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
            {id:'ps-type', label:'Instrument',           type:'select', opts:['Forex (xxx/USD)','Crypto (USD quote)','Gold (XAU/USD)']}
        ],
        fn(v) {
            const bal=+v['ps-bal'], rp=+v['ps-risk']/100, en=+v['ps-entry'], sl=+v['ps-sl'];
            if(!bal||!rp||!en||!sl) return null;
            const riskUSD = bal*rp, slDist = Math.abs(en-sl);
            let lots;
            if(v['ps-type']?.includes('Crypto')) lots = riskUSD/(slDist*en);
            else if(v['ps-type']?.includes('Gold')) lots = riskUSD/(slDist*100);
            else { const pips=slDist*10000; lots=riskUSD/(pips*10); }
            return [
                {v:lots.toFixed(3)+' lots', l:'Lot Size'},
                {v:'$'+riskUSD.toFixed(2), l:'Risk Amount'},
                {v:(slDist*10000).toFixed(1), l:'SL in Pips'},
                {v:(rp*100)+'%', l:'Risk %'}
            ];
        }
    },
    riskpct:{
        title:'Risk % Calculator',
        desc:'Find what percentage of your account you are risking.',
        fields:[
            {id:'rp-bal', label:'Account Balance ($)', type:'number', ph:'10000'},
            {id:'rp-amt', label:'Risk Amount ($)',      type:'number', ph:'100'}
        ],
        fn(v) {
            const bal=+v['rp-bal'], amt=+v['rp-amt'];
            if(!bal||!amt) return null;
            const pct=(amt/bal)*100;
            const status = pct<=1?'✅ Conservative':pct<=2?'⚠️ Moderate':'❌ High Risk!';
            return [
                {v:pct.toFixed(2)+'%', l:'Risk %'},
                {v:status, l:'Status'},
                {v:'$'+(bal*0.01).toFixed(2), l:'1% = '},
                {v:'$'+(bal*0.02).toFixed(2), l:'2% = '}
            ];
        }
    },
    pip:{
        title:'Pip Value Calculator',
        desc:'Monetary value of 1 pip based on lot size.',
        fields:[
            {id:'pv-type', label:'Pair Type', type:'select', opts:['Forex (xxx/USD)','Forex (xxx/JPY)','Gold (XAU/USD)']},
            {id:'pv-lot',  label:'Lot Size',  type:'number', ph:'0.1', step:'0.01'},
            {id:'pv-px',   label:'Current Price (JPY/Gold)', type:'number', ph:'150.00', step:'any'}
        ],
        fn(v) {
            const lot=+v['pv-lot']||0.1, px=+v['pv-px']||150;
            let pip;
            if(v['pv-type']?.includes('JPY')) pip=(0.01/px)*100000*lot;
            else if(v['pv-type']?.includes('Gold')) pip=0.1*100*lot;
            else pip=0.0001*100000*lot;
            return [
                {v:'$'+pip.toFixed(4), l:'1 Pip'},
                {v:'$'+(pip*10).toFixed(4), l:'10 Pips'},
                {v:'$'+(pip*50).toFixed(4), l:'50 Pips'},
                {v:'$'+(pip*100).toFixed(4), l:'100 Pips'}
            ];
        }
    },
    lotsize:{
        title:'Lot Size Calculator',
        desc:'Ideal lot size from risk amount and stop loss in pips.',
        fields:[
            {id:'ls-bal',  label:'Account Balance ($)', type:'number', ph:'5000'},
            {id:'ls-risk', label:'Risk Amount ($)',      type:'number', ph:'50'},
            {id:'ls-pips', label:'Stop Loss (Pips)',     type:'number', ph:'20'}
        ],
        fn(v) {
            const bal=+v['ls-bal'], risk=+v['ls-risk'], pips=+v['ls-pips'];
            if(!bal||!risk||!pips) return null;
            const lots=risk/(pips*10), pct=(risk/bal)*100;
            return [
                {v:lots.toFixed(3), l:'Lot Size'},
                {v:pct.toFixed(2)+'%', l:'Risk %'},
                {v:'$'+risk.toFixed(2), l:'Risk $'},
                {v:pips+'p', l:'SL Pips'}
            ];
        }
    },
    rr:{
        title:'Risk:Reward Calculator',
        desc:'Calculate R:R ratio and break-even win rate.',
        fields:[
            {id:'rr-en', label:'Entry Price',   type:'number', ph:'1.0850', step:'any'},
            {id:'rr-sl', label:'Stop Loss',     type:'number', ph:'1.0800', step:'any'},
            {id:'rr-tp', label:'Take Profit',   type:'number', ph:'1.0950', step:'any'}
        ],
        fn(v) {
            const en=+v['rr-en'], sl=+v['rr-sl'], tp=+v['rr-tp'];
            if(!en||!sl||!tp) return null;
            const risk=Math.abs(en-sl), reward=Math.abs(tp-en);
            const rr=reward/risk, be=(1/(1+rr))*100;
            const status=rr>=2?'✅ Excellent':rr>=1.5?'✅ Good':rr>=1?'⚠️ Acceptable':'❌ Poor';
            return [
                {v:'1 : '+rr.toFixed(2), l:'R:R Ratio'},
                {v:be.toFixed(1)+'%', l:'Break-Even WR'},
                {v:status, l:'Assessment'},
                {v:(rr*100).toFixed(0)+'%', l:'Reward/Risk'}
            ];
        }
    },
    pl:{
        title:'P&L Calculator',
        desc:'Calculate profit or loss for a Forex trade.',
        fields:[
            {id:'pl-en',  label:'Entry Price', type:'number', ph:'1.0850', step:'any'},
            {id:'pl-ex',  label:'Exit Price',  type:'number', ph:'1.0950', step:'any'},
            {id:'pl-lot', label:'Lot Size',    type:'number', ph:'0.1', step:'0.01'},
            {id:'pl-dir', label:'Direction',   type:'select', opts:['BUY','SELL']}
        ],
        fn(v) {
            const en=+v['pl-en'], ex=+v['pl-ex'], lot=+v['pl-lot'], dir=v['pl-dir'];
            if(!en||!ex||!lot) return null;
            const rawPips=(ex-en)*10000;
            const pips=dir==='BUY'?rawPips:-rawPips;
            const profit=pips*10*lot;
            return [
                {v:'$'+profit.toFixed(2), l:'P&L'},
                {v:pips.toFixed(1)+' pips', l:'Pips'},
                {v:profit>=0?'✅ Profit':'❌ Loss', l:'Result'},
                {v:lot+' lots', l:'Size'}
            ];
        }
    },
    compound:{
        title:'Compound Growth Calculator',
        desc:'How your account grows with consistent monthly returns.',
        fields:[
            {id:'cg-bal',    label:'Starting Balance ($)',  type:'number', ph:'1000'},
            {id:'cg-monthly',label:'Monthly Return (%)',    type:'number', ph:'5', step:'0.1'},
            {id:'cg-months', label:'Number of Months',      type:'number', ph:'24'}
        ],
        fn(v) {
            const start=+v['cg-bal'], m=+v['cg-monthly']/100, months=+v['cg-months'];
            if(!start||!m||!months) return null;
            const final=start*Math.pow(1+m,months), gain=final-start;
            return [
                {v:'$'+final.toLocaleString('en-US',{maximumFractionDigits:0}), l:'Final Balance'},
                {v:'$'+gain.toLocaleString('en-US',{maximumFractionDigits:0}), l:'Total Profit'},
                {v:(final/start).toFixed(2)+'x', l:'Growth Multiple'},
                {v:months+' mo', l:'Time Period'}
            ];
        }
    },
    fibonacci:{
        title:'Fibonacci Calculator',
        desc:'Retracement levels from swing high and low.',
        fields:[
            {id:'fib-hi',  label:'Swing High', type:'number', ph:'1.1000', step:'any'},
            {id:'fib-lo',  label:'Swing Low',  type:'number', ph:'1.0500', step:'any'},
            {id:'fib-dir', label:'Direction',  type:'select', opts:['Uptrend (Retracement down)','Downtrend (Retracement up)']}
        ],
        fn(v) {
            const hi=+v['fib-hi'], lo=+v['fib-lo'];
            if(!hi||!lo||hi<=lo) return null;
            const d=hi-lo, up=v['fib-dir']?.includes('Uptrend');
            return [0.236,0.382,0.5,0.618,0.65,0.786].map(l => ({
                v:(up ? hi-d*l : lo+d*l).toFixed(5), l:(l*100)+'% level'
            }));
        }
    },
    sl:{
        title:'Stop Loss Calculator',
        desc:'SL price and TP targets from pips and direction.',
        fields:[
            {id:'sl-en',   label:'Entry Price',     type:'number', ph:'1.0850', step:'any'},
            {id:'sl-pips', label:'SL in Pips',      type:'number', ph:'20'},
            {id:'sl-dir',  label:'Direction',       type:'select', opts:['BUY','SELL']}
        ],
        fn(v) {
            const en=+v['sl-en'], pips=+v['sl-pips'], dir=v['sl-dir'], p=0.0001;
            if(!en||!pips) return null;
            const sl  = dir==='BUY' ? en-pips*p : en+pips*p;
            const tp2 = dir==='BUY' ? en+pips*2*p : en-pips*2*p;
            const tp3 = dir==='BUY' ? en+pips*3*p : en-pips*3*p;
            return [
                {v:sl.toFixed(5), l:'Stop Loss'},
                {v:tp2.toFixed(5), l:'TP at 1:2'},
                {v:tp3.toFixed(5), l:'TP at 1:3'},
                {v:pips+'p', l:'SL Distance'}
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
//  8. TRADING JOURNAL (localStorage)
// ══════════════════════════════════════════════

const JKEY = 'tb-journal-v2';

function jLoad() { try { return JSON.parse(localStorage.getItem(JKEY))||[]; } catch(e){ return []; } }
function jSave(t) { localStorage.setItem(JKEY, JSON.stringify(t)); }

function openTradeModal(editId) {
    const ov = document.getElementById('tradeModalOverlay'); if(!ov) return;
    document.getElementById('tradeForm').reset();
    const di = document.getElementById('tf-date');
    if(di) di.value = new Date().toISOString().split('T')[0];
    document.getElementById('tf-editid').value = '';
    document.getElementById('modalTitle').textContent = 'Add Trade';
    if(editId) {
        const t = jLoad().find(x=>x.id===editId); if(!t) return;
        ['date','pair','dir','entry','sl','tp','size','pl','strategy','notes'].forEach(k => {
            const el = document.getElementById('tf-'+k);
            if(el) el.value = t[k]??'';
        });
        document.getElementById('tf-editid').value = editId;
        document.getElementById('modalTitle').textContent = 'Edit Trade';
    }
    ov.classList.add('open');
}

function closeTradeModal(e) {
    if(e && e.target !== e.currentTarget) return;
    const ov = document.getElementById('tradeModalOverlay');
    if(ov) ov.classList.remove('open');
}

function saveTrade(e) {
    e.preventDefault();
    const editId = document.getElementById('tf-editid').value;
    const trades = jLoad();
    const en=parseFloat(document.getElementById('tf-entry').value);
    const sl=parseFloat(document.getElementById('tf-sl').value);
    const tp=parseFloat(document.getElementById('tf-tp').value);
    const plRaw = document.getElementById('tf-pl').value;
    const pl = plRaw!=='' ? parseFloat(plRaw) : null;
    const risk = Math.abs(en-sl), reward = Math.abs(tp-en);
    const rr = risk>0 ? (reward/risk).toFixed(2) : null;
    const trade = {
        id: editId || Date.now().toString(),
        date: document.getElementById('tf-date').value,
        pair: document.getElementById('tf-pair').value.toUpperCase(),
        dir:  document.getElementById('tf-dir').value,
        entry: en, sl, tp, size: parseFloat(document.getElementById('tf-size').value)||0,
        pl, rr, strategy: document.getElementById('tf-strategy').value,
        notes: document.getElementById('tf-notes').value
    };
    if(editId) {
        const idx = trades.findIndex(x=>x.id===editId);
        if(idx>-1) trades[idx]=trade; else trades.push(trade);
    } else { trades.push(trade); }
    jSave(trades);
    closeTradeModal();
    renderJournal();
}

function deleteTrade(id) {
    if(!confirm('Delete this trade?')) return;
    jSave(jLoad().filter(t=>t.id!==id));
    renderJournal();
}

function exportJournal() {
    const trades = jLoad();
    if(!trades.length) return alert('No trades to export.');
    const header = ['Date','Pair','Dir','Entry','SL','TP','Size','P&L','R:R','Strategy','Notes'];
    const rows = trades.map(t=>[t.date,t.pair,t.dir,t.entry,t.sl,t.tp,t.size,t.pl??'',t.rr??'',t.strategy,t.notes?.replace(/,/g,' ')].join(','));
    const csv = [header.join(','),...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download = 'tagbridge-journal.csv'; a.click();
}

function clearJournal() {
    if(!confirm('Clear ALL trades? This cannot be undone.')) return;
    jSave([]); renderJournal();
}

function renderJournal() {
    const trades = jLoad();
    const tbody = document.getElementById('tradeTableBody'); if(!tbody) return;
    if(!trades.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="11"><i class="fas fa-journal-whills"></i><br>No trades logged yet — start adding!</td></tr>`;
        updateJournalStats([]); return;
    }
    tbody.innerHTML = trades.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t => {
        const plCls = t.pl!=null ? (t.pl>=0?'win':'loss') : '';
        const plStr = t.pl!=null ? (t.pl>=0?'+':'')+t.pl.toFixed(2) : '--';
        return `<tr>
            <td>${t.date||'--'}</td>
            <td><strong>${t.pair||'--'}</strong></td>
            <td><span class="trade-dir ${(t.dir||'').toLowerCase()}">${t.dir||'--'}</span></td>
            <td>${t.entry||'--'}</td>
            <td>${t.sl||'--'}</td>
            <td>${t.tp||'--'}</td>
            <td>${t.size||'--'}</td>
            <td class="trade-pl ${plCls}">$${plStr}</td>
            <td>${t.rr||'--'}</td>
            <td title="${t.notes||''}">${(t.strategy||t.notes||'').substring(0,20)||'--'}</td>
            <td>
                <button class="trade-action-btn" onclick="openTradeModal('${t.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="trade-action-btn del" onclick="deleteTrade('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
    updateJournalStats(trades);
}

function updateJournalStats(trades) {
    const wins  = trades.filter(t=>t.pl!=null&&t.pl>0).length;
    const total = trades.filter(t=>t.pl!=null).length;
    const wr    = total>0 ? ((wins/total)*100).toFixed(1)+'%' : '0%';
    const totalPL = trades.reduce((s,t)=>s+(t.pl||0),0);
    const avgRR   = trades.filter(t=>t.rr).reduce((s,t)=>s+parseFloat(t.rr||0),0) / (trades.filter(t=>t.rr).length||1);
    const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    set('js-winrate', wr);
    set('js-totalpl', (totalPL>=0?'+':'')+'$'+Math.abs(totalPL).toFixed(2));
    set('js-totaltrades', trades.length);
    set('js-avgrr', avgRR.toFixed(2));
    const plEl = document.getElementById('js-totalpl');
    if(plEl) plEl.style.color = totalPL>=0?'var(--brand-green)':'var(--brand-red)';
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
        ? 'ሰላም! 👋 እኔ ታግ ብሪጅ AI ቦት ነኝ። ስለ ፎሬክስ፣ ክሪፕቶ፣ ትሬዲንግ ወይም ስሌቶች ጥያቄ ሊጠይቁኝ ይችላሉ!'
        : 'Hello! 👋 I\'m the Tag Bridge AI Bot. Ask me anything about Forex, Crypto, trading strategies, or calculations!');
    setQuickOpts([
        '📊 What is Forex trading?',
        '₿ How does crypto work?',
        '📐 Explain risk management',
        '🧠 What is SMC / ICT?',
        '📖 How to use the calculators?'
    ]);
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
6. Mention Tag Bridge books when relevant.
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
//  10. BOOK ORDER (preserved from original)
// ══════════════════════════════════════════════

document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-buy');
    if(!btn) return;
    const book = btn.dataset.book;
    const msgs = {
        forex:  'https://t.me/tagbridge_book_bot?start=forex_book',
        crypto: 'https://t.me/tagbridge_book_bot?start=crypto_book',
        bundle: 'https://t.me/tagbridge_book_bot?start=bundle_order'
    };
    if(msgs[book]) window.open(msgs[book], '_blank', 'noopener,noreferrer');
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

    // Charts: load default BTC
    loadTVChart('BTCUSDT');
    loadTVMarketOverview();

    // Academy: load default category
    renderAcademy('forex');

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

    console.log('🚀 Tag Bridge Trading Ecosystem v2.0 loaded');
});
