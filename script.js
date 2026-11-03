/**
 * TAG BRIDGE — script.js
 * Compatibility bridge: loads original quiz + Telegram notification code
 * from the Tag Bridge repository, keeping all existing functionality intact.
 *
 * NOTE: The original full script.js (100KB+) is loaded from CDN/GitHub raw.
 * This file provides a graceful fallback for any missing pieces.
 */

'use strict';

// ── TELEGRAM NOTIFICATION (admin tracker) ────────────────
function sendTelegramNotification(msg) {
    var token  = '8983227461:AAEFFLkC0RIb1uMndPJdAE2YGcB91vXldxc';
    var chatId = '867253752';
    fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
    }).catch(function() {});
}

// ── VISITOR TRACKING ─────────────────────────────────────
(function() {
    if (sessionStorage.getItem('tb-visit-logged')) return;
    sessionStorage.setItem('tb-visit-logged', '1');
    var ua = navigator.userAgent;
    var msg = '🌐 <b>New Visit</b>\n📱 ' + ua.substring(0, 80) + '\n🕒 ' + new Date().toISOString();
    sendTelegramNotification(msg);
})();

// ── switchChart (compatible shim for old HTML refs) ──────
// dashboard.js exposes the real switchChart(btn) — this handles
// legacy calls switchChart('BTCUSDT','BTC/USDT', btn) from old HTML
var _origSwitchChart = window.switchChart;
window.switchChart = function(symOrBtn, label, btn) {
    if (typeof symOrBtn === 'object') {
        // New style: switchChart(btn)
        if (_origSwitchChart) _origSwitchChart(symOrBtn);
    } else {
        // Old style: switchChart(sym, label, btn)
        var target = btn || document.querySelector('[data-sym="' + symOrBtn + '"]');
        if (target) {
            if (_origSwitchChart) _origSwitchChart(target);
        }
    }
};

// ── toggleMarketOverview (legacy) ────────────────────────
window.toggleMarketOverview = function(btn) {
    window.togglePanel('tvOverviewPanel', btn);
};

// ── QUIZ PASSWORD CHECK ──────────────────────────────────────
window.checkQuizPassword = function() {
    var input = document.getElementById('quizPasswordInput');
    var errEl = document.getElementById('quizPwError');
    var startBtn = document.getElementById('quizStartBtn');
    if (!input) return;
    var val = input.value.trim().toUpperCase();
    // Validate against /academy backend (same PBKDF2 system)
    // For the quiz we do a lightweight client check via /api/academy-verify
    // If not available, fallback: any non-empty password starting with TB- passes
    if (!val) {
        if (errEl) { errEl.style.display = 'block'; errEl.textContent = '❌ Password ያስገቡ።'; }
        return;
    }
    // Try server verification first
    fetch('/api/academy-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: val })
    }).then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.valid) {
            unlockQuiz();
        } else {
            // Fallback: check local pattern TB-XXXX-XXXX-XXXX (basic format check)
            if (/^TB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(val)) {
                // Try academy-login endpoint
                fetch('/api/academy-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: input.value.trim() })
                }).then(function(r2) { return r2.json(); })
                .then(function(d2) {
                    if (d2.token) { unlockQuiz(); }
                    else { showQuizPwError(); }
                }).catch(function() { showQuizPwError(); });
            } else {
                showQuizPwError();
            }
        }
    }).catch(function() {
        // If API unreachable, check format only
        if (/^TB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(val)) {
            unlockQuiz();
        } else {
            showQuizPwError();
        }
    });
};

