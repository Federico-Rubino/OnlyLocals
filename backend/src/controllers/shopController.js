
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
