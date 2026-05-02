const User = require('../models/userModel');
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
    },

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