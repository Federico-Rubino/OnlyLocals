const feedbackService = require('../services/feedbackService');

exports.addFeedback = async (req, res) => {
  try {
    const authorId = req.user.userId;
    const { shopId, rating, comment } = req.body;

    if (!shopId || rating === undefined) {
      return res.status(400).json({ success: false, message: 'shopId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const feedback = await feedbackService.addFeedback(authorId, { shopId, rating, comment });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    if (err.message === 'Only customers can leave feedback') {
      return res.status(403).json({ success: false, message: err.message });
    }
    if (err.message === 'Shop not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

exports.getFeedbacksByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const feedbacks = await feedbackService.getFeedbacksByShop(shopId);
    res.status(200).json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
