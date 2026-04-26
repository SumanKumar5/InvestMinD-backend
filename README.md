<div align="center">

# InvestMinD — Backend API

### Node.js + Express + MongoDB REST API powering the InvestMinD investment tracker

[![Live API](https://img.shields.io/badge/🌐%20Live%20App-investmind.live-brightgreen?style=for-the-badge)](https://www.investmind.live)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/Deployed-DigitalOcean-0080FF?style=flat-square&logo=digitalocean&logoColor=white)
![LLaMA](https://img.shields.io/badge/AI-LLaMA%203.3%2070B-8A2BE2?style=flat-square&logo=meta&logoColor=white)
![NVIDIA NIM](https://img.shields.io/badge/Inference-NVIDIA%20NIM-76B900?style=flat-square&logo=nvidia&logoColor=white)

</div>

---

## Overview

This is the backend for **InvestMinD** - a full-stack AI-powered investment portfolio tracker. It handles authentication, portfolio and holdings management, real-time price fetching, analytics, Excel exports, and AI-generated financial insights powered by **Meta LLaMA 3.3 70B** via NVIDIA NIM.

> Frontend repo: [SumanKumar5/InvestMinD](https://github.com/SumanKumar5/InvestMinD)

---

## Features

| Feature          | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| **Auth**         | JWT-based login/signup with OTP email verification             |
| **Portfolios**   | Create and manage multiple investment portfolios               |
| **Holdings**     | Add/delete stock & crypto holdings with P&L tracking           |
| **Transactions** | Full buy/sell transaction history per holding                  |
| **Analytics**    | CAGR, profit/loss %, asset distribution, time-series snapshots |
| **AI Insights**  | LLaMA 3.3 70B powered summaries per stock or full portfolio    |
| **Live Prices**  | Real-time stock & crypto prices via Twelve Data API            |
| **Exports**      | Download holdings as formatted `.xlsx` Excel reports           |
| **Docker**       | Fully containerized for production deployment                  |

---

## Tech Stack

| Layer          | Tech                                     |
| -------------- | ---------------------------------------- |
| **Runtime**    | Node.js 18.x                             |
| **Framework**  | Express.js 5.x                           |
| **Database**   | MongoDB Atlas + Mongoose                 |
| **Auth**       | JWT + OTP via Nodemailer                 |
| **AI**         | NVIDIA NIM — Meta LLaMA 3.3 70B Instruct |
| **Prices**     | Twelve Data API                          |
| **Deployment** | DigitalOcean App Platform + Docker       |

---

## API Reference

All endpoints are prefixed with `/api`.

<details>
<summary><strong> Auth</strong></summary>

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| `POST` | `/auth/signup`       | Register + send OTP         |
| `POST` | `/auth/login`        | Login with email & password |
| `POST` | `/auth/verify-email` | Verify OTP                  |
| `POST` | `/auth/resend-otp`   | Resend verification OTP     |
| `GET`  | `/auth/me`           | Get logged-in user info     |

</details>

<details>
<summary><strong> Portfolios</strong></summary>

| Method   | Endpoint                      | Description                    |
| -------- | ----------------------------- | ------------------------------ |
| `GET`    | `/portfolios`                 | Get all portfolios             |
| `POST`   | `/portfolios`                 | Create new portfolio           |
| `DELETE` | `/portfolios/:id`             | Delete a portfolio             |
| `GET`    | `/portfolios/:id/stats`       | Portfolio summary (P/L, total) |
| `GET`    | `/portfolios/:id/analytics`   | CAGR + current stats           |
| `GET`    | `/portfolios/:id/stocks`      | Asset-wise distribution        |
| `GET`    | `/portfolios/:id/best-worst`  | Best/worst performers          |
| `GET`    | `/portfolios/:id/performance` | Time-series performance data   |

</details>

<details>
<summary><strong> Holdings</strong></summary>

| Method   | Endpoint                   | Description                       |
| -------- | -------------------------- | --------------------------------- |
| `POST`   | `/portfolios/:id/holdings` | Add a holding                     |
| `GET`    | `/portfolios/:id/holdings` | Get holdings for a portfolio      |
| `GET`    | `/portfolios/:id/summary`  | Enriched summary with live prices |
| `GET`    | `/holdings/:id`            | Single holding info               |
| `DELETE` | `/holdings/:id`            | Delete a holding                  |

</details>

<details>
<summary><strong> Transactions</strong></summary>

| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| `GET`  | `/transactions/holdings/:id` | Get transaction history |

</details>

<details>
<summary><strong> Prices</strong></summary>

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| `GET`  | `/prices/price/:symbol` | Live stock/crypto price |

</details>

<details>
<summary><strong> Exports</strong></summary>

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| `GET`  | `/exports/portfolios/:id` | Export holdings to Excel |

</details>

<details>
<summary><strong> AI Insights</strong></summary>

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| `GET`  | `/insight`                         | Insight for all portfolios       |
| `GET`  | `/insight/:portfolioId`            | Insight for a specific portfolio |
| `GET`  | `/ai/insight/:portfolioId/:symbol` | Insight for a single asset       |

Powered by **Meta LLaMA 3.3 70B Instruct** via [NVIDIA NIM](https://build.nvidia.com/models).

</details>

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- NVIDIA NIM API key → [build.nvidia.com/models](https://build.nvidia.com/models)
- Twelve Data API key → [twelvedata.com](https://twelvedata.com)

### Install & Run

```bash
git clone https://github.com/SumanKumar5/InvestMinD-backend.git
cd InvestMinD-backend
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

### Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NVIDIA_API_KEY=your_nvidia_nim_key
TWELVE_API_KEY=your_twelve_data_key
```

---

## Docker

```bash
docker build -t investmind-api .
docker run -p 5000:5000 investmind-api
```

---

## License

MIT © [Suman Kumar](https://github.com/SumanKumar5)

---

## Related

- **Frontend** → [SumanKumar5/InvestMinD](https://github.com/SumanKumar5/InvestMinD)
- **Live App** → [investmind.live](https://www.investmind.live)
