const Feedback = require('../models/feedbackModel');
const Shop = require('../models/shopModel');
const User = require('../models/userModel');
const notificationService = require('./notificationService');

exports.addFeedback = async (authorId, data) => {
  const { shopId, rating, comment } = data;

  const author = await User.findById(authorId);
  if (!author || author.role !== 'customer') {
    throw new Error('Only customers can leave feedback');
  }

  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error('Shop not found');

  const feedback = await Feedback.create({
    shopId,
    authorId,
    authorName: `${author.name} ${author.surname}`,
    rating,
    comment: comment || ''
  });

  // Update shop statistics
  if (!shop.statistiche) {
    shop.statistiche = {
      numSalvataggi: 0,
      mappaAccessi: [],
      storicoFeedback: [],
      votoMedio: 0,
      totaleFeedback: 0,
      ultimoAggiornamento: new Date()
    };
  }

  const prevTotal = shop.statistiche.totaleFeedback || 0;
  const prevAvg = shop.statistiche.votoMedio || 0;
  shop.statistiche.storicoFeedback.push(feedback._id);
  shop.statistiche.totaleFeedback = prevTotal + 1;
  shop.statistiche.votoMedio = ((prevAvg * prevTotal) + rating) / (prevTotal + 1);
  shop.statistiche.ultimoAggiornamento = new Date();
  await shop.save();

  notificationService.notifyVendor(shop._id, shop.name, {
    authorName: `${author.name} ${author.surname}`,
    rating,
    comment: comment || ''
  }).catch(err => console.error('Notification error:', err));

  return feedback;
};

exports.getFeedbacksByShop = async (shopId) => {
  return Feedback.find({ shopId }).sort({ date: -1 });
};
