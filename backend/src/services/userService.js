const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_TOKEN = process.env.JWT_TOKEN
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY

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

  const payload = { userId: user._id };
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
