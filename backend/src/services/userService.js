const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

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
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  return token;
}; 
