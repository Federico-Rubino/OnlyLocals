const mongoose = require('mongoose');

const FidelityCardSchema = require('./FidelityCardSchema');

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
    type: Date,
    required: true
  },

  auth: {
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    isAuth: { type: Boolean, required: true }
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
    ref: 'shops'
  }],
  searches: [{ type: String }], //need to be updated when created search engine
  fidelityCard: {
    type: FidelityCardSchema,
    default: null
  },

  // VENDOR DATA 
  vendorShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shops'
  }

});

module.exports = mongoose.model('User', userSchema, 'users');