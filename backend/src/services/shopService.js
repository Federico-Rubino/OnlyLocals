const Shop = require('../models/shopModel');

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


