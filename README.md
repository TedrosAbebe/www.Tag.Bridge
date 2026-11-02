# 🚀 ታግ ብሪጅ — Tag Bridge Trading Ecosystem v2.0

Professional AI-powered trading education platform in Amharic.

## 🌐 Live Site
**https://www-tag-bridge.vercel.app**

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Live Dashboard** | Real-time crypto prices via CoinGecko API |
| 📈 **Live Charts** | TradingView interactive candlestick charts |
| 🎓 **Trading Academy** | 50+ lessons: Forex, Crypto, SMC, Risk, Psychology |
| 🧮 **9 Calculators** | Position Size, Risk%, Pip Value, Fibonacci, P&L, Compound & more |
| 📔 **Trading Journal** | Log trades, track P&L, Win Rate, R:R stats |
| 🤖 **AI Bot** | Gemini-powered trading assistant in Amharic |
| 📝 **Trading Quiz** | 35+ questions on Forex & Crypto |
| 🌓 **Dark/Light Mode** | Premium theme toggle |
| 🌐 **Bilingual** | Amharic / English toggle |
| 📱 **PWA** | Installable, offline-capable |

## 🆓 Free APIs Used

- **CoinGecko API** — Real-time crypto prices (no API key required for basic use)
- **Alternative.me** — Fear & Greed Index
- **TradingView Widgets** — Free charting library
- **Gemini AI (via Vercel)** — Free tier AI responses

## ⚙️ Deployment

### Vercel (Recommended)

1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set environment variable: `GEMINI_API_KEY = your_key_here`
4. Click **Deploy**

### Environment Variables Required
```
GEMINI_API_KEY=AIza...your_gemini_api_key
```

Get your free Gemini API key at: https://aistudio.google.com/apikey

### Local Development
```bash
npx serve .
# Visit http://localhost:3000
```

## 📁 File Structure

```
tagbridge/
├── index.html          # Main page (all sections)
├── dashboard.css       # New premium design system
├── styles.css          # Compatibility layer
├── dashboard.js        # Market data, calculators, journal, charts
├── script.js           # Quiz + Telegram bot (preserved)
├── api/
│   └── chat.js         # Vercel serverless Gemini proxy
├── sw.js               # Service worker (PWA)
├── manifest.json       # PWA manifest
├── vercel.json         # Vercel config + security headers
└── offline.html        # Offline fallback
```

## ⚠️ Disclaimer

This platform is for **educational purposes only**. Nothing here constitutes financial or investment advice. Always do your own research (DYOR) before trading.

---
*Built with ❤️ for the Amharic-speaking trading community*
