const Feedback = require('../models/feedbackModel');
const Shop = require ('../models/shopModel');
const User = require('../models/userModel');

exports.addFeedback = async (userId, shopId, data) =>{
    const shop = await Shop.findById(shopId);
    if(!shop) throw new Error("Shop not found");

    const user = await User.findById(userId);
    if(!user) throw new Error("User not found");

    const feedback = await Feedback.create({
        voto: data.voto,
        commento: data.commento,
        user: userId,
        shop: shopId
    });

    if (!shop.statistiche) {
        shop.statistiche = {
            numSalvataggi:       0,
            mappaAccessi:        [],
            storicoFeedback:     [],
            votoMedio:           0,
            totaleFeedback:      0,
            ultimoAggiornamento: null
        };
    }

    shop.statistiche.storicoFeedback.push(feedback._id);
    shop.statistiche.totaleFeedback = shop.statistiche.storicoFeedback.length;

    const allFeedbacks = await Feedback.find({shop: shopId});
    const sommaVoti = allFeedbacks.reduce((acc,f) => acc + f.voto,0);
    shop.statistiche.votoMedio = (sommaVoti /allFeedbacks.length).toFixed(1);
    shop.statistiche.ultimoAggiornamento = new Date();

    await shop.save();
    return feedback;

}