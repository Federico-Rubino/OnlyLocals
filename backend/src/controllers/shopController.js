
exports.registerShop = async (req, res, next) => {
    try {
        res.status(201).json({ message: 'Shop registered' });
    } catch (err) {
        next(err);
    }
}
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