const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware');
/**
 * @openapi
 * /api/shops/register:
 *   post:
 *     summary: Register a new shop
 *     description: Creates a shop using itinerary-based geolocation. Locations are automatically computed from itinerary slots.
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
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "La Bottega Italiana"
 *               description:
 *                 type: string
 *                 example: "Shop specializing in Italian products"
 *               category:
 *                 type: string
 *                 example: "food"
 *               fidelityCardManager:
 *                 type: string
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *               itinerario:
 *                 type: object
 *                 description: Weekly schedule with optional geolocation per slot
 *                 additionalProperties:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       latitudine:
 *                         type: number
 *                         example: 45.4642
 *                       longitudine:
 *                         type: number
 *                         example: 9.1900
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: []
 *               promotions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: []
 *     responses:
 *       201:
 *         description: Shop registered successfully
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
 *                   example: Shop registered successfully
 *                 newRole:
 *                   type: string
 *                   example: owner
 *                 id:
 *                   type: string
 *                   example: 64f1c2a8b9d1e2f3a4b5c6d7
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
 * /api/shops/stats:
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
router.get('/stats', authMiddleware.autenticateToken, shopController.getStatistiche);

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
 *     description: Add a promotion to an existing shop.
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
 *             required:
 *               - description
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Formaggio buono scontato"
 *               value:
 *                 type: string
 *                 example: "Due al prezzo di uno - 20%"
 *     responses:
 *       200:
 *         description: Promotion added to the shop
 *       400:
 *         description: Date error
 *       500:
 *         description: Internal server error
 */
router.post('/promotion', authMiddleware.autenticateToken, shopController.addPromotion);


/**
 * @openapi
 * /api/shops/promotion:
 *   delete:
 *     summary: Delete a promotion
 *     description: Removes a promotion for the authenticated vendor based on its description.
 *     tags:
 *       - Shops
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
 * /api/shops/event:
 *   post:
 *     summary: Add a new event
 *     description: Creates a new event for the authenticated user's shop
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
 * /api/shops/event/delete:
 *   delete:
 *     summary: Delete an event
 *     description: Deletes an event from the authenticated user's shop using the event name
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
 * /api/shops/fidelity/scan:
 *   post:
 *     summary: Scan fidelity card
 *     description: Scan a customer fidelity card and add 1 point
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
 *             required:
 *               - barcode
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: "64abc123..."
 *     responses:
 *       200:
 *         description: Punto aggiunto
 *       404:
 *         description: Fidelity card not found
 *       403:
 *         description: Not a vendor
 */
router.post('/fidelity/scan', authMiddleware.autenticateToken, shopController.scanFidelityCard);

/**
 * @openapi
 * /api/shops/fidelity/vantaggi:
 *   put:
 *     summary: Set fidelity vantaggi
 *     description: Set fidelity vantaggi for the shop (max once every 3 months)
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
 *               vantaggi:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descrizione:
 *                       type: string
 *                     valore:
 *                       type: number
 *                     sogliaPunti:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Vantaggi aggiornati
 *       403:
 *         description: Non modificabile
 */
router.put('/fidelity/vantaggi', authMiddleware.autenticateToken, shopController.setVantaggi);

/**
 * @openapi
 * /api/shops/fidelity/vantaggi:
 *   get:
 *     summary: Get fidelity vantaggi
 *     description: Returns the fidelity vantaggi of the vendor's shop
 *     tags:
 *       - Shops
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista vantaggi
 */
router.get('/fidelity/vantaggi', authMiddleware.autenticateToken, shopController.getVantaggi);

/**
 * @openapi
 * /api/shops/fidelity/scan/addPoints:
 *   post:
 *     summary: Scan card and add points
 *     description: Scan customer fidelity card and add points based on purchase amount
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
 *             required:
 *               - barcode
 *               - importo
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: "64abc123..."
 *               importo:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Punti aggiunti
 *       404:
 *         description: Fidelity card not found
 */
router.post('/fidelity/scan/addPoints', authMiddleware.autenticateToken, shopController.addPoints);

/**
 * @openapi
 * /api/shops/fidelity/scan/redeem:
 *   post:
 *     summary: Redeem a vantaggio
 *     description: Vendor scans customer card and redeems a vantaggio
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
 *             required:
 *               - barcode
 *               - descrizioneVantaggio
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: "64abc123..."
 *               descrizioneVantaggio:
 *                 type: string
 *                 example: "Sconto 10%"
 *     responses:
 *       200:
 *         description: Vantaggio riscattato
 *       400:
 *         description: Not enough points
 *       404:
 *         description: Fidelity card not found
 */
router.post('/fidelity/scan/redeem', authMiddleware.autenticateToken, shopController.redeemVantaggio);


/**
 * @openapi
 * /api/shops/fidelity/modifyConversion:
 *   put:
 *     summary: Modify conversion rate
 *     description: Set how many euros correspond to 1 point
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
 *             required:
 *               - tasso
 *             properties:
 *               tasso:
 *                 type: number
 *                 example: 10
 *                 description: "Euros needed for 1 point (es. 10 = 10€ = 1 punto)"
 *     responses:
 *       200:
 *         description: Tasso aggiornato
 *       403:
 *         description: Not a vendor
 */
router.put('/fidelity/modifyConversion', authMiddleware.autenticateToken, shopController.modifyConversion);

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
 * /api/shops/{shopId}/feedback:
 *   post:
 *     summary: Add feedback to a shop
 *     description: Allows an authenticated user to leave a feedback on a shop
 *     tags:
 *       - Shops
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