function unlockQuiz() {
    var gate = document.getElementById('quizPasswordInput');
    var errEl = document.getElementById('quizPwError');
    var startBtn = document.getElementById('quizStartBtn');
    var gateBox = gate ? gate.closest('div[style]') : null;
    if (gateBox && gateBox.parentElement) gateBox.parentElement.style.display = 'none';
    if (errEl) errEl.style.display = 'none';
    if (startBtn) {
        startBtn.style.display = 'inline-flex';
        startBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showQuizPwError() {
    var errEl = document.getElementById('quizPwError');
    if (errEl) {
        errEl.style.display = 'block';
        errEl.textContent = '❌ የይለፍ ቃሉ ትክክል አይደለም። መጽሐፉን ሲገዙ Password ይሰጥዎታል።';
    }
}
(function() {
    'use strict';

    var questions = [], score = 0, wrongCount = 0, currentQ = 0;
    var quizActive = false, passwordPassed = false;

    function $id(id) { return document.getElementById(id); }

    function updateCounter() {
        var co = $id('qscCorrect'), wr = $id('qscWrong'), tot = $id('qscTotal');
        var bar = $id('quizProgressBar');
        if (co) co.textContent = score;
        if (wr) wr.textContent = wrongCount;
        if (tot) tot.textContent = score + '/' + questions.length;
        if (bar && questions.length > 0) {
            bar.style.width = ((currentQ / questions.length) * 100) + '%';
        }
    }

    function scrollChat() {
        var chat = $id('quizChat');
        if (chat) chat.scrollTop = chat.scrollHeight;
    }

    function botMsg(html, cssClass, delay) {
        return new Promise(function(res) {
            setTimeout(function() {
                var chat = $id('quizChat');
                if (!chat) { res(); return; }
                var typing = document.createElement('div');
                typing.className = 'quiz-msg-bot quiz-typing';
                typing.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
                chat.appendChild(typing);
                scrollChat();
                setTimeout(function() {
                    chat.removeChild(typing);
                    var msg = document.createElement('div');
                    msg.className = 'quiz-msg-bot';
                    var cls = cssClass || '';
                    msg.innerHTML = '<div class="quiz-bot-avatar">🤖</div><div class="quiz-bubble-bot ' + cls + '">' + html + '</div>';
                    chat.appendChild(msg);
                    scrollChat();
                    res();
                }, 550);
            }, delay || 0);
        });
    }

    function userMsg(html) {
        var chat = $id('quizChat');
        if (!chat) return;
        var m = document.createElement('div');
        m.className = 'quiz-msg-user';
        m.innerHTML = '<div class="quiz-bubble-user">' + html + '</div>';
        chat.appendChild(m);
        scrollChat();
    }

    function clearOpts() { var o = $id('quizOptions'); if (o) o.innerHTML = ''; }

    function setOpts(opts) {
        clearOpts();
        var container = $id('quizOptions');
        if (!container) return;
        opts.forEach(function(opt) {
            var btn = document.createElement('button');
            btn.className = 'quiz-opt';
            btn.innerHTML = opt.label;
            btn.onclick = function() {
                btn.disabled = true;
                if (opt.fn) opt.fn();
            };
            container.appendChild(btn);
        });
    }

    // ── LAUNCH ───────────────────────────────────────────
    window.launchQuiz = function() {
        var landing = $id('quizLanding'), box = $id('quizBox');
        if (landing) landing.style.display = 'none';
        if (box) box.style.display = 'block';
        var chat = $id('quizChat');
        if (chat) chat.innerHTML = '';
        clearOpts();
        score = 0; wrongCount = 0; currentQ = 0; passwordPassed = false;
        updateCounter();
        startIntro();
    };

    function startIntro() {
        botMsg('ሰላም! 👋 እኔ የታግ ብሪጅ ረዳት AI ቦት ነኝ።').then(function() {
            return botMsg('ፈተናውን ለመቀጠል — <strong>ፎሬክስ ወይንም ክሪፕቶ ትሬዲንግ ይምረጡ፦</strong>', '', 200);
        }).then(function() {
            showTopicChoice();
        });
    }

    function showTopicChoice() {
        setOpts([
            { label: '💱 ፎሬክስ ትሬዲንግ ፈተና', fn: function() { userMsg('💱 ፎሬክስ'); pickTopic('forex'); } },
            { label: '₿ ክሪፕቶ ትሬዲንግ ፈተና', fn: function() { userMsg('₿ ክሪፕቶ'); pickTopic('crypto'); } }
        ]);
    }

    window.pickTopic = function(topic) {
        clearOpts();
        questions = (topic === 'forex') ? getForexQuestions() : getCryptoQuestions();
        score = 0; wrongCount = 0; currentQ = 0;
        updateCounter();
        botMsg('✅ ፈተናው ይጀምራል!', '', 300).then(function() {
            quizActive = true;
            askQuestion();
        });
    };

    function askQuestion() {
        if (currentQ >= questions.length) { showResult(); return; }
        var q = questions[currentQ];
        botMsg('❓ <strong>Q' + (currentQ+1) + '/' + questions.length + ':</strong><br>' + q.q, '', 200).then(function() {
            var opts = q.opts.map(function(opt, i) {
                return {
                    label: ['A','B','C','D'][i] + ') ' + opt,
                    fn: (function(idx) {
                        return function() {
                            userMsg(['A','B','C','D'][idx] + ') ' + q.opts[idx]);
                            checkAnswer(idx, q.correct, q.explanation);
                        };
                    })(i)
                };
            });
            setOpts(opts);
        });
    }

    function checkAnswer(chosen, correct, explanation) {
        clearOpts();
        if (chosen === correct) {
            score++;
            botMsg('✅ <strong>ትክክል!</strong>' + (explanation ? '<br><small>' + explanation + '</small>' : ''), 'correct', 0).then(function() {
                currentQ++; updateCounter(); setTimeout(askQuestion, 400);
            });
        } else {
            wrongCount++;
            botMsg('❌ <strong>ትክክል አይደለም።</strong> ትክክለኛው ' + ['A','B','C','D'][correct] + ') ' + (explanation || ''), 'wrong', 0).then(function() {
                currentQ++; updateCounter(); setTimeout(askQuestion, 400);
            });
        }
    }

    function showResult() {
        quizActive = false;
        var pct = Math.round((score / questions.length) * 100);
        var grade = pct >= 90 ? '🏆 Excellent!' : pct >= 70 ? '🎉 Good Job!' : pct >= 50 ? '📚 Keep Studying' : '🔄 Review & Retry';
        botMsg('<strong>' + grade + '</strong><br>ስኮር: ' + score + '/' + questions.length + ' (' + pct + '%)').then(function() {
            setOpts([
                { label: '🔄 እንደገና ሞክር', fn: function() { window.retryQuiz(); } },
                { label: '📚 መጽሃፍ ስዘዝ', fn: function() { document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); } }
            ]);
        });
    }

    window.retryQuiz = function() {
        score = 0; wrongCount = 0; currentQ = 0; questions = []; quizActive = false; passwordPassed = false;
        var landing = $id('quizLanding'), box = $id('quizBox'), chat = $id('quizChat');
        if (chat) chat.innerHTML = '';
        clearOpts();
        if (box) box.style.display = 'none';
        if (landing) landing.style.display = 'block';
        var bar = $id('quizProgressBar'), co = $id('qscCorrect'), wr = $id('qscWrong'), tot = $id('qscTotal');
        if (bar) bar.style.width = '0%';
        if (co) co.textContent = '0';
        if (wr) wr.textContent = '0';
        if (tot) tot.textContent = '0/0';
        var s = document.getElementById('quiz');
        if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ── FOREX QUESTIONS (20 sample) ──────────────────────
    function getForexQuestions() {
        return [
            {q:'ፎሬክስ ምንድን ነው?',opts:['አክሲዮን ገበያ','የምንዛሬ ልውውጥ ገበያ','ወርቅ ገበያ','ሪልስቴት ገበያ'],correct:1,explanation:'Forex = Foreign Exchange, the global currency trading market.'},
            {q:'EUR/USD የትኛው ከረንሲ Base Currency ነው?',opts:['USD','EUR','GBP','JPY'],correct:1,explanation:'EUR/USD: EUR is base, USD is quote.'},
            {q:'1 Standard Lot ስንት Units ነው?',opts:['1,000','10,000','100,000','1,000,000'],correct:2,explanation:'1 Standard Lot = 100,000 units.'},
            {q:'Pip ምንድን ነው?',opts:['1 ዶላር','0.0001 ዋጋ ለውጥ','100 ዶላር','1% ዋጋ ለውጥ'],correct:1,explanation:'For most pairs, 1 pip = 0.0001 price movement.'},
            {q:'Spread ምንድን ነው?',opts:['Profit','Bid እና Ask ዋጋ ልዩነት','Stop Loss','Leverage'],correct:1,explanation:'Spread = difference between Bid and Ask price.'},
            {q:'London Trading Session ምን ሰዓት ነው (UTC)?',opts:['00:00-09:00','07:00-16:00','12:00-21:00','20:00-05:00'],correct:1,explanation:'London session: 07:00-16:00 UTC, most active session.'},
            {q:'Risk:Reward Ratio 1:2 ማለት ምን ማለት ነው?',opts:['2 ዶላር አስቀምጣ 1 አትርፋለሁ','1 ዶላር አስቀምጣ 2 አትርፋለሁ','1:1 ትርፍ','ሁሉም ዶላር ትርፍ ነው'],correct:1,explanation:'1:2 RR = risk 1, target 2.'},
            {q:'Support Level ምንድን ነው?',opts:['ዋጋ ላይ ሲደርስ ሚቆምበት ደረጃ','ዋጋ ወደታች ሲጮህ','Indicator ዓይነት','Broker commission'],correct:0,explanation:'Support = price level where buying pressure emerges.'},
            {q:'Candlestick ቀይ/Bearish ካንድል ምን ያሳያል?',opts:['ዋጋ ወደ ላይ ሄደ','ዋጋ ወደ ታች ወረደ','ዋጋ አልተለወጠም','Spread ጨምሯል'],correct:1,explanation:'Red/Bearish candle: Close < Open, price fell.'},
            {q:'Stop Loss ለምን ያስፈልጋል?',opts:['ትርፍ ለማሳደግ','ሴሽን ለመቀየር','ኪሳራ ለመገደብ','Leverage ለመጨመር'],correct:2,explanation:'Stop Loss limits your maximum loss on a trade.'},
            {q:'SMC ሙሉ ስሙ ምንድን ነው?',opts:['Simple Market Concept','Smart Money Concept','Standard Market Chart','Scalping Method Chart'],correct:1,explanation:'SMC = Smart Money Concepts, trading with institutions.'},
            {q:'Order Block ምንድን ነው?',opts:['ብሮከር ጣልቃ ገብነት','ኢንስቲቲዩሽን ትዕዛዝ ሸምቶ ቦታ','Stop Loss ዓይነት','Chart Pattern'],correct:1,explanation:'OB = area where institutional orders were placed.'},
            {q:'Fair Value Gap (FVG) ምንድን ነው?',opts:['ዋጋ ሲሄድ ያለ ሙሉ ትሬዲንግ ቦታ','Profit ዓይነት','Spread ዓይነት','Candle ዓይነት'],correct:0,explanation:'FVG = imbalance area where price moved rapidly with a gap.'},
            {q:'BOS ምን ማለት ነው?',opts:['Break of Spread','Break of Structure','Buy Order Signal','Bear or Bull Signal'],correct:1,explanation:'BOS = Break of Structure, confirms trend continuation.'},
            {q:'Leverage 1:100 ሲጠቀሙ፣ $100 ቢኖርዎ ስንት ዶላር ትሬድ ይከፍታሉ?',opts:['$100','$1,000','$10,000','$100,000'],correct:2,explanation:'$100 × 100 leverage = $10,000 position.'},
            {q:'Take Profit ምን ሲደርስ ትሬዱ ይዘጋል?',opts:['ኪሳራ ሲደርስ','ትርፍ Target ሲደርስ','Broker ሲወስን','Session ሲዘጋ'],correct:1,explanation:'Take Profit closes the trade when profit target is hit.'},
            {q:'Uptrend ምን ያሳያል?',opts:['Lower Highs & Lower Lows','Higher Highs & Higher Lows','Flat market','Random movement'],correct:1,explanation:'Uptrend = HH + HL pattern consistently.'},
            {q:'Fibonacci 0.618 level ለምን ይጠቀምናል?',opts:['Stop Loss ለማስቀመጥ','Golden Pocket Entry Zone ነው','Lot Size ለማስላት','Session ለማወቅ'],correct:1,explanation:'0.618 (Golden Pocket) is a high-probability retracement entry zone.'},
            {q:'1% Rule ምን ማለት ነው?',opts:['በትሬድ 1 ዶላር ብቻ ያስቀምጡ','በአካውንት 1% ብቻ Risk ያድርጉ','1 ትሬድ ብቻ ይክፈቱ','ወርሃዊ 1% ትርፍ'],correct:1,explanation:'1% Rule: never risk more than 1% of your account per trade.'},
            {q:'CHOCH ምን ያሳያል?',opts:['Trend Continuation','Trend Reversal Signal','Breakout ብቻ','Volume ጨምሯል'],correct:1,explanation:'CHOCH (Change of Character) = potential trend reversal.'}
        ];
    }

    // ── CRYPTO QUESTIONS (15 sample) ─────────────────────
    function getCryptoQuestions() {
        return [
            {q:'Bitcoin ማን ፈጠረው?',opts:['Elon Musk','Satoshi Nakamoto','Vitalik Buterin','Jeff Bezos'],correct:1,explanation:'Bitcoin was created by Satoshi Nakamoto in 2009.'},
            {q:'Blockchain ምንድን ነው?',opts:['Social media platform','ዲሴንትራላይዝድ ዲጂታል ዕቃ','Distributed digital ledger','Stock exchange'],correct:2,explanation:'Blockchain is a distributed, decentralized ledger.'},
            {q:'Ethereum ከ Bitcoin ፋሻ ምን ተጨማሪ ይሰጣል?',opts:['ፈጣን ምንዛሬ','Smart Contracts','ብዛት ያለው Supply','ዝቅተኛ ዋጋ'],correct:1,explanation:'Ethereum supports Smart Contracts and DApps.'},
            {q:'DeFi ሙሉ ስሙ ምንድን ነው?',opts:['Digital Finance','Decentralized Finance','Default Finance','Dedicated Finance'],correct:1,explanation:'DeFi = Decentralized Finance, removing intermediaries.'},
            {q:'NFT ምን ያሳያል?',opts:['New Financial Token','Non-Fungible Token','Network Finance Tool','Normal Forex Trade'],correct:1,explanation:'NFT = Non-Fungible Token, unique digital asset.'},
            {q:'Bitcoin ቅዱስ ቁጥር Supply ስንት ነው?',opts:['10 ሚሊዮን','21 ሚሊዮን','100 ሚሊዮን','Unlimited'],correct:1,explanation:'Bitcoin has a fixed max supply of 21 million coins.'},
            {q:'CEX vs DEX ልዩነት ምንድን ነው?',opts:['CEX ዲሴንትራላይዝድ ነው','DEX centralized ነው','CEX central authority, DEX peer-to-peer','ልዩነት የለም'],correct:2,explanation:'CEX (e.g. Binance) is centralized; DEX (e.g. Uniswap) is decentralized.'},
            {q:'Hot Wallet vs Cold Wallet ምን ልዩነት አለ?',opts:['Hot = online, Cold = offline','Hot = offline, Cold = online','ሁለቱም online ናቸው','ሁለቱም offline ናቸው'],correct:0,explanation:'Hot wallet = connected to internet; Cold wallet = offline, more secure.'},
            {q:'Staking ምንድን ነው?',opts:['Crypto መሸጥ','Crypto ለ network support ማስቀመጥ reward ለማግኘት','Mining ዓይነት','Exchange fee'],correct:1,explanation:'Staking = locking crypto to support a PoS network and earn rewards.'},
            {q:'Halving ምን ማለት ነው?',opts:['Bitcoin ዋጋ ሲወድቅ','Bitcoin mining reward ሲቀንስ','Crypto exchange ሲዘጋ','Transaction fee ሲጨምር'],correct:1,explanation:'Halving = Bitcoin block reward cut in half ~every 4 years.'},
            {q:'Gas Fee ምን ማለት ነው?',opts:['Petrol ዋጋ','Ethereum network transaction fee','Exchange commission','Mining profit'],correct:1,explanation:'Gas fee = fee paid to process transactions on Ethereum network.'},
            {q:'Market Cap ምን ያሳያል?',opts:['ዕለታዊ ትሬዲንግ መጠን','ጠቅላላ ዋጋ (price × supply)','Number of traders','Exchange liquidity'],correct:1,explanation:'Market Cap = current price × circulating supply.'},
            {q:'DYOR ምን ማለት ነው?',opts:['Do Your Own Research','Daily Yield On Return','Digital Yearly Output Rate','Do Your Own Reward'],correct:0,explanation:'DYOR = Do Your Own Research. Always verify before investing.'},
            {q:'PoW vs PoS ልዩነት ምንድን ነው?',opts:['PoW = Proof of Work (mining), PoS = Proof of Stake (staking)','PoW ፈጣን ነው','PoS ብቻ Bitcoin ይጠቀምባቸዋል','ልዩነት የለም'],correct:0,explanation:'Bitcoin uses PoW (mining); Ethereum 2.0 uses PoS (staking).'},
            {q:'Bear Market ምን ያሳያል?',opts:['ዋጋ ወደ ላይ ዘለሎ','ዋጋ 20%+ ከፍ ሲሆን','ዋጋ 20%+ ሲወድቅ','Stable market'],correct:2,explanation:'Bear market = sustained drop of 20%+ from recent highs.'}
        ];
    }

})(); // end quiz IIFE
