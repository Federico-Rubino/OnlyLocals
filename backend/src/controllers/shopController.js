
exports.registerShop = async (req, res, next) => {
    try {
        const shop = await shopService.registerShop(req.body);

        res.status(201).json({ 
            success: true,
            message: 'Shop registered successfully',
            data: shop 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: "Errore durante la registrazione", 
            error: err.message 
        });
    }
}
exports.getShopById = async (req, res) =>{
  try{
    const shop = await shopService.getShopById(req.params.id);
    if(!shop){
      return res.status(404).json({message: "Shop not found"});

    }
    res.status(200).json({
      success:true,
      data: {
        name: shop.name,
        description: shop.description,
        category: shop.category,
        itinerario: shop.itinerario,
        events: shop.events,
        promotions: shop.promotions,
        
      }
  });
}catch (err){
  res.status(500).json({message: "Server error", content: err.message });
}
};