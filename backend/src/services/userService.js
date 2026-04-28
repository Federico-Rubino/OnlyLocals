const User = require('../models/userModel');

exports.createUser = async (data) => {
  if (!data.email || !data.password) {
    throw new Error('Email e password richieste');
  }

  const user = {
    id: Date.now(),
    email: data.email,
    password: data.password,
  };

  return User.create(user);
};

exports.getAllUsers = async () => {
  return User.findAll();
};