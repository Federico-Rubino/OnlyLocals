
const shopService = require('../services/shopService');

exports.registerShop = async (req, res) => {
    try {
        const data = req.body;

        const shop = await shopService.registerShop(data);

        res.status(201).json({ 
            success: true, 
            message: 'Shop registered successfully', 
            id: shop._id
       });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Shiop registration failed', 
                error: err.message 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Server error", 
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