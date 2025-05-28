const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  symbol: {
    type: String,
    required: [true, 'Asset symbol is required'],
    uppercase: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  avgBuyPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Holding', holdingSchema);
