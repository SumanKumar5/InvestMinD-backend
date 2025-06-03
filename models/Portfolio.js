const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Portfolio name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['stocks', 'crypto', 'mutual-funds', 'etf', 'bonds'],
    default: 'stocks'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

portfolioSchema.index({ user: 1 });
module.exports = mongoose.model('Portfolio', portfolioSchema);
