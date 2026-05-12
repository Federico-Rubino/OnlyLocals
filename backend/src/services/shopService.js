const Shop = require('../models/shopModel');
const User = require('../models/userModel');

exports.getShopById = async (id) =>{
  const shop = await Shop.findById(id);
  return shop;
}


exports.registerShop = async (data) => {
    const allLocations = [];
    
    if (data.itinerario) {
        Object.values(data.itinerario).forEach(day => {
            Object.values(day).forEach(slot => {
                if (slot.latitudine && slot.longitudine) {
                    allLocations.push({
                        type: 'Point', 
                        coordinates: [slot.longitudine, slot.latitudine]
                    });
                    
                    slot.location = {
                        type: 'Point',
                        coordinates: [slot.longitudine, slot.latitudine]
                    };
                }
            });
        });
    }

    const shop = {
        name: data.name,
        description: data.description,
        category: data.category,
        itinerario: data.itinerario,
        allLocations: allLocations, 
        events: data.events || [],
        promotions: data.promotions || [],
        fidelityCardManager: data.fidelityCardManager,
        statistiche: data.statistiche
    };

    return Shop.create(shop);
};

exports.assignShop = async (shopId, userId) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new Error("Shop not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (user.vendorShop) {
        throw new Error("User already has a shop assigned");
    }

    user.vendorShop = shopId;
    user.role = 'vendor';
    await user.save();

    return user.role;
}

const geoHandler = (f) => {
    if (!f.lat || !f.lng) return {};

    const lat = parseFloat(f.lat);
    const lng = parseFloat(f.lng);
    const radius = parseFloat(f.radius) || 5;

    // Ricerca specifica
    if (f.day && f.slot) {
        const geoPath = `itinerario.${f.day}.${f.slot}.location`;
        return {
            [geoPath]: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius / 6378.1]
                }
            }
        };
    }

    // Ricerca globale
    return {
        "allLocations.location": {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6378.1]
            }
        }
    };
};


exports.searchShops = async (filters) => {
    const query = {};

    const complexHandlers = {
        category: (val) => ({
            category: Array.isArray(val) ? { $in: val } : val
        }),
        name: (val) => ({
            name: { $regex: val, $options: 'i' }
        })
    };

    Object.assign(query, geoHandler(filters));

    Object.keys(filters).forEach(key => {
        const value = filters[key];

        if (value === undefined || value === null || value === '') return;

        if (complexHandlers[key]) {
            Object.assign(query, complexHandlers[key](value));
        } 
        else if (!['lat', 'lng', 'radius', 'day', 'slot'].includes(key)) {
            query[key] = value;
        }
    });

    return await Shop.find(query).select('name');
};

exports.addEvent= async (vendorId, eventData) => {
    
    const shop = await getShopFromVendor(vendorId);

    shop.events.push(eventData);
    await shop.save();

    return shop.events;
}

exports.deleteEvent = async (vendorId, eventName) => {
    const shop = await getShopFromVendor(vendorId)
    
    const eventIndex = shop.events.findIndex(e => e.name === eventName);
    if (eventIndex === -1) {
        throw new Error("Event not found");
    }

    shop.events.splice(eventIndex, 1);
    await shop.save();

    return shop.events;

}
const getShopFromVendor = async (vendorId) => {
    const vendor = await User.findById(vendorId);
    if (vendor.role != 'vendor'){
        throw new Error("Not a vendor");
    }

    return await Shop.findById(vendor.vendorShop);
};

exports.addPromotion = async (vendorId, data) => {

    const shop = await getShopFromVendor(vendorId);

    const promotion = {
        description: data.description,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate,
    };

    shop.promotions.push(promotion);
    await shop.save();

    return shop._id;
};

