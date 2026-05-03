
const shopService = require('../services/shopService');

exports.registerShop = async (req, res) => {
    try {
        const data = req.body;

        const shop = await shopService.registerShop(data);

        const userRole = await shopService.assignShop(shop._id, req.user.userId);

        res.status(201).json({ 
            success: true, 
            message: 'Shop registered successfully', 
            newRole: userRole,
            id: shop._id
       });

       
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Shop registration failed', 
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

exports.searchShops = async (req, res) => {
    try {
        const { category, lat, lng, radius, day, slot, name } = req.query;

        const filters = {
            category,
            name,
            day,
            slot,
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            radius: radius ? parseFloat(radius) : undefined
        };

        const shops = await shopService.searchShops(filters);

        res.status(200).json({
            success: true,
            results: shops.length,
            data: shops
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Errore durante la ricerca dei negozi", 
            error: err.message 
        });
    }
};

exports.addPromotion = async (req, res) => {
    try{
        const vendorId = req.user.userId;
        const data = req.body;

        //validate Date
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const now = new Date();

  
        if (start < now) {
            return res.status(400).json({ message: "Start date must be in present or in future" });
        }

        if (end <= start) {
            return res.status(400).json({ message: "End date mast be after init date" });
        }

        const promotion = await shopService.addPromotion(vendorId, data);

        res.status(200).json({
            success: true,
            message: "Promotion added to",
            results: promotion
        })
    } catch (err){
        if(err.name == "Not a vendor"){
            res.status(403).json({
                success: false,
                message: "Not a vendor"
            })
        }

        res.status(500).json({
            success: false,
            message: "Internal server Error",
            error: err.message
        });
    }
};