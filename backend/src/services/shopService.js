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

    return await Shop.find(query).select('name itinerario');
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