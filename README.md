# InvestMinD Backend 🧠📊

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-blue)](https://jwt.io/)
[![Deployed on DigitalOcean](https://img.shields.io/badge/Deployment-DigitalOcean-blue?logo=digitalocean)](https://www.digitalocean.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **InvestMinD** is a smart personal investment tracker backend built with Node.js, Express, and MongoDB. It supports AI-powered insights, live market data, portfolio analytics, and Excel export functionality.

---

## 🚀 Features

- 🔐 **User Authentication** with secure JWT login/signup
- 📁 **Portfolio & Holdings Management**
- 🧮 **Auto-recalculated average buy price** on transactions
- 📈 **Live stock price fetch** via Twelve Data API
- 📊 **Profit/Loss %, CAGR, Sector breakdown**
- 🧠 **Gemini AI-powered investment insight summaries**
- 📥 **Excel (.xlsx) export** with clean formatting
- ⚙️ Built for **Docker deployment on DigitalOcean App Platform**

---

## 🛠️ Tech Stack

| Layer       | Stack |
|-------------|-------|
| Backend     | Node.js, Express.js |
| Database    | MongoDB Atlas |
| Auth        | JWT, bcrypt |
| AI Services | Gemini API (Google) |
| Market Data | Twelve Data API |
| Export      | ExcelJS |
| Deployment  | Docker + DigitalOcean App Platform |

---

## 📁 Folder Structure

```
/investmind-backend
├── /controllers
├── /models
├── /routes
├── /middleware
├── /utils
├── Dockerfile
├── .dockerignore
├── .env (excluded)
├── index.js
└── package.json
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

## 🚀 Deployment Notes

- Designed for **DigitalOcean App Platform** with Dockerfile
- Exposes app on port `5000`
- All sensitive keys should be added in App Platform’s environment section

---

## 📜 License

MIT © [Suman Kumar](https://github.com/SumanKumar5)

---

## 🤝 Connect

> Built as a professional capstone project with full-stack scalability in mind.