exports.deletePromotion = async (vendorId, description) => {
    const shop = await getShopFromVendor(vendorId);

    const promotionIndex = shop.promotions.findIndex(p => p.description === description);
    if (promotionIndex === -1) {
        throw new Error("Promotion not found");
    }

    shop.promotions.splice(promotionIndex, 1);
    await shop.save();

    return shop.promotions;
};
exports.scanFidelityCard = async (vendorId, barcode) => {
    const shop = await getShopFromVendor(vendorId);


    if (!shop.fidelityCardManager) {
        shop.fidelityCardManager = {
            numeroUtenti: 0,
            ultimaModifica: null,
            modificabile: true,
            vantaggi: []
        };
    }

    const user = await User.findOne({ 'fidelityCard.barcode': barcode });
    if (!user) throw new Error("Fidelity card not found");

    const pointEntry = user.fidelityCard.points.find(
        p => p.activity === shop._id.toString()
    );

    if (pointEntry) {
        pointEntry.count += 1;
    } else {
        user.fidelityCard.points.push({
            activity: shop._id.toString(),
            count: 1
        });
        shop.fidelityCardManager.numeroUtenti += 1;
        await shop.save();
    }

    await user.save();
    return { 
        puntiTotali: pointEntry ? pointEntry.count : 1,
        utente: user.name
    };
};

exports.setVantaggi = async (vendorId, vantaggi) => {
    const shop = await getShopFromVendor(vendorId);

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");

    
    if (!shop.fidelityCardManager.modificabile) {
        throw new Error("Vantaggi non modificabili prima di 3 mesi dall'ultima modifica");
    }

    shop.fidelityCardManager.vantaggi = vantaggi;
    shop.fidelityCardManager.ultimaModifica = new Date();
    shop.fidelityCardManager.modificabile = false;

    shop.markModified('fidelityCardManager');

    await shop.save();
    return shop.fidelityCardManager.vantaggi;
};

exports.getVantaggi = async (vendorId) => {
    const shop = await getShopFromVendor(vendorId);
    return shop.fidelityCardManager?.vantaggi || [];
};

exports.addPoints = async (vendorId, barcode, importo) => {
    const shop = await getShopFromVendor(vendorId);

    if (!shop.fidelityCardManager) {
        shop.fidelityCardManager = {
            numeroUtenti:     0,
            ultimaModifica:   null,
            modificabile:     true,
            tassoConversione: 1,
            vantaggi:         []
        };
    }

    const user = await User.findOne({ 'fidelityCard.barcode': barcode });
    if (!user) throw new Error("Fidelity card not found");

    const tasso = shop.fidelityCardManager.tassoConversione || 1;
    const puntiGuadagnati = Math.floor(importo / tasso);

    const pointEntry = user.fidelityCard.points.find(
        p => p.activity === shop._id.toString()
    );

    if (pointEntry) {
        pointEntry.count += puntiGuadagnati;
    } else {
        user.fidelityCard.points.push({
            activity: shop._id.toString(),
            count:    puntiGuadagnati
        });
        shop.fidelityCardManager.numeroUtenti += 1;
        shop.markModified('fidelityCardManager');
        await shop.save();
    }

    user.markModified('fidelityCard');
    await user.save();

    return {
        puntiGuadagnati,
        puntiTotali: pointEntry ? pointEntry.count : puntiGuadagnati,
        utente:      user.name
    };
};

exports.redeemVantaggio = async (vendorId, barcode, descrizioneVantaggio) => {
    const shop = await getShopFromVendor(vendorId);

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");

    const user = await User.findOne({ 'fidelityCard.barcode': barcode });
    if (!user) throw new Error("Fidelity card not found");

    const vantaggio = shop.fidelityCardManager.vantaggi.find(
        v => v.descrizione === descrizioneVantaggio
    );
    if (!vantaggio) throw new Error("Vantaggio not found");

    const pointEntry = user.fidelityCard.points.find(
        p => p.activity === shop._id.toString()
    );
    if (!pointEntry) throw new Error("No points for this shop");

    if (pointEntry.count < vantaggio.sogliaPunti) {
        throw new Error("Not enough points");
    }

    pointEntry.count -= vantaggio.sogliaPunti;
    user.markModified('fidelityCard');
    await user.save();

    return {
        vantaggio,
        puntiRimanenti: pointEntry.count,
        utente:         user.name
    };
};