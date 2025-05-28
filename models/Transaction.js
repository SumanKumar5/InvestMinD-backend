const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  holding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Holding',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  executedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
