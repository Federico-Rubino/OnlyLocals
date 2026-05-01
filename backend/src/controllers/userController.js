const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const data = req.body;

    const user = await userService.createUser(data);

    res.status(201).json({
      id: user._id,
      email: user.email,
    });

  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error", content: err.message });
  }
};


exports.getShopById = async (req, res) =>{
  try{
    const shop = await userService.getShopById(req.params.id);
    if(!shop){
      return res.status(404).json({message: "Shop not found"});

    }
    res.status(200).json({
      success:true,
      data: {
        name: shop.name,
        description: shop.description,
        itinerario: shop.itinerario,
        events: shop.events,
        promotions: shop.promotions,
        
      }
  });
}catch (err){
  res.status(500).json({message: "Server error", content: err.message });
}
};