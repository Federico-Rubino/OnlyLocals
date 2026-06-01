const mongoose = require('mongoose');
const User = require('../models/userModel');
const Shop = require('../models/shopModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.createUser = async (data) => {

  const existingEmail = await User.findOne({ email: data.email });
  const existingUsername = await User.findOne({'auth.username' : data.username});
  if (existingEmail || existingUsername) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = {
    name: data.name,
    surname: data.surname,
    bornDate: data.bornDate,
    email: data.email,
    auth: {
      passwordHash: hashedPassword,
      username: data.username
    }
  };

  return User.create(user);
};

exports.loginUser = async (identifier, password) => {
  //find email
  const user = await User.findOne({
    $or: [
      { email: identifier },               
      { 'auth.username': identifier }  
    ]
  });

  if (!user) {
    throw new Error('Invalid credentials'); 
  }

  //check password against the nested passwordHash
  const isMatch = await bcrypt.compare(password, user.auth.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const accessToken = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_TOKEN, 
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id }, 
    process.env.REFRESH_TOKEN_KEY, 
    { expiresIn: '7d' }
  );

  if (!user.auth.refreshTokens) {
    user.auth.refreshTokens = [];
  }

  const currentTime = Date.now();
  user.auth.refreshTokens = user.auth.refreshTokens.filter((oldToken) => {
    try {
      // jwt.decode reads the token without verifying the secret (faster)
      const decoded = jwt.decode(oldToken); 
      
      // JWT 'exp' is in seconds, Date.now() is in milliseconds, so we multiply by 1000
      if (decoded && (decoded.exp * 1000) > currentTime) {
        return true;  // Keep ii, still alive.
      }
      return false; // Throw away, expired.
    } catch {
      return false; // Throw away, corrupted.
    }
  });

  user.auth.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
}; 

exports.refreshToken = async (oldRefreshToken) => {
  //decode token
  const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_KEY);

  //
  const user = await User.findById(decoded.userId);
  if (!user || !user.auth.refreshTokens.includes(oldRefreshToken)) {
    throw new Error("Refresh Token not valid or revoked");
  }

    //create new token
    const newAccessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_TOKEN, 
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
    { userId: user._id }, 
    process.env.REFRESH_TOKEN_KEY, 
    { expiresIn: '7d' }
  );

  user.auth.refreshTokens = user.auth.refreshTokens.filter(t => t !== oldRefreshToken);

  user.auth.refreshTokens.push(newRefreshToken);
  await user.save();

  return {newAccessToken, newRefreshToken}
};

exports.logout = async (tokenToRevoke) => {
  if (!tokenToRevoke) return;
  await User.updateOne(
    { "auth.refreshTokens": tokenToRevoke }, // find the user with this token
    { $pull: { "auth.refreshTokens": tokenToRevoke } } // remove it from the array
  );

  return true;
}

exports.addShopToFavorites = async (userId, shopId) => { 
  const user = await User.findById(userId);

  if(user.role !== 'customer'){
    throw new Error("Only customers can add shops to favorites");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }
  
  if (user.savedShops.includes(shopId)) {
    throw new Error("Shop already in favorites");
  }

  user.savedShops.push(shopId);
  await user.save();

  shop.statistiche.numSalvataggi += 1;
  shop.markModified('statistiche');
  await shop.save();

  return user.savedShops;
}

exports.removeShopFromFavorites = async (userId, shopId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.savedShops || user.savedShops.length === 0) {
    throw new Error("Shop not in favorites");
  }

  const shopIndex = user.savedShops.findIndex(savedId => savedId.toString() === shopId.toString());
  
  if (shopIndex === -1) {
      throw new Error("Shop not in favorites");
  }

  user.savedShops.splice(shopIndex, 1);
  await user.save();

  return user.savedShops;
}

exports.setAsCustomer = async (userId) => {
  const user = await User.findById(userId);

  if (user.role !== 'pending') {
    throw new Error("User is not pending");
  }

  user.role = 'customer';
  user.fidelityCard = {
    barcode: new mongoose.Types.ObjectId().toString(),
    points: []
  };
  await user.save();

  return user.role;
}

exports.getFavoritesWithDetails = async (userId) => {
  const user = await User.findById(userId, 'savedShops').populate('savedShops', 'name category description');
  if (!user) throw new Error('User not found');
  return user.savedShops;
};

exports.savePushToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { pushToken: token });
};

exports.getNotifications = async (userId) => {
  const user = await User.findById(userId, 'notifications');
  if (!user) throw new Error('User not found');
  const sorted = [...user.notifications].sort(
    (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
  );
  return sorted;
};

exports.markNotificationRead = async (userId, notificationId) => {
  await User.updateOne(
    { _id: userId, 'notifications._id': notificationId },
    { $set: { 'notifications.$.read': true } }
  );
};

exports.markAllNotificationsRead = async (userId) => {
  await User.updateOne(
    { _id: userId },
    { $set: { 'notifications.$[].read': true } }
  );
};

exports.updatePersonalData = async (userId, newInfo) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const changes = {};

  if (newInfo.email && newInfo.email !== user.email) {
    const emailExists = await User.findOne({ email: newInfo.email });
    if (emailExists) throw new Error("Email already in use");
    user.email = newInfo.email;
    changes.email = newInfo.email;
  }

  if (newInfo.username && newInfo.username !== user.auth.username) {
    const usernameExists = await User.findOne({ "auth.username": newInfo.username });
    if (usernameExists) throw new Error("Username already in use");
    user.auth.username = newInfo.username;
    changes.username = newInfo.username;
  }

  if (newInfo.name) { user.name = newInfo.name; changes.name = newInfo.name; }
  if (newInfo.surname) { user.surname = newInfo.surname; changes.surname = newInfo.surname; }
  if (newInfo.bornDate) { user.bornDate = newInfo.bornDate; changes.bornDate = newInfo.bornDate; }

  await user.save();
  
  return changes;
}

exports.getPoints = async (userId) => {
    const user = await User.findById(userId).select('fidelityCard');
    if (!user) throw new Error("User not found");

    if (!user.fidelityCard || !user.fidelityCard.barcode) {
        throw new Error("Fidelity card not found");
    }

    return user.fidelityCard.points;
};



exports.getUserData = async (userId) =>{
  const user = await User.findById(userId).select('-auth'); //pswd and token are never send to client
  if(!user) throw new Error("User not found");
  return user;
};

