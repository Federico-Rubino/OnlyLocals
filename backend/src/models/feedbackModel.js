const mongoose = require('mongoose');
const { useTransition } = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    voto: {
        type: Number, 
        required:true, 
        min:1, 
        max:5},
    commento: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true 
    }

});

module.exports = mongoose.model('Feedback', FeedbackSchema, 'feedbacks');