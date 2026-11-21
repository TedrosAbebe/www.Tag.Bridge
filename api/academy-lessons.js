/**
 * TAG BRIDGE — Academy Protected Lessons API
 * POST /api/academy-lessons
 * Body: { token: string }
 *
 * Returns two course categories:
 *   - FOREX: Foundation, Technical, Fundamental, SMC, Risk, Psychology
 *   - CRYPTO: Blockchain, Crypto Fundamentals, DeFi, Trading, NFT, Risk, Psychology
 */

import { createHmac } from 'crypto';

function b64url(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function verifyJWT(token, secret) {
    try {
        const [hdr, body, sig] = token.split('.');
        if (!hdr || !body || !sig) return null;
        const expected = b64url(createHmac('sha256', secret).update(`${hdr}.${body}`).digest());
        if (expected.length !== sig.length) return null;
        let diff = 0;
        for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
        if (diff !== 0) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
        return payload;
    } catch { return null; }
}

// ════════════════════════════════════════════════════════════════
//  FOREX MARKET COURSE
// ════════════════════════════════════════════════════════════════
const FOREX_CHAPTERS = [
    {
        id:'fx1', icon:'📐', color:'#6366f1', course:'forex',
        cat:'Forex — Chapter 1: Foundation',
        title:'Forex Market Fundamentals',
        desc:'ፎሬክስ ምንድነው? ገበያው እንዴት ይሰራል? ከዚህ ትምህርት ፎሬክስ ትሬዲንግን ሙሉ መሠረቱን ይማራሉ።',
        lessons: 6, duration: '2h 30m',
        concepts:['Forex is the world\'s largest market — $7.5T daily volume','Currency pairs: Base/Quote — EUR/USD = 1 EUR buys X USD','Major pairs: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD','Spread = Ask - Bid — broker commission in pips','Leverage amplifies both profit AND loss','Margin = collateral held by broker for open positions'],
        lessons_data:[
            {n:'01',t:'Forex ምንድነው?',
             body:`<p>Foreign Exchange (Forex) ገበያ — ዓለም ላይ ትልቁ ፋይናንሻል ማርኬት ነው። በቀን $7.5 trillion ይሸጣል፣ ይገዛል።</p>
             <p style="margin-top:10px">ከStocks ወይም Crypto ለየት ይላል፦</p>
             <ul style="list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:6px">
             <li>→ 24 ሰዓት፣ 5 ቀን ይሠራል (Sunday–Friday)</li>
             <li>→ 4 ዋና sessions አሉት: Sydney, Tokyo, London, New York</li>
             <li>→ ማንም single entity ሊቆጣጠረው አይችልም</li>
             <li>→ ዋጋ supply & demand ብቻ ይወስናል</li>
             </ul>`,
             formula:'Daily Volume: $7.5 Trillion\nParticipants: Banks → Institutions → Hedge Funds → Retail (us)',
             tags:['Beginner','Essential']},
            {n:'02',t:'Currency Pairs',
             body:`<p>ፎሬክስ ሁሌ ሁለት ምንዛሬ ጋር ነው የሚሠራው። <strong>Base currency</strong> ምን እንደምንሸጥ/እንደምንገዛ፣ <strong>Quote currency</strong> ደግሞ ዋጋው ምንዛሬ ነው።</p>
             <p style="margin-top:10px"><strong>EUR/USD = 1.0850</strong> ማለት: 1 Euro ለ 1.0850 US Dollar ይሸጣል።</p>
             <p style="margin-top:10px"><strong>Major pairs</strong> (ዝቅተኛ spread፣ ከፍተኛ liquidity):</p>
             <ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px">
             <li>→ EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD</li>
             </ul>`,
             formula:'EUR/USD: Base=EUR | Quote=USD\nBid: 1.0848 | Ask: 1.0851 | Spread: 3 pips',
             tags:['Beginner','Pairs']},
            {n:'03',t:'Pips, Lots & Leverage',
             body:`<p><strong>Pip</strong> — ዋጋ የሚንቀሳቀስበት ትንሹ unit። አብዛኛዎቹ pairs: 1 pip = 0.0001። JPY pairs: 1 pip = 0.01።</p>
             <p style="margin-top:10px"><strong>Lot sizes:</strong></p>
             <ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px">
             <li>→ Standard lot = 100,000 units (~$10/pip)</li>
             <li>→ Mini lot = 10,000 units (~$1/pip)</li>
             <li>→ Micro lot = 1,000 units (~$0.10/pip)</li>
             </ul>
             <p style="margin-top:10px"><strong>Leverage</strong> = ትንሽ ገንዘብ ትልቅ position ለመክፈት። 1:100 = $100 → $10,000 position ይቆጣጠራሉ።</p>`,
             formula:'Pip value (Forex USD quote) = 0.0001 × lot × 100,000\n0.1 lot → $1 per pip',
             tags:['Beginner','Math'],tip:'ሲጀምሩ micro lots ብቻ ይጠቀሙ። Capital ይጠብቁ።'},
            {n:'04',t:'Trading Sessions & Best Times',
             body:`<p>ፎሬክስ 24/5 ቢሠራም ሁሉም ሰዓቶች እኩል አይደሉም። Sessions overlap ሲሆን volatility ከፍ ይላል።</p>
             <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:.82rem">
             <tr style="background:rgba(99,102,241,.1)"><th style="padding:8px;text-align:left">Session</th><th style="padding:8px">UTC</th><th style="padding:8px">EAT</th><th style="padding:8px">Best Pairs</th></tr>
             <tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">Tokyo</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">00–09</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">03–12</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">JPY pairs</td></tr>
             <tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">London</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">07–16</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">10–19</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">EUR/GBP/CHF</td></tr>
             <tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">New York</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">12–21</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">15–00</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">All majors</td></tr>
             </table>`,
             tags:['Beginner','Timing'],warn:'London–NY overlap (15:00–19:00 EAT) = ትልቁ volatility። ምርጥ setups ይወጡ።'},
            {n:'05',t:'Order Types',
             body:`<p>ሁለቱ ዋና order types:</p>
             <ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:8px">
             <li><strong>Market Order</strong> — አሁኑኑ በ current price ይፈጸማል</li>
             <li><strong>Limit Order</strong> — የወሰኑትን price ሲደርስ ይፈጸማል</li>
             <li><strong>Stop Loss (SL)</strong> — ኪሳራ ሲደርስ trade ያዘጋዋል — MUST have always</li>
             <li><strong>Take Profit (TP)</strong> — target ሲደርስ ትርፍ ይዘጋዋል</li>
             </ul>`,
             formula:'Trade = Entry + SL (below support) + TP (at next resistance)\nAlways set SL BEFORE entering.',
             tags:['Beginner','Orders']},
            {n:'06',t:'Broker ምርጫ',
             body:`<p>Broker ፎሬክስ ገበያ ለመድረስ gateway ነው። ጥንቃቄ ያስፈልጋል።</p>
             <ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:6px">
             <li>→ <strong>Regulation</strong>: FCA (UK), ASIC (Australia), CySEC ያለው ይምረጡ</li>
             <li>→ <strong>Spreads</strong>: ዝቅተኛ ስፕሬድ ያለው ይሻላል</li>
             <li>→ <strong>Platform</strong>: MT4 ወይም MT5 (standard)</li>
             <li>→ <strong>Min deposit</strong>: $100–$200 ሲጀምሩ</li>
             </ul>`,
             tags:['Beginner','Broker'],warn:'Demo account ቢያንስ 3 ወር ሳይሠሩ ሊቭ አይክፈቱ።'}
        ]
    },
    {
        id:'fx2', icon:'📊', color:'#8b5cf6', course:'forex',
        cat:'Forex — Chapter 2: Technical Analysis',
        title:'ቴክኒካል ትንተና',
        desc:'Candlesticks, Support & Resistance, Trend, Chart Patterns, Indicators — ፕሮፌሽናሎች የሚጠቀሙበት ሙሉ ቴክኒካል ትንተና።',
        lessons: 7, duration: '3h 00m',
        concepts:['Candlesticks show Open, High, Low, Close — each tells a story','Support = price floor (buyers defend), Resistance = price ceiling','Trend = HH+HL (up) or LH+LL (down)','Chart patterns repeat because human psychology repeats','Volume confirms or denies price moves','Multiple timeframe analysis = higher-quality entries'],
        lessons_data:[
            {n:'01',t:'Candlestick ትርጓሜ',body:`<p>እያንዳንዱ candlestick 4 ነገር ያሳያል: <strong>Open, High, Low, Close</strong>።</p><p style="margin-top:10px"><strong>Bullish (green)</strong>: Close > Open — ገዢዎች አሸነፉ<br><strong>Bearish (red)</strong>: Close < Open — ሻጮች አሸነፉ</p><p style="margin-top:10px">ዋና patterns: Doji (ሚዛን), Hammer (bullish reversal), Shooting Star (bearish reversal), Engulfing (strong reversal)</p>`,formula:'Long wick = price was rejected at that level\nLong body = strong momentum',tags:['Technical','Patterns']},
            {n:'02',t:'Support & Resistance',body:`<p><strong>Support</strong> = ዋጋ ሲወርድ ሚቆምበት level — ገዢዎች ይከላከሉታል።<br><strong>Resistance</strong> = ዋጋ ሲወጣ ሚቆምበት level — ሻጮች ይከላከሉታል።</p><p style="margin-top:10px"><strong>Role Reversal</strong>: Support ሲሰበር Resistance ይሆናል (vice versa)። ትልቁ principle ይህ ነው።</p>`,formula:'Strong S/R:\n→ 2+ touches\n→ Clean rejection wicks\n→ Round numbers (1.1000, 1.5000)',tags:['Essential','S&R'],tip:'Weekly/Daily chart ላይ ሲጀምሩ ይሳሉ — ቀጥሎ lower TF entry።'},
            {n:'03',t:'Trend Analysis',body:`<p><strong>Uptrend</strong>: Higher Highs (HH) + Higher Lows (HL)<br><strong>Downtrend</strong>: Lower Highs (LH) + Lower Lows (LL)</p><p style="margin-top:10px"><strong>200 Moving Average</strong> — ትልቁ institutional trend indicator። ዋጋ ከበላይ = bullish bias።</p>`,formula:'Uptrend: HH → HL → HH → HL\nDowntrend: LH → LL → LH → LL',tags:['Essential','Trend']},
            {n:'04',t:'Chart Patterns',body:`<p>Patterns ይደጋገማሉ — ምክንያቱም human emotions (fear & greed) ይደጋገማሉ።</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:6px"><li><strong>Head & Shoulders</strong> — bearish reversal</li><li><strong>Double Top/Bottom</strong> — strong reversal</li><li><strong>Bull/Bear Flag</strong> — continuation after impulse</li><li><strong>Ascending/Descending Triangle</strong> — breakout pattern</li></ul>`,tags:['Intermediate','Patterns'],warn:'Patterns + key S/R level ሲደራረቡ ብቻ ያምናሉ።'},
            {n:'05',t:'RSI & MACD',body:`<p><strong>RSI</strong> — 0–100 momentum indicator<br>→ Above 70 = Overbought (sell signals)<br>→ Below 30 = Oversold (buy signals)<br>→ <strong>RSI Divergence</strong> = ትልቁ signal</p><p style="margin-top:12px"><strong>MACD</strong> — trend momentum<br>→ MACD crosses above signal = bullish<br>→ MACD crosses below signal = bearish</p>`,tags:['Intermediate','Indicators']},
            {n:'06',t:'Moving Averages',body:`<p><strong>EMA 200</strong> — ትልቁ institutional MA። ሁሉም ይጠቀሙበታል።<br><strong>EMA 50</strong> — medium-term momentum<br><strong>EMA 20/21</strong> — short-term dynamic S/R</p><p style="margin-top:10px"><strong>Golden Cross</strong>: 50 EMA crosses above 200 = strong buy<br><strong>Death Cross</strong>: 50 EMA crosses below 200 = strong sell</p>`,formula:'Golden Cross setup:\n1. Price above 200 EMA\n2. 50 EMA crosses above 200\n3. Pullback to 50 EMA\n4. Enter on confirmation candle',tags:['Intermediate','MA']},
            {n:'07',t:'Fibonacci Retracement',body:`<p>Key levels: <strong>23.6%, 38.2%, 50%, 61.8%, 78.6%</strong></p><p style="margin-top:10px"><strong>Golden Pocket</strong> = 0.618–0.65 zone — highest probability entry zone።</p>`,formula:'How to draw:\n1. Identify swing high & low\n2. Draw from low to high (uptrend)\n3. Wait for pullback to 0.618\n4. Confirm with OB or FVG\n5. Enter with SL below swing low',tags:['Intermediate','Fibonacci'],tip:'Golden Pocket + Order Block = highest probability setup።'}
        ]
    },
    {
        id:'fx3', icon:'📰', color:'#ef4444', course:'forex',
        cat:'Forex — Chapter 3: Fundamental Analysis',
        title:'ፋንዳሜንታል ትንተና',
        desc:'ዋጋ ለምን ይንቀሳቀሳል? Economic news, interest rates, central banks — ፕሮፌሽናሎች macro ምን እንደሚጠቀሙ ይማሩ።',
        lessons: 4, duration: '1h 30m',
        concepts:['High-impact news creates 50–300+ pip moves','NFP (Non-Farm Payrolls) moves USD pairs most','Interest rate decisions = #1 driver of currency values','CPI/Inflation data directly impacts central bank policy','Trade the REACTION to news, not the prediction','Fundamental divergence between countries = long-term trends'],
        lessons_data:[
            {n:'01',t:'Economic Calendar',body:`<p>Economic calendar scheduled events ና impact ያሳያል። ሁሉም serious trader ዕለት ዕለት ይፈትሸዋል።</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:5px"><li>🔴 <strong>High impact</strong>: NFP, FOMC, CPI, GDP — 50–300+ pips ያንቀሳቅሱ</li><li>🟡 <strong>Medium impact</strong>: PMI, Retail Sales — 20–80 pips</li><li>⚪ <strong>Low impact</strong>: minor data — usual ignore</li></ul><p style="margin-top:10px">Free calendar: <strong>investing.com/economic-calendar</strong></p>`,tags:['Fundamental','News']},
            {n:'02',t:'Key Economic Indicators',body:`<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:.8rem"><tr style="background:rgba(239,68,68,.1)"><th style="padding:7px;text-align:left">Indicator</th><th style="padding:7px">Currency</th><th style="padding:7px">Impact</th></tr><tr><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">NFP</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">USD</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">🔴 Extreme</td></tr><tr><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">FOMC Rate</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">USD</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">🔴 Extreme</td></tr><tr><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">CPI</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">All</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">🔴 High</td></tr><tr><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">GDP</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">All</td><td style="padding:7px;border-top:1px solid rgba(255,255,255,.06)">🔴 High</td></tr></table>`,tags:['Fundamental','Calendar'],warn:'High-impact news ሲሆን open trade ቢኖርህ SL አጣብቅ ወይም close አድርግ።'},
            {n:'03',t:'Interest Rates & Currency Strength',body:`<p>Interest rate decisions = ምንዛሬ ዋጋ ትልቁ driver። Rate ሲጨምር → currency strengthens።</p><p style="margin-top:10px"><strong>ዋና central banks:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ <strong>Fed</strong> (FOMC) — USD</li><li>→ <strong>ECB</strong> — EUR</li><li>→ <strong>BOE</strong> — GBP</li><li>→ <strong>BOJ</strong> — JPY</li></ul>`,tags:['Fundamental','Macro']},
            {n:'04',t:'Trading Around News',body:`<p><strong>አቀራረብ 1 — Avoid it</strong>: High-impact news 30 min በፊት positions ዝጋ። ቀጥሎ ተመለስ።</p><p style="margin-top:10px"><strong>አቀራረብ 2 — Trade the reaction</strong>: News candle ሲዘጋ ቅጥ። Direction ሳትተነብይ confirmed move ትሬድ አድርግ።</p>`,formula:'Safe news approach:\n1. Check calendar every morning\n2. Mark red events on chart\n3. No new positions 30 min before red news\n4. Re-enter 15–30 min after spike settles',tags:['News','Strategy']}
        ]
    },
    {
        id:'fx4', icon:'🧠', color:'#06b6d4', course:'forex',
        cat:'Forex — Chapter 4: Smart Money Concepts (SMC)',
        title:'Smart Money Concepts — SMC',
        desc:'ባንኮችና ትላልቅ institutions ገበያ እንዴት እንደሚንቀሳቀሱ ይማሩ። Order Blocks, FVG, Liquidity, BOS, CHOCH — ሙሉ SMC framework።',
        lessons: 6, duration: '3h 30m',
        concepts:['Institutions move markets — retail traders react to them','Smart Money hunts liquidity before making the real move','Order Blocks are institutional footprints','Fair Value Gaps (FVGs) are inefficiencies that get filled','BOS = trend continuation; CHOCH = trend reversal','Killzone hours = best setup times'],
        lessons_data:[
            {n:'01',t:'SMC ምንድነው?',body:`<p>Smart Money Concepts (SMC) = banks ና institutions ገበያ እንዴት እንደሚያንቀሳቅሱ የሚያስተምር framework ነው።</p><p style="margin-top:10px">Core idea: <strong>Institutions retail traders stop losses ይሳደዳሉ</strong> — ቀጥሎ real move ያደርጋሉ። SMC ያ footprints ተከትሎ enter ማድረግ ያስተምራል።</p>`,tags:['SMC','Essential'],warn:'SMC advanced concept ነው። Market structure ና S/R አስቀድሞ ይማሩ።'},
            {n:'02',t:'Order Blocks (OB)',body:`<p>Order Block = strong impulsive move ከመሆኑ በፊት ያለው last opposing candle ነው። Institutions orders ያስቀመጡበት ቦታ ነው።</p><p style="margin-top:10px"><strong>Bullish OB</strong> = strong bullish move ከመሆኑ በፊት last red candle<br><strong>Bearish OB</strong> = strong bearish move ከመሆኑ በፊት last green candle</p>`,formula:'Bullish OB entry:\n1. Strong bullish displacement\n2. Find last red candle before move\n3. Wait for price to return to OB\n4. Enter long, SL below OB',tags:['SMC','OB','Entry']},
            {n:'03',t:'Liquidity & Stop Hunts',body:`<p><strong>Liquidity</strong> = stop losses ተሰብስቦ ያለበት ቦታ ነው። Banks ትልቅ orders ለመሙላት liquidity ያስፈልጋቸዋል።</p><p style="margin-top:10px"><strong>Buy-side liquidity (BSL)</strong>: swing highs ከበላይ — short sellers' stops<br><strong>Sell-side liquidity (SSL)</strong>: swing lows ከታች — long traders' stops</p><p style="margin-top:10px"><strong>Pattern</strong>: Price sweeps liquidity → ወዲያው ወደ opposite direction ይሄዳል = Stop Hunt</p>`,formula:'Bearish after BSL sweep:\n1. Price breaks above recent highs\n2. Closes back below with strong bearish candle\n3. Enter short with SL above wick',tags:['SMC','Liquidity'],tip:'ዋጋ level ሰብሮ ወዲያው ሲመለስ — stop hunt ነው። Real move ወደ opposite direction ነው።'},
            {n:'04',t:'Fair Value Gaps (FVG)',body:`<p>FVG = 3-candle pattern ሲሆን middle candle fast ስለሚሄድ gap ይፈጥራል — candle 1 high ና candle 3 low መካከል (bullish FVG)።</p><p style="margin-top:10px">ለምን ያስፈልጋል: ገበያ efficient ስለሆነ ያ imbalances ይሞሉ ፈጣሪዋቸው።</p>`,formula:'FVG + OB Confluence:\nIf bullish FVG overlaps with bullish OB\n→ Extremely high probability entry zone',tags:['SMC','FVG']},
            {n:'05',t:'BOS & CHOCH',body:`<p><strong>BOS (Break of Structure)</strong>: previous swing high ሲሰብር (uptrend) — trend continuation ያረጋግጣል።</p><p style="margin-top:10px"><strong>CHOCH (Change of Character)</strong>: ፊርስ opposite structure break — trend reversal signal ነው።</p>`,formula:'CHOCH → First BOS in new direction → Pullback to OB → ENTRY',tags:['SMC','Structure']},
            {n:'06',t:'Killzones & Best Entry Times',body:`<p>ICT Killzones = institutional order flow ትልቁ ጊዜ:</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:8px"><li><strong>London Open</strong>: 10:00–12:00 EAT — ትልቁ፣ best setups</li><li><strong>New York AM</strong>: 15:00–18:00 EAT — high volatility</li><li><strong>London Close</strong>: 17:00–19:00 EAT — reversals</li></ul>`,tags:['SMC','Timing'],tip:'10:00 EAT ና 15:00 EAT alerts አዘጋጅ። ያ ሁለት windows ምርጥ setups ያመጣሉ።'}
        ]
    },
    {
        id:'fx5', icon:'🛡️', color:'#10b981', course:'forex',
        cat:'Forex — Chapter 5: Risk Management',
        title:'Risk Management — ካፒታልዎን ይጠብቁ',
        desc:'Risk management = ትሬዲንግ ስኬት ትልቁ መሠረት። ይህ ምዕራፍ account ሊያድናቸው ይችላል።',
        lessons: 5, duration: '2h 00m',
        concepts:['Never risk more than 1–2% per trade','Position sizing = Lots = Risk$ ÷ (SL pips × pip value)','Always aim R:R ≥ 1:2','50% drawdown needs 100% gain to recover','Journal = your psychological mirror'],
        lessons_data:[
            {n:'01',t:'1% Rule — ለምን Account ያድናል',body:`<p><strong>ደንቡ: በአንድ trade 1–2% ከዚያ በላይ አትስጡ።</strong></p><p style="margin-top:10px">10 consecutive losses ሲሆን:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ 1% per trade → 90.4% capital ይቀራል</li><li>→ 10% per trade → 34.9% ብቻ ይቀራል</li><li>→ 25% per trade → 5.6% ብቻ ይቀራል</li></ul>`,formula:'$1,000 account → Max risk per trade: $10 (1%)\n$5,000 account → Max risk per trade: $50 (1%)',tags:['Essential','Rule']},
            {n:'02',t:'Position Sizing Formula',body:`<p>Position sizing = SL በፊት ትክክለኛ lot size ማስላት። ይህ ካልሠሩ 1% rule ሠርቶ አያውቅም።</p>`,formula:'Lot Size = Risk Amount ($) ÷ (SL pips × Pip Value)\n\nምሳሌ:\nAccount: $2,000 | Risk: 1% = $20\nSL: 20 pips | Pip value: $10\nLot = $20 ÷ (20 × $10) = 0.1 lots',tags:['Essential','Math'],tip:'Tag Bridge ካልኩሌተር ይጠቀሙ — ወዲያው ያሰላል።'},
            {n:'03',t:'Risk:Reward Ratio',body:`<p>R:R ratio = ለ $1 risk ምን ያህል gain ታገኛለህ።</p><table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:.82rem"><tr style="background:rgba(99,102,241,.1)"><th style="padding:8px">R:R</th><th style="padding:8px">Break-even WR</th><th style="padding:8px">Status</th></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">1:1</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">50%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">Acceptable</td></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">1:2</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">34%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">✅ Good</td></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">1:3</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">25%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">✅ Excellent</td></tr></table>`,tags:['Essential','R:R']},
            {n:'04',t:'Drawdown Math',body:`<p>Drawdown math ስለ risk ሙሉ አስተሳሰብዎን ይቀይረዋል።</p><table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:.82rem"><tr style="background:rgba(239,68,68,.1)"><th style="padding:8px">Loss</th><th style="padding:8px">Recovery Needed</th></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">10%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">11%</td></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">25%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">33%</td></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">50%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">100%</td></tr><tr><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">75%</td><td style="padding:8px;border-top:1px solid rgba(255,255,255,.06)">300%</td></tr></table>`,tags:['Risk','Drawdown'],warn:'50% drawdown ሲሆን break-even ለመድረስ 100% gain ያስፈልጋል። Capital protection = #1 priority።'},
            {n:'05',t:'Trading Journal',body:`<p>Journal ትሬዲንግ ውስጥ ትልቁ underused tool ነው።</p><p style="margin-top:10px"><strong>ለእያንዳንዱ trade ምን ይፃፉ:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Date, pair, direction, entry, SL, TP</li><li>→ Lot size ና risk amount</li><li>→ Setup type (OB, FVG, S/R, etc.)</li><li>→ Result (P&L, pips)</li><li>→ Emotional state ና lessons</li></ul><p style="margin-top:10px">Tag Bridge <strong>Trading Journal</strong> ቀጥታ ይጠቀሙ — calculations ያደርጋል።</p>`,tags:['Essential','Journal'],tip:'ሰንደ ሁሉ journal ይፈትሹ። Losing trades patterns ያሳያሉ — ምን እንደሚስተካከሉ ይነግርዎታል።'}
        ]
    },
    {
        id:'fx6', icon:'🧘', color:'#8b5cf6', course:'forex',
        cat:'Forex — Chapter 6: Trading Psychology',
        title:'Trading Psychology',
        desc:'ትሬዲንግ 90% psychology ነው። Mind ማስተዳደር ሲቻል charts ቀላል ይሆናሉ።',
        lessons: 5, duration: '1h 30m',
        concepts:['Fear causes early exits and missed trades','Greed causes overtrading and ignoring your plan','FOMO = #1 account killer for beginners','Revenge trading = fastest way to blow an account','Discipline is trained, not born'],
        lessons_data:[
            {n:'01',t:'Trading Psychology ምንድነው?',body:`<p>Studies ሁሌ ያሳያሉ: <strong>ትሬዲንግ ስኬት 90% psychology ነው።</strong></p><p style="margin-top:10px">ሁለቱ ዋና emotions:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li><strong>Fear</strong> — winners early exit፣ valid setups skip ያደርጋል</li><li><strong>Greed</strong> — losers long hold፣ overtrading ያደርጋል</li></ul><p style="margin-top:10px">Solution: emotions ማጥፋት አይደለም — <strong>rules ስሜት ቢኖርህም ማክበር ነው።</strong></p>`,tags:['Psychology','Mindset']},
            {n:'02',t:'FOMO — Fear of Missing Out',body:`<p>FOMO = move ከሆነ በኋላ enter ማድረግ። Technical mistake ከሆነ losses ይበልጣል።</p><p style="margin-top:10px">FOMO trade signs:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Large move ከሆነ በኋላ entering</li><li>→ Poor R:R (entry too late)</li><li>→ No clear SL level</li></ul>`,tags:['Psychology','FOMO'],warn:'Setup ካለፋ → ተወው። ሌላ setup ሁሌ ይመጣል።'},
            {n:'03',t:'Revenge Trading',body:`<p>Revenge trading = loss ካደረጉ በኋላ ቁጣ ወይም frustration ወዲያው another trade መክፈት።</p><p style="margin-top:10px">Pattern: Loss → angry → bigger position → no setup → bigger loss → repeat → account blown</p><p style="margin-top:10px"><strong>Rule</strong>: Loss ካደረጉ ቢያንስ 30 minutes ያርፉ። Trade review አድርጉ። ቀጥሎ ይወስኑ።</p>`,tags:['Psychology','Discipline']},
            {n:'04',t:'Discipline & Routine',body:`<p>Discipline personality አይደለም — <strong>systems ና habits ይፈጥሩዋታል።</strong></p><p style="margin-top:10px">Professional daily routine:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:6px"><li>→ <strong>Morning</strong>: Calendar check, key levels mark</li><li>→ <strong>During session</strong>: Watchlist monitor only</li><li>→ <strong>After session</strong>: Every trade journal</li><li>→ <strong>Sunday</strong>: Weekly review ና plan</li></ul>`,formula:'Daily rules:\n✓ Check calendar\n✓ Only strategy setups\n✓ SL BEFORE entry\n✓ Journal every trade',tags:['Discipline','Routine']},
            {n:'05',t:'Long Game — Wealth Building',body:`<p>Professional trading = marathon ነው፣ sprint አይደለም።</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Year 1</strong>: Craft ተማሩ። Small losses = tuition ነው።</li><li>→ <strong>Year 2</strong>: Consistent small gains። 2–5% monthly excellent ነው።</li><li>→ <strong>Year 3+</strong>: Scale position sizes።</li></ul>`,formula:'$1,000 at 5%/month:\nYear 1: $1,796\nYear 2: $3,225\nYear 3: $5,792',tags:['Mindset','Growth'],tip:'Year 1 goal = profit አይደለም። Year 2 ትሬዲንግ ውስጥ መቆየት ነው — lessons ተምሮ።'}
        ]
    }
];

// ════════════════════════════════════════════════════════════════
//  CRYPTO MARKET COURSE
// ════════════════════════════════════════════════════════════════
const CRYPTO_CHAPTERS = [
    {
        id:'cr1', icon:'⛓️', color:'#f59e0b', course:'crypto',
        cat:'Crypto — Chapter 1: Blockchain Fundamentals',
        title:'Blockchain ምንድነው?',
        desc:'Crypto ሁሉ Blockchain ላይ ይሠራል። ቴክኖሎጂውን ሳትረዳ Crypto ትሬዲንግ ፈጽሞ አያዋጣም። ከዚህ ይጀምሩ።',
        lessons: 5, duration: '1h 30m',
        concepts:['Blockchain = decentralized, immutable ledger','Each block contains: data + previous hash + timestamp','Consensus mechanisms: PoW vs PoS','Nodes validate transactions — no single authority','Public & private keys = your wallet identity','Smart contracts = self-executing code on blockchain'],
        lessons_data:[
            {n:'01',t:'Blockchain ምንድነው?',body:`<p>Blockchain = <strong>decentralized digital ledger</strong> ነው — transactions ያስቀምጣል፣ ማንም ሊቀይረው አይችልም።</p><p style="margin-top:10px">ባህሪያቱ:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Decentralized</strong>: ባንክ ወይም government አይቆጣጠረውም</li><li>→ <strong>Immutable</strong>: ያለፈ data ሊቀይር አይቻልም</li><li>→ <strong>Transparent</strong>: ሁሉም transactions public ናቸው</li><li>→ <strong>Secure</strong>: Cryptography ይጠብቀዋል</li></ul>`,formula:'Block = Data + Previous Hash + Timestamp + Nonce\nChain = Block1 → Block2 → Block3...',tags:['Beginner','Blockchain']},
            {n:'02',t:'How Transactions Work',body:`<p>Crypto transaction ሲላኩ የሚሆነው:</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:6px"><li>1. <strong>Transaction ይፈጠራል</strong> — sender ፈርሞ network ይልካል</li><li>2. <strong>Nodes ይያረጋግጡ</strong> — balance ና signature ይፈትሻሉ</li><li>3. <strong>Mempool ይጠብቃል</strong> — miners/validators ይወስዱት</li><li>4. <strong>Block ይካተታል</strong> — confirmed!</li><li>5. <strong>Irreversible</strong> — ወዲያው ሊቀይር አይቻልም</li></ul>`,tags:['Beginner','Transactions']},
            {n:'03',t:'Proof of Work vs Proof of Stake',body:`<p><strong>Proof of Work (PoW)</strong> — Bitcoin ይጠቀምበታል<br>→ Miners computational power ያጠፋሉ<br>→ ጠንካራ security<br>→ Energy intensive</p><p style="margin-top:10px"><strong>Proof of Stake (PoS)</strong> — Ethereum 2.0 ይጠቀምበታል<br>→ Validators crypto stake ያደርጋሉ<br>→ Energy efficient<br>→ ፈጣን transactions</p>`,tags:['Intermediate','Consensus']},
            {n:'04',t:'Wallets & Keys',body:`<p>Crypto wallet = private ና public keys የያዘ ነው — actual crypto አይይዝም።</p><p style="margin-top:10px"><strong>Public key</strong> = Bitcoin address (ሰዎች ወደዚህ ይልካሉ)<br><strong>Private key</strong> = ፊርማ — ይህ ቢጠፋ funds ሁሉ ጠፈ!</p><p style="margin-top:10px"><strong>Wallet types:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Hot wallet: online (convenient, less secure)</li><li>→ Cold wallet: offline hardware (most secure)</li></ul>`,tags:['Essential','Wallets'],warn:'Private key/seed phrase ሲጠፋ recovery የለም። Paper ላይ ፃፎ offline ያስቀምጡ።'},
            {n:'05',t:'Smart Contracts',body:`<p>Smart contract = blockchain ላይ self-executing code ነው — conditions ሲሟሉ automatically ይፈጸማል።</p><p style="margin-top:10px">ምሳሌ: "A ወደ B $100 ቢልክ፣ B product ይፋፋምለታል" — automatically። No middleman።</p><p style="margin-top:10px">ቦታዎቻቸው: DeFi, NFT, DAOs, Insurance, Gaming</p>`,formula:'Smart Contract = If (condition) → Then (execute action)\nNo trust needed — code enforces it',tags:['Intermediate','SmartContracts']}
        ]
    },
    {
        id:'cr2', icon:'₿', color:'#f59e0b', course:'crypto',
        cat:'Crypto — Chapter 2: Cryptocurrency Fundamentals',
        title:'Cryptocurrency መሠረቶች',
        desc:'Bitcoin ምንድነው? Altcoins? Market cap? ሁሉንም crypto fundamentals ከዜሮ ይማሩ።',
        lessons: 5, duration: '1h 45m',
        concepts:['Bitcoin = first decentralized digital currency','Altcoins = all crypto except Bitcoin','Market cap = price × circulating supply','Stablecoins = pegged to fiat (USDT, USDC)','Halving reduces Bitcoin supply every 4 years','Tokenomics = supply, distribution, utility'],
        lessons_data:[
            {n:'01',t:'Bitcoin — Digital Gold',body:`<p>Bitcoin (BTC) = 2009 Satoshi Nakamoto የፈጠረው ፊርስ decentralized digital currency ነው።</p><p style="margin-top:10px">Key facts:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Max supply: <strong>21 million BTC</strong> — ከዚያ በላይ አይፈጠርም</li><li>→ Divisible: 1 BTC = 100,000,000 satoshis</li><li>→ No central authority — protocol rules only</li><li>→ Store of value — "Digital Gold" ይባላል</li></ul>`,tags:['Beginner','Bitcoin']},
            {n:'02',t:'Altcoins & Tokens',body:`<p><strong>Altcoins</strong> = Bitcoin ያልሆኑ ሁሉም cryptocurrencies።</p><p style="margin-top:10px">ዋና ዓይነቶች:</p><ul style="list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:5px"><li><strong>Ethereum (ETH)</strong> — smart contracts platform</li><li><strong>BNB</strong> — Binance exchange token</li><li><strong>SOL, ADA, DOT</strong> — Layer 1 blockchains</li><li><strong>Stablecoins (USDT, USDC)</strong> — $1 value pegged</li><li><strong>Meme coins (DOGE, SHIB)</strong> — high risk, speculation</li></ul>`,tags:['Beginner','Altcoins']},
            {n:'03',t:'Market Cap & Rankings',body:`<p><strong>Market Cap = Current Price × Circulating Supply</strong></p><p style="margin-top:10px">ለምን ያስፈልጋል: ዋጋ ብቻ ሳይሆን total value ያሳያል።</p><p style="margin-top:10px">Example: Coin A = $1, supply 1B = $1B market cap<br>Coin B = $1,000, supply 1M = $1B market cap<br>→ Equal value! ዋጋ ብቻ አያታልሉ።</p>`,formula:'Market Cap = Price × Circulating Supply\nFully Diluted = Price × Max Supply',tags:['Beginner','MarketCap']},
            {n:'04',t:'Bitcoin Halving',body:`<p>Halving = ሁሉም ~4 ዓመት Bitcoin mining reward ይቀናሽ ይሆናል።</p><p style="margin-top:10px">History:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ 2012: 50 → 25 BTC per block</li><li>→ 2016: 25 → 12.5 BTC</li><li>→ 2020: 12.5 → 6.25 BTC</li><li>→ 2024: 6.25 → 3.125 BTC</li></ul><p style="margin-top:10px">Supply ሲቀንስ demand ተመሳሳይ ሲሆን → ዋጋ ሊወጣ ይችላል። Historical bull runs halving ከ 12–18 ወር ቀጥሎ ይመጣሉ።</p>`,tags:['Intermediate','Halving']},
            {n:'05',t:'Tokenomics',body:`<p>Tokenomics = token economic model ነው። Project ሳይሆን token ብቻ ስትፈትሽ ይህ ሳትፈትሽ አትቅዳ።</p><p style="margin-top:10px">ምን ትፈትሻለህ:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Total supply</strong>: ምን ያህል tokens አሉ?</li><li>→ <strong>Circulating supply</strong>: ምን ያህል market ላይ ነው?</li><li>→ <strong>Distribution</strong>: team ምን ያህል % ይዘዋል?</li><li>→ <strong>Vesting</strong>: team tokens መቼ ይፈቱ?</li><li>→ <strong>Utility</strong>: token ለምን ያስፈልጋል?</li></ul>`,tags:['Intermediate','Tokenomics'],warn:'Team 30%+ ወደ wallet ሳልቅ pump ሊያደርጉ ይችላሉ። Vesting schedule ሁሌ ፈትሽ።'}
        ]
    },
    {
        id:'cr3', icon:'🔗', color:'#06b6d4', course:'crypto',
        cat:'Crypto — Chapter 3: Blockchain & DeFi',
        title:'DeFi — Decentralized Finance',
        desc:'Traditional finance ሳያስፈልግ lending, borrowing, earning ማድረግ። DeFi ምን ማለት ነው? Protocols ምን ያደርጋሉ?',
        lessons: 4, duration: '1h 30m',
        concepts:['DeFi = financial services without banks/intermediaries','DEX = decentralized exchange (Uniswap, PancakeSwap)','Liquidity pools replace order books','Yield farming = earning rewards for providing liquidity','Impermanent loss risk in liquidity pools','Smart contract bugs = major DeFi risk'],
        lessons_data:[
            {n:'01',t:'DeFi ምንድነው?',body:`<p>DeFi (Decentralized Finance) = ባንክ፣ broker ወይም middleman ሳያስፈልግ financial services ማግኘት።</p><p style="margin-top:10px">ምን ያካትታል:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Lending & Borrowing (Aave, Compound)</li><li>→ Trading (Uniswap, PancakeSwap)</li><li>→ Earning yield (Yearn Finance)</li><li>→ Stablecoins (DAI, FRAX)</li></ul>`,tags:['DeFi','Beginner']},
            {n:'02',t:'DEX vs CEX',body:`<p><strong>CEX (Centralized Exchange)</strong> — Binance, Coinbase ወዘተ<br>→ Company controls your funds<br>→ KYC required<br>→ User-friendly<br>→ Higher liquidity</p><p style="margin-top:10px"><strong>DEX (Decentralized Exchange)</strong> — Uniswap, PancakeSwap ወዘተ<br>→ You control your wallet<br>→ No KYC<br>→ Anyone can list tokens<br>→ Smart contract risk</p>`,formula:'Not your keys, not your coins.\nCEX = trusting the company\nDEX = trusting the code',tags:['DeFi','Exchanges'],warn:'CEX ከሆነ private key ሰው hands ውስጥ ነው። Exchange hacked ቢሆን funds ሊጠፋ ይችላል።'},
            {n:'03',t:'Liquidity Pools & AMM',body:`<p>DEX order book አይጠቀምም። <strong>Automated Market Maker (AMM)</strong> ጋር liquidity pools ይጠቀማል።</p><p style="margin-top:10px">Liquidity pool = 2 tokens ያለ pool (ምሳሌ: ETH/USDT)። Traders ያ pool ጋር swap ያደርጋሉ። Liquidity providers fees ያገኛሉ።</p>`,formula:'AMM Price Formula: x × y = k\nx = Token A, y = Token B, k = constant\nAs x increases → y decreases → price changes',tags:['DeFi','AMM']},
            {n:'04',t:'Yield Farming & Risks',body:`<p>Yield farming = liquidity pool ወይም protocol ውስጥ crypto ስታኪ ያደርጋቸው rewards ያገኛሉ።</p><p style="margin-top:10px"><strong>Risks:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Smart contract bugs</strong> — code ሲሰበር funds ሊጠፋ ይችላል</li><li>→ <strong>Impermanent loss</strong> — pool ውስጥ token price ሲቀይር</li><li>→ <strong>Rug pull</strong> — developers liquidity ሲወስዱ</li><li>→ <strong>APY exaggeration</strong> — 1000% APY sustainable አይደለም</li></ul>`,tags:['DeFi','Risks'],warn:'DeFi "too good to be true" APYs ሁሌ rug pull signal ናቸው። DYOR — Do Your Own Research።'}
        ]
    },
    {
        id:'cr4', icon:'📈', color:'#10b981', course:'crypto',
        cat:'Crypto — Chapter 4: Crypto Trading Strategies',
        title:'Crypto Trading Strategies',
        desc:'Spot, Futures, Margin — ምን ምን ዓይነት trading አለ? HODLing vs Active Trading? ትክክለኛ Crypto strategies ይማሩ።',
        lessons: 5, duration: '2h 00m',
        concepts:['Spot trading = buy/sell actual crypto','Futures = contracts for future price','Margin trading amplifies gains AND losses','HODLing = long-term hold strategy','Dollar-cost averaging (DCA) reduces timing risk','On-chain analysis shows real market data'],
        lessons_data:[
            {n:'01',t:'Spot vs Futures Trading',body:`<p><strong>Spot Trading</strong> = actual crypto ትገዛለህ/ትሸጣለህ<br>→ Ownership አለህ<br>→ Loss = investment ብቻ<br>→ Beginners ይጀምሩ ከዚህ</p><p style="margin-top:10px"><strong>Futures Trading</strong> = contract ትሸምታለህ — actual crypto አይደለም<br>→ Long (price ይወጣል) ወይም Short (ይወርዳል)<br>→ Leverage አለ — 10x, 20x, 100x<br>→ Liquidation risk አለ</p>`,tags:['Trading','Spot','Futures'],warn:'Futures High leverage ሲጠቀሙ ሙሉ position liquidate ሊሆን ይችላል። Beginners spot ብቻ ይጠቀሙ።'},
            {n:'02',t:'HODLing & DCA',body:`<p><strong>HODL</strong> = "Hold On for Dear Life" — long-term buy & hold strategy<br>→ Bitcoin, Ethereum ሲገዙ ለዓመታት ያስቀምጣሉ<br>→ Short-term volatility ምንም አያሳስብም<br>→ Historical average return ጥሩ ነው</p><p style="margin-top:10px"><strong>Dollar-Cost Averaging (DCA)</strong> = ሁሌ same amount ወደ crypto ያስቀምጣሉ<br>→ ምሳሌ: ሁሉም ወር $50 Bitcoin<br>→ Timing risk ይቀንሳል<br>→ Average buy price ወረፍ ይሆናል</p>`,formula:'DCA Example:\nMonth 1: $50 @ BTC $30,000 = 0.00167 BTC\nMonth 2: $50 @ BTC $25,000 = 0.00200 BTC\nMonth 3: $50 @ BTC $35,000 = 0.00143 BTC\nAvg cost = $50 × 3 / (0.00510 BTC) = $29,412/BTC',tags:['Strategy','HODL','DCA']},
            {n:'03',t:'Technical Analysis for Crypto',body:`<p>Forex technical analysis Crypto ላይ ሙሉ ሠርቷል — ምክንያቱም psychology ሁሉም market ላይ ተመሳሳይ ነው።</p><p style="margin-top:10px">Crypto-specific considerations:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Higher volatility — wider SL ያስፈልጋል</li><li>→ 24/7 market — sleep ሳለ moves ሊሆን ይችላል</li><li>→ Bitcoin dominance ሁሉም altcoins ይነካዋል</li><li>→ Funding rates (futures) sentiment ያሳያሉ</li></ul>`,tags:['Technical','Crypto']},
            {n:'04',t:'On-Chain Analysis',body:`<p>On-chain analysis = blockchain data ትረዳ ምን እየሆነ እንዳለ ትረዳ።</p><p style="margin-top:10px">ዋና metrics:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Exchange inflows/outflows</strong>: Exchange ወደ wallet ሲሄድ HODLers — bullish</li><li>→ <strong>Whale movements</strong>: Large wallets ምን ሲያደርጉ</li><li>→ <strong>MVRV ratio</strong>: Overvalued vs undervalued signal</li><li>→ <strong>Fear & Greed Index</strong>: Market sentiment</li></ul>`,formula:'Tools: Glassnode, CryptoQuant, Santiment\nFree: Alternative.me (Fear & Greed)',tags:['OnChain','Analysis']},
            {n:'05',t:'Altcoin Season & Bitcoin Dominance',body:`<p><strong>Bitcoin Dominance (BTC.D)</strong> = Bitcoin market cap / total crypto market cap</p><p style="margin-top:10px">BTC.D ሲወርድ → funds altcoins ወደ ይሄዳሉ = <strong>Altcoin Season</strong><br>BTC.D ሲወጣ → funds Bitcoin ወደ ይሄዳሉ = alts ይወርዳሉ</p><p style="margin-top:10px">Pattern ሁሌ: BTC first → ETH → Large caps → Small caps → Meme coins</p>`,formula:'Alt Season Indicator:\nBTC.D < 40% = Peak altcoin season\nBTC.D > 60% = Bitcoin dominance',tags:['Strategy','AltSeason'],tip:'Altcoin season ሲሆን gains ፈጣን ናቸው — ነገር ግን reversals ፈጣን ናቸው። Quick profit take ያስፈልጋል።'}
        ]
    },
    {
        id:'cr5', icon:'🎨', color:'#ec4899', course:'crypto',
        cat:'Crypto — Chapter 5: NFT & Web3',
        title:'NFT & Web3',
        desc:'NFT ምንድነው? Metaverse? Web3 ምን ይቀይራል? ቴክኖሎጂው ወደፊት የሚሄድበት አቅጣጫ ይረዱ።',
        lessons: 4, duration: '1h 15m',
        concepts:['NFT = Non-Fungible Token — unique digital asset','Each NFT has unique metadata on blockchain','Web3 = user-owned internet vs Web2 (platform-owned)','Metaverse = virtual worlds using blockchain','DAOs = decentralized autonomous organizations','Play-to-earn games use NFT/token economies'],
        lessons_data:[
            {n:'01',t:'NFT ምንድነው?',body:`<p>NFT (Non-Fungible Token) = blockchain ላይ unique digital asset ነው — ሊቀዳ ወይም ሊቀያየር አይቻልም።</p><p style="margin-top:10px">Fungible vs Non-Fungible:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Bitcoin = fungible: 1 BTC = 1 BTC (interchangeable)</li><li>→ NFT = non-fungible: each one unique (like a painting)</li></ul><p style="margin-top:10px">NFT use cases: Digital art, Music, Gaming items, Domain names, Real-world asset ownership</p>`,tags:['NFT','Beginner']},
            {n:'02',t:'Web3 — Next Internet',body:`<p><strong>Web1</strong>: Read-only (1990s) — static websites<br><strong>Web2</strong>: Read-Write (2000s+) — platforms own your data (Facebook, Google)<br><strong>Web3</strong>: Read-Write-Own — users own their data ና assets</p><p style="margin-top:10px">Web3 ምን ይቀይራል:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Data ownership ወደ user ይሄዳል</li><li>→ Decentralized apps (dApps)</li><li>→ Token-based incentives ለ participation</li></ul>`,tags:['Web3','Intermediate']},
            {n:'03',t:'DAO — Decentralized Organizations',body:`<p>DAO (Decentralized Autonomous Organization) = code ና token voting ብቻ የሚተዳደር organization ነው — no CEO, no board።</p><p style="margin-top:10px">Members tokens ይያዛሉ → decisions ይወስኑ → treasury ያስተዳድራሉ።</p><p style="margin-top:10px">ምሳሌዎች: MakerDAO (DeFi), Uniswap DAO, ConstitutionDAO</p>`,tags:['DAO','Web3']},
            {n:'04',t:'NFT Trading & Risks',body:`<p>NFT trading ትልቅ opportunity ና ትልቅ risk አለው።</p><p style="margin-top:10px"><strong>Risks:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Illiquid market</strong>: Buyer ካላገኙ ሊሸጡ አይቻልም</li><li>→ <strong>Wash trading</strong>: Fake volume ሊፈጠር ይችላል</li><li>→ <strong>Rug pull</strong>: Creators ሸሸ ቢሉ value ዜሮ</li><li>→ <strong>Copyright issues</strong>: NFT = ownership of token, not underlying art</li></ul>`,tags:['NFT','Risks'],warn:'NFT speculation ለ beginners ትልቅ risk ነው። Investment portfolio 5% ያህል ብቻ ይዝ ቢያስፈልግ።'}
        ]
    },
    {
        id:'cr6', icon:'🛡️', color:'#10b981', course:'crypto',
        cat:'Crypto — Chapter 6: Risk Management',
        title:'Crypto Risk Management',
        desc:'Crypto volatility Forex ይበልጣል። Risk management ሳይኖር account ፍጥነት ይጠፋል።',
        lessons: 4, duration: '1h 15m',
        concepts:['Crypto is 3–10x more volatile than Forex','Portfolio diversification across BTC, ETH, alts','Never invest more than you can afford to lose','Hardware wallet for long-term holdings','Scam awareness: phishing, fake projects, rug pulls'],
        lessons_data:[
            {n:'01',t:'Crypto Volatility',body:`<p>Crypto Forex ይበልጥ volatile ነው። BTC single day 10–20% ሊለዋወጥ ይችላል። Altcoins 50%+ ሊወድቁ ይችላሉ።</p><p style="margin-top:10px">ምን ማድረግ:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Position size ያስተካክሉ — Forex 1% ፈንታ 0.5% ሊሆን ይችላል</li><li>→ Wider SL ያስፈልጋል — noise ያስወጣሉ</li><li>→ Overnight holds ሲያደርጉ position small ይሁን</li></ul>`,tags:['Risk','Crypto']},
            {n:'02',t:'Portfolio Diversification',body:`<p>Crypto portfolio allocation ምሳሌ (conservative):</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:5px"><li>→ <strong>Bitcoin (BTC)</strong>: 40–50% — ትልቁ stability</li><li>→ <strong>Ethereum (ETH)</strong>: 20–30% — utility ና growth</li><li>→ <strong>Large caps</strong> (BNB, SOL): 15–20%</li><li>→ <strong>Mid/Small caps</strong>: 5–10% — high risk/reward</li><li>→ <strong>Stablecoins (USDT)</strong>: 10–15% — buying dips</li></ul>`,formula:'Rule: Never put all eggs in one basket\nBTC + ETH = core (60–80%)\nAlts = speculation (20–40%)',tags:['Risk','Portfolio']},
            {n:'03',t:'Scam Awareness',body:`<p>Crypto scams ብዙ ናቸው። ዋናዎቹ:</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:6px"><li>→ <strong>Phishing</strong>: Fake website/email — private key ይጠይቃሉ</li><li>→ <strong>Rug pull</strong>: Fake project → developers ሸሹ</li><li>→ <strong>Ponzi</strong>: "Guaranteed returns" ቃል</li><li>→ <strong>Fake exchanges</strong>: Withdraw block ያደርጋሉ</li><li>→ <strong>Social media scams</strong>: "Send 1 BTC get 2 BTC back"</li></ul>`,tags:['Security','Scams'],warn:'"Guaranteed profit"፣ "Risk-free"፣ "Limited time" — ሁሌ scam signals ናቸው። ያምኑ።'},
            {n:'04',t:'Secure Storage',body:`<p>Long-term crypto holdings ምን ያህል ሲሰበሰቡ hardware wallet ወደ ማዛወር ያስቡ።</p><p style="margin-top:10px"><strong>Best practices:</strong></p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:5px"><li>→ Hardware wallet (Ledger, Trezor) ለ long-term holdings</li><li>→ Seed phrase offline ፃፉ — digital copy አትያዙ</li><li>→ 2FA ሁሉም accounts ላይ</li><li>→ Phishing sites ሁሌ URL ይፈትሹ</li><li>→ Unknown links አትጫኑ</li></ul>`,tags:['Security','Storage'],warn:'Seed phrase ማንም አይጠይቅዎትም — ቢጠይቅ scammer ነው።'}
        ]
    },
    {
        id:'cr7', icon:'🧘', color:'#8b5cf6', course:'crypto',
        cat:'Crypto — Chapter 7: Trading Psychology',
        title:'Crypto Trading Psychology',
        desc:'Crypto market FOMO ና FUD ሁሌ ሊያሳስትዎ ይሞክራል። Mental game ቁጥጥር ስር ሲያደርጉ ብቻ ይሳካሉ።',
        lessons: 4, duration: '1h 00m',
        concepts:['FOMO = most common crypto trading mistake','FUD = Fear, Uncertainty, Doubt — often used to manipulate','Bull market greed causes buying tops','Bear market fear causes selling bottoms','Crypto cycles repeat — patience is a strategy'],
        lessons_data:[
            {n:'01',t:'FOMO & FUD in Crypto',body:`<p><strong>FOMO</strong> (Fear of Missing Out): Coin 500% ሲጨምር buying — ሁሌ top ቅርብ ሲሆን ነው።</p><p style="margin-top:10px"><strong>FUD</strong> (Fear, Uncertainty, Doubt): Negative news ሲሰሙ panic selling — often manipulation ነው።</p><p style="margin-top:10px">Pattern: FOMO → buy top → price drops → FUD → sell bottom → price pumps → FOMO again</p>`,tags:['Psychology','FOMO','FUD'],warn:'Social media hype ሲቀጥቀጥ FOMO signal ነው። Entry ሳይሆን exit ማሰብ ጊዜ ነው።'},
            {n:'02',t:'Bull vs Bear Market Psychology',body:`<p><strong>Bull market</strong> (ዋጋ ሲወጣ):<br>→ Everyone is a genius<br>→ Greed ያጠናወጣል<br>→ Risk management ይዘነጋሉ<br>→ FOMO purchases at top</p><p style="margin-top:10px"><strong>Bear market</strong> (ዋጋ ሲወርድ):<br>→ Panic selling ሲሆን<br>→ "Crypto is dead" ዜናዎች<br>→ Historically = best buying opportunity<br>→ Patience ያስፈልጋል</p>`,formula:'Warren Buffett rule (Crypto version):\n"Buy when others are fearful,\nSell when others are greedy"',tags:['Psychology','Market Cycles']},
            {n:'03',t:'Crypto Market Cycles',body:`<p>Crypto 4-year cycles ሁሌ ይደጋገማሉ (Bitcoin halving ጋር ይዛመዳሉ):</p><ul style="list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:6px"><li>1. <strong>Accumulation</strong>: Bear market bottom — smart money buys</li><li>2. <strong>Markup</strong>: Slow uptrend — early adopters profit</li><li>3. <strong>Distribution</strong>: Bull market peak — smart money sells</li><li>4. <strong>Markdown</strong>: Bear market — retail panic sells</li></ul>`,tags:['Cycles','Strategy']},
            {n:'04',t:'Patience & Long-term Thinking',body:`<p>Crypto millionaires = early buyers ና patient holders ናቸው። traders አይደሉም።</p><p style="margin-top:10px">ምን ያስቀምጣሉ:</p><ul style="list-style:none;margin-top:6px;display:flex;flex-direction:column;gap:4px"><li>→ Quality assets ብቻ (BTC, ETH)</li><li>→ Bear market ሳትፈራ ይጨምሩ</li><li>→ Bull market top ሲቃረብ ትርፍ ይውሰዱ</li><li>→ 100x return ሲጠብቁ 90% loss ሊቻሉ አለባቸው</li></ul>`,formula:'Crypto timeline:\nLearn (3mo) → Small spot (6mo) → Scale → Futures (advanced only)',tags:['Mindset','LongTerm'],tip:'Crypto invest ሲያደርጉ 3–5 ዓመት horizon ያስቡ። Short-term noise ignore ያድርጉ።'}
        ]
    }
];

// ════════════════════════════════════════════════════════════════
//  COMBINED (for backward compatibility — returns both)
// ════════════════════════════════════════════════════════════════
const CHAPTERS = [...FOREX_CHAPTERS, ...CRYPTO_CHAPTERS];

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin && (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://www-tag-bridge.vercel.app');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, private');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    } else if (req.body && req.body.token) {
        token = req.body.token;
    }

    if (!token) {
        return res.status(401).json({
            valid: false,
            error: 'Authentication required. Please enter your book purchase password.'
        });
    }

    const secret = process.env.ACADEMY_JWT_SECRET;
    if (!secret) {
        console.error('[academy-lessons] ACADEMY_JWT_SECRET not configured');
        return res.status(500).json({ valid: false, error: 'Server misconfiguration.' });
    }

    const payload = verifyJWT(token, secret);
    if (!payload) {
        return res.status(401).json({
            valid: false,
            error: 'Session expired or invalid. Please re-login with your access password.'
        });
    }

    return res.status(200).json({
        valid: true,
        buyer: payload.buyer || 'Student',
        chapters: CHAPTERS
    });
}
