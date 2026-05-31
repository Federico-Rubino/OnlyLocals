
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
                statistiche: {                             
                votoMedio: shop.statistiche?.votoMedio,
                totaleFeedback: shop.statistiche?.totaleFeedback,
                storicoFeedback: shop.statistiche?.storicoFeedback || []
                }
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

        if (err.name === "DuplicateEvent") {
            return res.status(409).json({
                success: false,
                message: err.message
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

exports.scanFidelityCard = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { barcode } = req.body;

        if (!barcode) {
            return res.status(400).json({
                success: false,
                message: "Barcode obbligatorio"
            });
        }

        const result = await shopService.scanFidelityCard(vendorId, barcode);

        res.status(200).json({
            success: true,
            message: "Punto aggiunto con successo",
            data: result
        });
    } catch (err) {
        if (err.message === "Fidelity card not found") {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.message === "Not a vendor") {
            return res.status(403).json({ success: false, message: err.message });
        }
        if (err.message === "Modalità non compatibile: shop usa punti per acquisto, usa addPoints") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.setVantaggi = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { vantaggi } = req.body;

        if (!vantaggi || vantaggi.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vantaggi non forniti"
            });
        }

        const result = await shopService.setVantaggi(vendorId, vantaggi);

        res.status(200).json({
            success: true,
            message: "Vantaggi aggiornati con successo",
            data: result
        });
    } catch (err) {
        if (err.message === "Vantaggi non modificabili prima di 3 mesi dall'ultima modifica") {
            return res.status(403).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.getVantaggi = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const vantaggi = await shopService.getVantaggi(vendorId);

        res.status(200).json({
            success: true,
            data: vantaggi
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};



exports.addPoints = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { barcode, importo } = req.body;

        if (!barcode || !importo || importo <= 0) {
            return res.status(400).json({
                success: false,
                message: "Barcode e importo obbligatori"
            });
        }

        const result = await shopService.addPoints(vendorId, barcode, importo);

        res.status(200).json({
            success: true,
            message: "Punti aggiunti con successo",
            data: result
        });

    } catch (err) {
        if (err.message === "Fidelity card not found") {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.message === "Not a vendor") {
            return res.status(403).json({ success: false, message: err.message });
        }
        if (err.message === "Modalità non compatibile: shop usa punti per visita, usa scan") {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === "Tasso di conversione non configurato") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.redeemVantaggio = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { barcode, descrizioneVantaggio } = req.body;

        if (!barcode || !descrizioneVantaggio) {
            return res.status(400).json({
                success: false,
                message: "Barcode e descrizioneVantaggio obbligatori"
            });
        }

        const result = await shopService.redeemVantaggio(vendorId, barcode, descrizioneVantaggio);

        res.status(200).json({
            success: true,
            message: "Vantaggio riscattato con successo",
            data: result
        });

    } catch (err) {
        if (err.message === "Not enough points") {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === "Vantaggio not found") {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.message === "Fidelity card not found") {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.modifyConversion = async (req, res) => {
    try {
        const vendorId = req.user.userId;
        const { tasso } = req.body;

        if (!tasso) {
            return res.status(400).json({
                success: false,
                message: "Tasso di conversione obbligatorio"
            });
        }

        const result = await shopService.modifyConversion(vendorId, tasso);

        res.status(200).json({
            success: true,
            message: "Tasso di conversione aggiornato",
            data: result
        });

    } catch (err) {
        if (err.message === "Not a vendor") {
            return res.status(403).json({ success: false, message: err.message });
        }
        if (err.message === "Tasso di conversione deve essere maggiore di 0") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.getStatistiche = async (req,res)=>{
    try {
        const vendorId = req.user.userId;
        const shop = await shopService.getStatistiche(vendorId);

        res.status(200).json({
            success: true,
            data: {
                nomeShop: shop.name,
                statistiche: shop.statistiche ? {
                    numSalvataggi: shop.statistiche.numSalvataggi,
                    votoMedio: shop.statistiche.votoMedio,
                    totalFeedback: shop.statistiche.totaleFeedback,
                    mappaAccessi: shop.statistiche.storicoFeedback,
                    storicoFeedback: shop.statistiche.storicoFeedback,
                    ultimoAggiornamento: shop.statistiche.ultimoAggiornamento
                } : "Nessuna statistica disponibile"
            }
        });
    }catch(err){
        if(err.message=== "Not a vendor"){
            return res.status(403).json({success: false, message: err.message});
        }
        if(err.message === "Shop not found"){
            return res.status(404).json({success: false, message: err.message});
        }
        res.status(500).json({
            success:false,
        });
    }
}

exports.addFeedback = async (req,res)=>{
    try{
        const userId = req.user.userId;
        const {shopId} = req.params;
        const {voto, commento} = req.body;

        if(!voto || voto<1 || voto>5){
            return res.status(400).json({
                success: false,
                message: "Il voto deve essere compres tra 1 e 5"
            });
        }
        const feedback = await shopService.addFeedback(userId, shopId, {voto, commento});

        res.status(201).json({
            success: true,
            message: "Feedback aggiunto con successo",
            data: feedback
        });
    }catch (err){
        if(err.message === "Shop not found"){
            return res.status(404).json({ success: false, message: err.message});
        }
        if(err.message === "User not found"){
            return res.status(404).json({success: false, message: err.message});
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

exports.updateShop = async (req, res)=>{
    try{
        const vendorId = req.user.userId;
        const updateData = req.body;

        if(Object.keys(updateData).length === 0){
            return res.status(400).json ({
                success: false,
                message: "No data provided for update."
            });
        }
        const updateShop = await shopService.updateShop(vendorId, updateData);

        res.status (200).json({
            success: true,
            message: "Shop updated successfully",
            results: updateShop});
        
    }catch (err){
        if(err.message == "Shop not found"){
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }if(err.message == "Not a vendor"){
            return res.status(403).json({
                success: false,
                message: "Internal server error",
                error: err.message
            });
        }
    }
};