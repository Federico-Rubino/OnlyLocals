const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/feedback:
 *   post:
 *     summary: Submit feedback for a shop
 *     description: Adds a rating and optional comment for a shop. Only users with the "customer" role can submit feedback.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopId
 *               - rating
 *             properties:
 *               shopId:
 *                 type: string
 *                 description: ID of the shop to review
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: Optional comment
 *                 example: "Great products and friendly staff!"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: The created feedback document
 *       400:
 *         description: Missing shopId or rating, or rating out of range (1–5)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "shopId and rating are required"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only customers can leave feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only customers can leave feedback"
 *       404:
 *         description: Shop not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Shop not found"
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware.autenticateToken, feedbackController.addFeedback);

/**
 * @openapi
 * /api/feedback/shop/{shopId}:
 *   get:
 *     summary: Get feedbacks for a shop
 *     description: Returns all feedback entries for the specified shop. No authentication required.
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shop
 *         example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: List of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                         example: 4
 *                       comment:
 *                         type: string
 *                         example: "Great products!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/shop/:shopId', feedbackController.getFeedbacksByShop);

module.exports = router;
