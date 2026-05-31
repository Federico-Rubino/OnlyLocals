const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  shopId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '' },
  date:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema, 'feedbacks');
