
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
            message: "Error searching shops", 
            error: err.message 
        });
    }
};

exports.addEvent = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { name, description, date } = req.body;

        const parsedDate = new Date(date);
        const now = new Date();
        
        if (parsedDate < now) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event date must be in the future.' 
            });
        }

        const eventData = { name, description, date: parsedDate };
        const event = await shopService.addEvent(vendorId, eventData);

        res.status(200).json({
            success: true,
            message: 'Event added successfully',
            data: event 
        });
    } catch (err) {
        if (err.name === "Not a vendor") {
            return res.status(403).json({
                success: false,
                message: "Not a vendor"
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Error adding event to shop", 
            error: err.message 
        });
    }
}

exports.deleteEvent = async (req, res) => { 
    try{
        const { name } = req.body;
        const vendorId = req.user.userId;

        const updatedEvents = await shopService.deleteEvent(vendorId, name);

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully',
            data: updatedEvents
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Error deleting event from shop", 
            error: err.message 
        });
    }
}

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

exports.deletePromotion = async (req, res) => {
    try {
    const { description } = req.query;
    const vendorId = req.user.userId;

    const updatedPromotions = await shopService.deletePromotion(vendorId, description);

    res.status(200).json({
        success: true,
        message: "Promotion removed",
        results: updatedPromotions
    });
} catch (err) {
    res.status(500).json({ message: err.message });
}
}