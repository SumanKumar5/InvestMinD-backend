const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const holdingRoutes = require('./routes/holdingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const priceRoutes = require('./routes/priceRoutes');
const insightRoutes = require('./routes/insightRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cron = require('node-cron');
const takePortfolioSnapshots = require('./jobs/snapshotJob');
const performanceRoutes = require('./routes/performanceRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Test route
app.get('/', (req, res) => {
  res.send("InvestMinD API is running...");
});

// 🕒 Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00...)
cron.schedule('0 * * * *', () => {
  console.log('[CRON] Running hourly snapshot job...');
  takePortfolioSnapshots();
});

app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api', holdingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api', insightRoutes);
app.use('/api/portfolios', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api', aiRoutes);
app.use('/api/portfolios', performanceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
