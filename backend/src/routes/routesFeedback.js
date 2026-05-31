const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.autenticateToken, feedbackController.addFeedback);
router.get('/shop/:shopId', feedbackController.getFeedbacksByShop);

module.exports = router;
