# 📘 InvestMinD API Documentation

Base URL: `https://investmind-app-c7irq.ondigitalocean.app`

---

## 🔐 Auth

### POST /api/auth/signup
- Register a new user.
- **No Auth Required**

**Body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### POST /api/auth/login
- Login and get JWT token.
- **No Auth Required**

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### GET /api/auth/me
- Get logged-in user.
- **Auth Required**

**Header:**
`Authorization: Bearer <token>`

---

## 📁 Portfolios

### POST /api/portfolios
- Create a new portfolio.
- **Auth Required**

**Body:**
```json
{
  "name": "Long Term",
  "type": "stocks"
}
```

---

### GET /api/portfolios
- Fetch all user portfolios.
- **Auth Required**

---

### DELETE /api/portfolios/:id
- Delete a portfolio.
- **Auth Required**

---

### GET /api/portfolios/:id/analytics
- Get total investment, current value, gain/loss %, and CAGR.
- **Auth Required**

---

### GET /api/portfolios/:id/stocks
- Get stock-wise distribution (for pie chart).
- **Auth Required**

---

### GET /api/portfolios/:id/performance?range=24h|7d|30d|all
- Get portfolio value time-series data.
- **Auth Required**

---

## 💼 Holdings

### POST /api/portfolios/:id/holdings
- Add a holding to portfolio.
- **Auth Required**

**Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 5,
  "avgBuyPrice": 150,
  "currency": "USD",
  "notes": "Apple shares"
}
```

---

### GET /api/portfolios/:id/holdings
- Get holdings for a portfolio.
- **Auth Required**

---

### DELETE /api/holdings/:id
- Delete a holding.
- **Auth Required**

---

## 🔁 Transactions

### POST /api/holdings/:id/transactions
- Add a buy/sell transaction.
- **Auth Required**

**Body:**
```json
{
  "type": "buy",
  "quantity": 3,
  "price": 200
}
```

---

### GET /api/holdings/:id/transactions
- View all transactions of a holding.
- **Auth Required**

---

## 📊 Analytics

### GET /api/analytics/:portfolioId
- Get portfolio investment summary.
- **Auth Required**

---

### GET /api/analytics/:portfolioId/best-worst
- Get best and worst performing holdings by % gain/loss.
- **Auth Required**

---

## 📈 Live Price

### GET /api/price/:symbol
- Get current price of a symbol.
- **No Auth Required**

---

## 🤖 AI Insight

### GET /api/ai/insight/:portfolioId/:symbol
- Get Gemini-generated insight for a holding.
- **Auth Required**

---

## 📤 Export

### GET /api/exports/portfolios/:portfolioId
- Download holdings as `.xlsx`.
- **Auth Required**

---