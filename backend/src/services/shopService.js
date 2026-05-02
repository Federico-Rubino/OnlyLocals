const Shop = require('../models/shopModel');

exports.getShopById = async (id) =>{
  const shop = await Shop.findById(id);
  return shop;
}

