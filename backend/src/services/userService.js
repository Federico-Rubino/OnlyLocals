const User = require('../models/userModel');
const Shop = require('../models/shopModel');
const bcrypt = require('bcrypt');

exports.createUser = async (data) => {

  const existing = await User.findOne({ email: data.email });
  if (existing) {
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

exports.getShopById = async (id) =>{
  const shop = await Shop.findById(id);
  return shop;
}

