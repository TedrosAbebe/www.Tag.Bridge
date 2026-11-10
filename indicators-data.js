/**
 * TAG BRIDGE — Indicators Data
 * This file provides the INDICATORS_DATA object used by the indicators panel.
 * Loaded before dashboard.js; all references in dashboard.js check
 * `if (!window.INDICATORS_DATA) return` so this is safely optional.
 */

window.INDICATORS_DATA = {
    trend: [
        { name: 'Moving Average (MA)', short: 'MA', desc: 'ዋጋው ከአማካይ ዋጋ በላይ ወይም በታች መሆኑን ያሳያል። Bullish = ከMA በላይ።', category: 'trend' },
        { name: 'Exponential MA (EMA)', short: 'EMA', desc: 'ቅርብ ዋጋዎችን የሚያጎላ MA። ፈጣን ምላሽ ይሰጣል።', category: 'trend' },
        { name: 'Bollinger Bands', short: 'BB', desc: 'ዋጋ ከBand ውጪ ሲወጣ reversal ሊኖር ይችላል።', category: 'trend' },
        { name: 'Ichimoku Cloud', short: 'ICH', desc: 'Support/Resistance፣ trend direction እና momentum ሁሉ ያሳያል።', category: 'trend' },
        { name: 'Parabolic SAR', short: 'SAR', desc: 'Dots ከዋጋ በታች = Bullish; ከዋጋ በላይ = Bearish።', category: 'trend' },
        { name: 'MACD', short: 'MACD', desc: 'ሁለት EMA ልዩነት። Signal line ሲሻገር entry ይሰጣል።', category: 'trend' },
        { name: 'ADX', short: 'ADX', desc: 'Trend strength ያሳያል። 25+ = ጠንካራ trend።', category: 'trend' },
        { name: 'Supertrend', short: 'ST', desc: 'ATR ላይ የተመሠረተ trend indicator። Buy/Sell signals ይሰጣል።', category: 'trend' }
    ],
    momentum: [
        { name: 'RSI (Relative Strength Index)', short: 'RSI', desc: '70+ = Overbought; 30- = Oversold። Reversal ምልክት ያሳያል።', category: 'momentum' },
        { name: 'Stochastic Oscillator', short: 'STO', desc: '80+ = Overbought; 20- = Oversold። %K/%D crossover ያሳያል።', category: 'momentum' },
        { name: 'CCI (Commodity Channel Index)', short: 'CCI', desc: '+100 ሲሻገር = Bullish; -100 ሲወርድ = Bearish።', category: 'momentum' },
        { name: 'Williams %R', short: 'WR', desc: 'Stochastic ጋር ተመሳሳይ። -20 በላይ = Overbought።', category: 'momentum' },
        { name: 'Momentum Indicator', short: 'MOM', desc: 'ዋጋ ለውጥ ፍጥነት ያሳያል። 0 ሲሻገር = signal።', category: 'momentum' }
    ],
    volume: [
        { name: 'Volume', short: 'VOL', desc: 'ምን ያህል ሰዎች ሸጡ/ገዙ። ከፍተኛ volume = ጠንካራ move።', category: 'volume' },
        { name: 'OBV (On-Balance Volume)', short: 'OBV', desc: 'Volume flow ያሳያል። ዋጋ ሳይለወጥ OBV ሲወጣ divergence ነው።', category: 'volume' },
        { name: 'VWAP', short: 'VWAP', desc: 'Volume-weighted average price። Institutional traders ይጠቀሙበታል።', category: 'volume' },
        { name: 'Accumulation/Distribution', short: 'AD', desc: 'Smart money buying/selling ያሳያል።', category: 'volume' }
    ],
    volatility: [
        { name: 'ATR (Average True Range)', short: 'ATR', desc: 'ዋጋ ምን ያህል እንደሚንቀሳቀስ ይነግራል። Stop-loss ለማስቀመጥ ይጠቅማል።', category: 'volatility' },
        { name: 'Standard Deviation', short: 'SD', desc: 'ዋጋ ከአማካዩ ምን ያህል እንደሚርቅ ያሳያል።', category: 'volatility' },
        { name: 'VIX (Volatility Index)', short: 'VIX', desc: 'Market fear index። 30+ = ከፍተኛ ፍርሃት = opportunity።', category: 'volatility' }
    ]
};
