const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/feedback/{shopId}:
 *   post:
 *     summary: Add feedback to a shop
 *     description: Allows an authenticated user to leave a feedback on a shop
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voto
 *             properties:
 *               voto:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               commento:
 *                 type: string
 *                 example: "Ottimo servizio!"
 *     responses:
 *       201:
 *         description: Feedback aggiunto con successo
 *       400:
 *         description: Voto non valido
 *       404:
 *         description: Shop non trovato
 *       500:
 *         description: Internal server error
 */
router.post('/:shopId', authMiddleware.autenticateToken, feedbackController.addFeedback);

module.exports = router;