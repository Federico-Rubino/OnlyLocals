const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware');
/**
 * @openapi
 * /api/shops/register:
 *   post:
 *     summary: Register a new business
 *     description: Creates a shop. Note, coordinates follow the GeoJSON standard [longitude, latitude].
 *     tags:
 *       - Shops
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Panificio Centrale"
 *             description: "Fresh bread and local pastries"
 *             category: ["Fruit and Vegetables"]
 *             itinerary:
 *               monday:
 *                 morning:
 *                   location:
 *                     type: "Point"
 *                     coordinates: [9.1900, 45.4642]
 *                   address: "Piazza Duomo, Milan"
 *     responses:
 *       201:
 *         description: Shop successfully registered
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post('/register', authMiddleware.autenticateToken, shopController.registerShop);

/**
 * @openapi
 * /api/shops/search:
 *   get:
 *     summary: Search shops with different filters
 *     description: Filter by name, category, or location (current or weekly schedule).
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         explode: true
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *       - in: query
 *         name: slot
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 */
router.get('/search', shopController.searchShops);

/**
 * @openapi
 * /api/shops/statistiche:
 *   get:
 *     summary: Get shop statistics
 *     description: Returns all statistics of the vendor's shop
 *     tags:
 *       - Shops
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nomeShop:
 *                       type: string
 *                     statistiche:
 *                       type: object
 *                       properties:
 *                         numSalvataggi:
 *                           type: integer
 *                         votoMedio:
 *                           type: number
 *                         totaleFeedback:
 *                           type: integer
 *                         mappaAccessi:
 *                           type: array
 *                         storicoFeedback:
 *                           type: array
 *                         ultimoAggiornamento:
 *                           type: string
 *                           format: date-time
 *       403:
 *         description: Not a vendor
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Internal server error
 */
router.get('/statistiche', authMiddleware.autenticateToken, shopController.getStatistiche);


/**
 * @openapi
 * /api/shops/{id}:
 *   get:
 *     summary: Get a single shop by ID
 *     description: Returns all info of a specific commercial activity
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Shop details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     itinerario:
 *                       type: object
 *                     events:
 *                       type: array
 *                     promotions:
 *                       type: array                 
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:id', shopController.getShopById);

/**
 * @openapi
 * /api/shops/promotion:
 *   post:
 *     summary: Add a promotion
 *     description: Add a promotion to an existing shopS.
 *     tags:
 *       - Shops
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               description:
 *                 type: string
 *                 description: A brief description of the promotion
 *                 example: "Formaggio buono scontato"
 *               value:
 *                 type: string
 *                 description: Value of the promotion
 *                 example: "Due al prezzo di uno - 20%"
 *     responses:
 *       200:
 *         description: Promotion added to the shop

 *       400:
 *         description: Date error
 *       500:
 *         description: Internal server error.
 */
router.post('/promotion', authMiddleware.autenticateToken, shopController.addPromotion);


/**
 * @openapi
 * /api/shops/promotion:
 *   delete:
 *     summary: Delete a promotion
 *     description: Removes a promotion for the authenticated vendor based on its description.
 *     tags:
 *       - Promotions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *         description: Description of the promotion to delete
 *     responses:
 *       200:
 *         description: Promotion successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Promotion removed
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Updated list of promotions
 *       400:
 *         description: Bad request (e.g., missing description)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Description is required
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.delete('/promotion', authMiddleware.autenticateToken, shopController.deletePromotion);


/**
 * @openapi
 * /api/event:
 *   post:
 *     summary: Add a new event
 *     description: Creates a new event for the authenticated user's shop
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 example: Summer Sale
 *               description:
 *                 type: string
 *                 example: Big discounts on all items
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T10:00:00Z
 *     responses:
 *       200:
 *         description: Event added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields or invalid date
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/event', authMiddleware.autenticateToken, shopController.addEvent);

/**
 * @openapi
 * /api/event/delete:
 *   delete:
 *     summary: Delete an event
 *     description: Deletes an event from the authenticated user's shop using the event name
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Summer Sale
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required field (name)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/event', authMiddleware.autenticateToken, shopController.deleteEvent);


/**
 * @openapi
 * /api/shops/{shopId}/feedback:
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
router.post('/:shopId/feedback', authMiddleware.autenticateToken, shopController.addFeedback);


/**
 * @openapi
 * /api/shops/update:
 *   put:
 *     summary: Update shop data
 *     description: Allows a vendor to update their shop information
 *     tags:
 *       - Shops 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Frutta Mario"
 *               description:
 *                 type: string
 *                 example: "Il migliore fruttivendolo di Trento"
 *               itinerario:
 *                 type: object
 *                 example:
 *                   lunedi:
 *                     mattina:
 *                       latitudine: 46.07
 *                       longitudine: 11.12
 *                       indirizzo: "Via Roma, Trento"
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *               promotions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     value:
 *                       type: number
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *       400:
 *         description: No data provided
 *       403:
 *         description: Not a vendor
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Internal server error
 */
router.put('/update', authMiddleware.autenticateToken, shopController.updateShop);


module.exports = router;