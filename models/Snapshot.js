const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalValue: {
    type: Number,
    required: true
  }
});

snapshotSchema.index({ portfolioId: 1, timestamp: 1 });

module.exports = mongoose.model('Snapshot', snapshotSchema);
