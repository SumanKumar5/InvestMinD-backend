# InvestMinD Backend 🧠📊

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-blue)](https://jwt.io/)
[![Deployed on DigitalOcean](https://img.shields.io/badge/Deployment-DigitalOcean-blue?logo=digitalocean)](https://www.digitalocean.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **InvestMinD** is a smart personal investment tracker backend built with Node.js, Express, and MongoDB. It supports AI-powered insights, live market data, performance tracking, and Excel export functionality.

---

## 🚀 Features

- 🔐 **User Authentication** with secure JWT login/signup
- 📁 **Portfolio & Holdings Management** with CRUD endpoints
- 🔄 **Auto-recalculated average buy price** on each transaction
- 📈 **Live market data fetch** via Twelve Data API (with in-memory caching)
- 🧠 **Gemini AI-powered insights** per stock and portfolio
- 📊 **Analytics**:
  - Total Investment, Current Value, Profit/Loss %
  - **CAGR (Compound Annual Growth Rate)**
  - **Best/Worst Performer** analysis
  - **Holdings Distribution** (Pie/Donut chart data)
- 🕒 **Time-Series Portfolio Performance** via scheduled snapshot job
- 📅 **Excel (.xlsx) export** of holdings (clean formatting)
- 🔐 All routes secured with **JWT middleware**
- ⚙️ Ready for **Docker deployment** on DigitalOcean App Platform

---

## 🛠️ Tech Stack

| Layer       | Stack |
|-------------|-------|
| Backend     | Node.js, Express.js |
| Database    | MongoDB Atlas |
| Auth        | JWT, bcrypt |
| AI Services | Gemini API (Google) |
| Market Data | Twelve Data API |
| Scheduling  | node-cron |
| Export      | ExcelJS |
| Deployment  | Docker + DigitalOcean App Platform |

---

## 📁 Folder Structure

```
/investmind-backend
🔹 /controllers
🔹 /models
🔹 /routes
🔹 /middleware
🔹 /utils
🔹 /jobs          # Scheduled snapshot logic
🔹 Dockerfile
🔹 .dockerignore
🔹 .env (excluded)
🔹 index.js
🔹 package.json
```

---

## 📄 .env Example

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
TWELVE_API_KEY=your_twelvedata_api_key
```

> ⚠️ Do not commit this file. It should be added to `.gitignore`.

---

## 📈 Snapshot & Performance Monitoring

- A scheduled `node-cron` job takes hourly portfolio snapshots.
- Historical values are stored in MongoDB via `/models/Snapshot.js`.
- Frontend can call:
  ```http
  GET /api/portfolios/:id/performance?range=24h|7d|30d|all
  ```
  to generate portfolio time-series performance charts.

---

## 📊 Advanced Analytics APIs

| Endpoint | Description |
|----------|-------------|
| `GET /api/portfolios/:id/analytics` | Summary stats: investment, P/L %, CAGR |
| `GET /api/portfolios/:id/stocks`    | Stock-wise distribution for donut chart |
| `GET /api/analytics/:id/best-worst` | Best & worst performer based on gain % |
| `GET /api/portfolios/:id/performance?range=...` | Time-series portfolio value chart |

---

## 🚀 Deployment Notes

- Built for **DigitalOcean App Platform** (Docker)
- Dockerfile auto-exposes on `PORT=5000`
- Store API keys in DigitalOcean’s env var settings
- GitHub Actions / CI support ready (optional)

---

## 📜 License

MIT © [Suman Kumar](https://github.com/SumanKumar5)

---

## 🤝 Connect

> This backend powers a full-stack professional investment dashboard. Designed for performance, scalability, and real-world use cases.
