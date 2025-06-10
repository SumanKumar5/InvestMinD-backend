# InvestMinD – Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-blue)](https://jwt.io/)
[![Deployed on DigitalOcean](https://img.shields.io/badge/Deployment-DigitalOcean-blue?logo=digitalocean)](https://www.digitalocean.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **InvestMinD** is a full-stack investment portfolio tracker that helps users manage stock/crypto holdings, analyze returns, and gain AI-powered financial insights. This repository contains the **Node.js + Express + MongoDB** backend for the application.

---

## 🚀 Features

- 🔐 JWT-based authentication with email verification (OTP)
- 📁 Create & manage multiple investment portfolios
- 💼 Add/edit/delete stock and crypto holdings
- 📊 Real-time analytics: CAGR, profit/loss %, asset distribution
- 📈 Time-series snapshots of portfolio performance
- 🧠 AI Insights powered by Gemini (Google)
- 📤 Export holdings to Excel (.xlsx)
- ⚡ Live price fetch from Twelve Data API
- 🧪 Secure endpoints with middleware & validations
- 🐳 Docker-ready for production deployment

---

## 📚 API Documentation

All APIs are prefixed with `/api`.

### 🔐 Auth

| Method | Endpoint         | Description                      |
|--------|------------------|----------------------------------|
| POST   | `/auth/signup`   | Register + send OTP              |
| POST   | `/auth/login`    | Login with email & password      |
| POST   | `/auth/verify-email` | Verify OTP                 |
| POST   | `/auth/resend-otp`   | Resend verification OTP     |
| GET    | `/auth/me`       | Get logged-in user info          |

### 📁 Portfolios

| Method | Endpoint                        | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | `/portfolios`                   | Get all portfolios               |
| POST   | `/portfolios`                   | Create new portfolio             |
| DELETE | `/portfolios/:id`               | Delete a portfolio               |
| GET    | `/portfolios/:id/stats`         | Portfolio summary (P/L, total)   |
| GET    | `/portfolios/:id/analytics`     | CAGR + current stats             |
| GET    | `/portfolios/:id/stocks`        | Asset-wise distribution          |
| GET    | `/portfolios/:id/best-worst`    | Best/worst performers            |
| GET    | `/portfolios/:id/performance`   | Time-series performance data     |

### 💼 Holdings

| Method | Endpoint                            | Description                          |
|--------|--------------------------------------|--------------------------------------|
| POST   | `/portfolios/:id/holdings`           | Add a holding (buy/sell logic)       |
| GET    | `/portfolios/:id/holdings`           | Get holdings for a portfolio         |
| GET    | `/portfolios/:id/summary`            | Enriched summary (live prices)       |
| GET    | `/holdings/:id`                      | Single holding info                  |
| DELETE | `/holdings/:id`                      | Delete a holding                     |

### 🔁 Transactions

| Method | Endpoint                        | Description                     |
|--------|----------------------------------|---------------------------------|
| GET    | `/transactions/holdings/:id`    | Get transaction history         |

### 📉 Prices

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/prices/price/:symbol`| Live stock/crypto price        |

### 📤 Exports

| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | `/exports/portfolios/:id`     | Export holdings to Excel     |

### 🤖 AI Insights

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/insight`                              | Insight for all portfolios         |
| GET    | `/insight/:portfolioId`                 | Insight for a single portfolio     |
| GET    | `/ai/insight/:portfolioId/:symbol`      | Insight for one asset              |

---

## 🛠️ Tech Stack

- **Node.js + Express** – REST API backend
- **MongoDB + Mongoose** – NoSQL data modeling
- **JWT** – Auth tokens
- **Nodemailer** – OTP verification
- **Twelve Data API** – Real-time prices
- **Gemini API** – AI-generated investment insights
- **Docker** – Containerized deployment

---

## 🧪 Setup & Run Locally

```bash
# Clone the repo
git clone https://github.com/SumanKumar5/InvestMinD-backend.git
cd investmind-backend

# Install dependencies
npm install

# Add environment variables
cp .env.example .env
# Then edit .env with your keys

# Start the server
npm start
```

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
GEMINI_API_KEY=your_google_gemini_key
TWELVE_API_KEY=your_twelve_data_key
```

---

## 🐳 Docker Support

```bash
docker build -t investmind-api .
docker run -p 5000:5000 investmind-api
```

---

## 📎 License

MIT © [[Suman Kumar](https://github.com/SumanKumar5)]

---

## 🤝 Connect

> This backend powers a full-stack professional investment dashboard. Designed for performance, scalability, and real-world use cases.
