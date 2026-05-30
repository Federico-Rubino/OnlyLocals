const mongoose = require('mongoose');
const FidelityCardSchema = require('./fidelityCardModel.js');

const NotificationSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopName: String,
  eventName: String,
  eventDescription: String,
  eventDate: Date,
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  surname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  bornDate: {
    type: String,
    required: true
  },

  auth: {
    username: { type: String, required: true, unique: true},
    passwordHash: { type: String, required: true },
    refreshTokens: [{type: String}]
  },

  //role onboarding
  role: {
    type: String,
    enum: ['pending', 'customer', 'vendor'],
    default: 'pending',
    required: true
  },


  // CUSTOMER DATA 

  savedShops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  }],
  searches: [{ type: String }], //need to be updated when created search engine
  fidelityCard: {
    type: FidelityCardSchema,
    default: null
  },

  // VENDOR DATA
  vendorShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },

  pushToken: { type: String, default: null },

  notifications: [NotificationSchema]

});

module.exports = mongoose.model('User', userSchema, 'users');