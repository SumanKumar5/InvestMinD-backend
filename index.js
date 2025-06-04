const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Validate essential environment variables
if (!process.env.MONGO_URI) {
  throw new Error('❌ MONGO_URI is missing in .env file');
}
if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ GEMINI_API_KEY is missing in .env file');
}

// Import job
const takePortfolioSnapshots = require('./jobs/snapshotJob');

// Import routes
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const holdingRoutes = require('./routes/holdingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const priceRoutes = require('./routes/priceRoutes');
const insightRoutes = require('./routes/insightRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

// Init express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send("InvestMinD API is running...");
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api', holdingRoutes);
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/prices', priceRoutes);
app.use('/api', insightRoutes);
app.use('/api/portfolios', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api', aiRoutes);
app.use('/api/portfolios', performanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('🌩️ Global Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Cron job: Run hourly
cron.schedule('0 * * * *', () => {
  console.log(`[CRON] (${new Date().toISOString()}) Running hourly snapshot job...`);
  takePortfolioSnapshots();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
