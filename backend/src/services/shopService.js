const Shop = require('../models/shopModel');
const User = require('../models/userModel');
const notificationService = require('./notificationService');


exports.getShopById = async (id) =>{
  const shop = await Shop.findById(id);

  if(shop){
    shop.statistiche.mappaAccessi.push({
        data: new Date(),
        valore: 1
    });
    shop.markModified('statistiche');
    await shop.save();
  }
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
        statistiche:{
            numSalvataggi:       0,
            mappaAccessi:        [],
            storicoFeedback:     [],
            votoMedio:           0,
            totaleFeedback:      0,
            ultimoAggiornamento: new Date()
        }
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

    if (!shop.fidelityCardManager) {
        shop.fidelityCardManager = {
            numeroUtenti:   0,
            ultimaModifica: null,
            vantaggi:       []
        };
        await shop.save();
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

exports.addEvent = async (vendorId, eventData) => {
    const shop = await getShopFromVendor(vendorId);

    const incomingDate = new Date(eventData.date);
    incomingDate.setHours(0, 0, 0, 0);

    const duplicate = shop.events.some(e => {
        const existingDate = new Date(e.date);
        existingDate.setHours(0, 0, 0, 0);
        return e.description === eventData.description && existingDate.getTime() === incomingDate.getTime();
    });

    if (duplicate) {
        const err = new Error('An event with the same description and date already exists.');
        err.name = 'DuplicateEvent';
        throw err;
    }

    shop.events.push(eventData);
    await shop.save();

    notificationService.notifyShopFollowers(shop._id, shop.name, 'event', eventData).catch(err => {
        console.error('Notification error:', err);
    });

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
    if (!vendor) throw new Error("User not found");
    if (vendor.role !== 'vendor') throw new Error("Not a vendor");

    const shop = await Shop.findById(vendor.vendorShop);
    if (!shop) throw new Error("Shop not found");
    return shop;
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

    notificationService.notifyShopFollowers(shop._id, shop.name, 'promotion', data).catch(err => {
        console.error('Notification error:', err);
    });

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

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");

    if (shop.fidelityCardManager.modo === 'acquisto') {
        throw new Error("Modalità non compatibile: shop usa punti per acquisto, usa addPoints");
    }

    const user = await User.findOne({ 'fidelityCard.barcode': barcode });
    if (!user) throw new Error("Fidelity card not found");

    const pointEntry = user.fidelityCard.points.find(
        p => p.activity === shop._id.toString()
    );

    let shopNeedsSave = false;

    if (!shop.fidelityCardManager.modo) {
        shop.fidelityCardManager.modo = 'visita';
        shopNeedsSave = true;
    }

    if (pointEntry) {
        pointEntry.count += 1;
    } else {
        user.fidelityCard.points.push({
            activity: shop._id.toString(),
            count: 1
        });
        shop.fidelityCardManager.numeroUtenti += 1;
        shopNeedsSave = true;
    }

    if (shopNeedsSave) {
        shop.markModified('fidelityCardManager');
        await shop.save();
    }

    user.markModified('fidelityCard');
    await user.save();
    return {
        puntiTotali: pointEntry ? pointEntry.count : 1,
        utente: user.name
    };
};

exports.setVantaggi = async (vendorId, vantaggi) => {
    const shop = await getShopFromVendor(vendorId);

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");

    
    if (shop.fidelityCardManager.ultimaModifica) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (shop.fidelityCardManager.ultimaModifica > threeMonthsAgo) {
            throw new Error("Vantaggi non modificabili prima di 3 mesi dall'ultima modifica");
        }
    }

    shop.fidelityCardManager.vantaggi = vantaggi;
    shop.fidelityCardManager.ultimaModifica = new Date();

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

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");

    if (shop.fidelityCardManager.modo === 'visita') {
        throw new Error("Modalità non compatibile: shop usa punti per visita, usa scan");
    }

    const tasso = shop.fidelityCardManager.tassoConversione;
    if (!tasso || tasso <= 0) throw new Error("Tasso di conversione non configurato");

    const user = await User.findOne({ 'fidelityCard.barcode': barcode });
    if (!user) throw new Error("Fidelity card not found");

    const puntiGuadagnati = Math.floor(importo / tasso);

    const pointEntry = user.fidelityCard.points.find(
        p => p.activity === shop._id.toString()
    );

    let shopNeedsSave = false;

    if (!shop.fidelityCardManager.modo) {
        shop.fidelityCardManager.modo = 'acquisto';
        shopNeedsSave = true;
    }

    if (pointEntry) {
        pointEntry.count += puntiGuadagnati;
    } else {
        user.fidelityCard.points.push({
            activity: shop._id.toString(),
            count:    puntiGuadagnati
        });
        shop.fidelityCardManager.numeroUtenti += 1;
        shopNeedsSave = true;
    }

    if (shopNeedsSave) {
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

exports.modifyConversion = async (vendorId, tassoConversione) => {
    const shop = await getShopFromVendor(vendorId);

    if (!shop.fidelityCardManager) throw new Error("Fidelity card manager not configured");
    if (tassoConversione <= 0) throw new Error("Tasso di conversione deve essere maggiore di 0");


    const updated = await Shop.findByIdAndUpdate(
        shop._id,
        { $set: { "fidelityCardManager.tassoConversione": tassoConversione } },
        { new: true }
    );

    return { tassoConversione: updated.fidelityCardManager.tassoConversione };
};


exports.getStatistiche = async (vendorId) =>{
    const shop = await getShopFromVendor(vendorId);

    return await Shop.findById(shop._id).populate('statistiche.storicoFeedback').select('statistiche name');
}



exports.addFeedback = async (userId, shopId, data) =>{
    const shop = await Shop.findById(shopId);
    if(!shop) throw new Error("Shop not found");

    const user = await User.findById(userId);
    if(!user) throw new Error("User not found");

    if (!shop.statistiche) {
        shop.statistiche = {
            numSalvataggi:0,
            mappaAccessi: [],
            storicoFeedback:[],
            votoMedio:0,
            totaleFeedback:0,
            ultimoAggiornamento: null
        };
    }

    const nuovoFeedback = {
        voto: data.voto,
        commento: data.commento,
        user: userId,
        data: new Date()
   };

    shop.statistiche.storicoFeedback.push(nuovoFeedback);
    shop.statistiche.totaleFeedback = shop.statistiche.storicoFeedback.length;

    const sommaVoti = shop.statistiche.storicoFeedback.reduce((acc, f) => acc + f.voto, 0);
    shop.statistiche.votoMedio = (
    sommaVoti / shop.statistiche.storicoFeedback.length).toFixed(1);

    shop.statistiche.ultimoAggiornamento = new Date();
    shop.markModified('statistiche');

    await shop.save();
    return nuovoFeedback;
};



exports.updateShop = async (vendorId, newData) =>{
    const shop = await getShopFromVendor(vendorId);

    const change = {};
    if (newData.name){shop.name = newData.name; change.name = newData.name;}
    if (newData.description){shop.description = newData.description; change.description = newData.description;}

    if(newData.itinerario){
        const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
        giorni.forEach(giorno =>{
            if(newData.itinerario[giorno]){
                shop.itinerario[giorno] = newData.itinerario[giorno];
                change[giorno] = newData.itinerario[giorno];
            }
        });
    }
    if(newData.events){shop.events = newData.events; change.events = newData.events;}
    if(newData.promotions){shop.promotions = newData.promotions; change.promotions = newData.promotions;}
    
    await shop.save();
    return change; 
}