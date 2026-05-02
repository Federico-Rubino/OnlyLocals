const Shop = require('../models/shopModel');

exports.getShopById = async (id) =>{
  const shop = await Shop.findById(id);
  return shop;
}


exports.registerShop = async (data) => {
    const shop = {
        name: data.name,
        description: data.description,
        itinerario: data.itinerario,
        events: data.events || [],
        promotion: data.promotion || [],
        fidelityCardManager: data.fidelityCardManager,
        statistiche: data.statistiche
    };

    return Shop.create(shop);
}