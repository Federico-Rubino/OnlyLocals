const mongoose = require('mongoose');

// singolo movimento punti
const FidelityPointSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// fidelity card
const FidelityCardSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true
  },

  points: {
    type: [FidelityPointSchema],
    default: []
  }

}, { _id: false });

module.exports = FidelityCardSchema;