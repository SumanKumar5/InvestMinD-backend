
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

### GET /api/analytics/:portfolioId/sector
- Sector-wise holding distribution.
- **Auth Required**

---

### GET /api/analytics/:portfolioId/cagr
- CAGR of portfolio.
- **Auth Required**

---

## 📈 Live Price

### POST /api/prices
- Get current price of a symbol.
- **Auth Required**

**Body:**
```json
{
  "symbol": "AAPL"
}
```

---

## 🤖 AI Insight

### POST /api/insights
- Get Gemini-generated insight for a holding.
- **Auth Required**

**Body:**
```json
{
  "symbol": "AAPL",
  "portfolioId": "..."
}
```

---

## 📤 Export

### GET /api/exports/:portfolioId
- Download holdings as `.xlsx`.
- **Auth Required**

---

