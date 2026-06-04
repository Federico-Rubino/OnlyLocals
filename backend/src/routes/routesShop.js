const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/shops/register:
 *   post:
 *     summary: Register a new shop
 *     description: Creates a shop for the authenticated user. The caller becomes the shop owner. Geolocation is computed automatically from itinerary slot coordinates.
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
 *                 description: ID of the fidelity card manager (optional)
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *               itinerario:
 *                 type: object
 *                 description: Weekly schedule. Keys are day names, values are slot objects (morning/afternoon/evening) each containing lat/lng.
 *                 example:
 *                   lunedi:
 *                     mattina:
 *                       latitudine: 46.07
 *                       longitudine: 11.12
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
 *                   example: "Shop registered successfully"
 *                 newRole:
 *                   type: string
 *                   example: "owner"
 *                 id:
 *                   type: string
 *                   example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *       400:
 *         description: Validation error (e.g. missing name or category)
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
 *                   example: "Shop registration failed"
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/register', authMiddleware.autenticateToken, shopController.registerShop);

/**
 * @openapi
 * /api/shops/search:
 *   get:
 *     summary: Search shops
 *     description: Returns shops filtered by name, category, and/or location. Combine any filters freely.
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by shop name (partial match)
 *         example: "bottega"
 *       - in: query
 *         name: category
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         explode: true
 *         description: Filter by one or more categories
 *         example: ["food", "italian"]
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude for geolocation filter
 *         example: 46.07
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude for geolocation filter
 *         example: 11.12
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in km (used with lat/lng)
 *         example: 10
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [lunedi, martedi, mercoledi, giovedi, venerdi, sabato, domenica]
 *         description: Filter by day of the week the shop is active
 *       - in: query
 *         name: slot
 *         schema:
 *           type: string
 *           enum: [mattina, pomeriggio, sera]
 *         description: Filter by time slot (used with day)
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
 *                   example: true
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/search', shopController.searchShops);

/**
 * @openapi
 * /api/shops/stats:
 *   get:
 *     summary: Get shop statistics
 *     description: Returns statistics for the authenticated vendor's shop (saves, average rating, feedback history, access map).
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     nomeShop:
 *                       type: string
 *                       example: "La Bottega Italiana"
 *                     statistiche:
 *                       type: object
 *                       properties:
 *                         numSalvataggi:
 *                           type: integer
 *                           example: 42
 *                         votoMedio:
 *                           type: number
 *                           example: 4.3
 *                         totalFeedback:
 *                           type: integer
 *                           example: 10
 *                         mappaAccessi:
 *                           type: array
 *                           items:
 *                             type: object
 *                         storicoFeedback:
 *                           type: array
 *                           items:
 *                             type: object
 *                         ultimoAggiornamento:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
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
 *                   example: "Not a vendor"
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
 *     summary: Get shop by ID
 *     description: Returns full details of a shop. If the caller is the shop owner, the fidelityCardManager field is also included.
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *         example: "64f1c2a8b9d1e2f3a4b5c6d7"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     category:
 *                       type: string
 *                     itinerario:
 *                       type: object
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                     promotions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     statistiche:
 *                       type: object
 *                       properties:
 *                         votoMedio:
 *                           type: number
 *                         totaleFeedback:
 *                           type: integer
 *                         storicoFeedback:
 *                           type: array
 *                           items:
 *                             type: object
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware.optionalAuth, shopController.getShopById);

/**
 * @openapi
 * /api/shops/promotion:
 *   post:
 *     summary: Add a promotion
 *     description: Adds a time-limited promotion to the authenticated vendor's shop. Start date must be in the future and end date must be after start date.
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
 *                 example: "Summer discount on cheese"
 *               value:
 *                 type: string
 *                 example: "20% off"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Promotion added
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
 *                   example: "Promotion added to"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Updated promotions list
 *       400:
 *         description: Invalid dates (start in the past, or end before start)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Start date must be in present or in future"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a promotion
 *     description: Removes a promotion from the authenticated vendor's shop identified by its description.
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
 *         example: "Summer discount on cheese"
 *     responses:
 *       200:
 *         description: Promotion removed
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
 *                   example: "Promotion removed"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Updated promotions list
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/promotion', authMiddleware.autenticateToken, shopController.addPromotion);
router.delete('/promotion', authMiddleware.autenticateToken, shopController.deletePromotion);

/**
 * @openapi
 * /api/shops/event:
 *   post:
 *     summary: Add an event
 *     description: Adds a new event to the authenticated vendor's shop. The event date must be in the future.
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
 *                 example: "Summer Sale"
 *               description:
 *                 type: string
 *                 example: "Big discounts on all items"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T10:00:00Z"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event added successfully"
 *                 data:
 *                   type: object
 *                   description: The created event
 *       400:
 *         description: Event date is in the past
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
 *                   example: "Event date must be in the future."
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       409:
 *         description: An event with this name already exists
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
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an event
 *     description: Removes an event from the authenticated vendor's shop by event name.
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
 *                 example: "Summer Sale"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Updated events list
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/event', authMiddleware.autenticateToken, shopController.addEvent);
router.delete('/event', authMiddleware.autenticateToken, shopController.deleteEvent);

/**
 * @openapi
 * /api/shops/fidelity/scan:
 *   post:
 *     summary: Scan fidelity card (visit mode)
 *     description: Adds 1 point to a customer's fidelity card by scanning their barcode. Only works for shops configured in visit-based point mode.
 *     tags:
 *       - Fidelity
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
 *                 example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Point added successfully
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
 *                   example: "Punto aggiunto con successo"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing barcode or shop is in purchase-based mode (use addPoints instead)
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
 *                   example: "Barcode obbligatorio"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       404:
 *         description: Fidelity card not found
 *       409:
 *         description: Fidelity card manager not configured for this shop
 *       500:
 *         description: Internal server error
 */
router.post('/fidelity/scan', authMiddleware.autenticateToken, shopController.scanFidelityCard);

/**
 * @openapi
 * /api/shops/fidelity/vantaggi:
 *   get:
 *     summary: Get fidelity benefits
 *     description: Returns the list of fidelity benefits (vantaggi) configured for the authenticated vendor's shop.
 *     tags:
 *       - Fidelity
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of benefits
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
 *                       descrizione:
 *                         type: string
 *                         example: "10% discount"
 *                       valore:
 *                         type: number
 *                         example: 10
 *                       sogliaPunti:
 *                         type: integer
 *                         example: 50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Set fidelity benefits
 *     description: Sets the list of fidelity benefits for the authenticated vendor's shop. Can only be updated once every 3 months.
 *     tags:
 *       - Fidelity
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vantaggi
 *             properties:
 *               vantaggi:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     descrizione:
 *                       type: string
 *                       example: "10% discount"
 *                     valore:
 *                       type: number
 *                       example: 10
 *                     sogliaPunti:
 *                       type: integer
 *                       example: 50
 *     responses:
 *       200:
 *         description: Benefits updated successfully
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
 *                   example: "Vantaggi aggiornati con successo"
 *                 data:
 *                   type: object
 *       400:
 *         description: No benefits provided
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
 *                   example: "Vantaggi non forniti"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Benefits cannot be changed within 3 months of the last update
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
 *       500:
 *         description: Internal server error
 */
router.get('/fidelity/vantaggi', authMiddleware.autenticateToken, shopController.getVantaggi);
router.put('/fidelity/vantaggi', authMiddleware.autenticateToken, shopController.setVantaggi);

/**
 * @openapi
 * /api/shops/fidelity/scan/addPoints:
 *   post:
 *     summary: Add points based on purchase amount
 *     description: Converts a purchase amount to points using the shop's conversion rate and adds them to the customer's fidelity card. Only works for shops configured in purchase-based point mode.
 *     tags:
 *       - Fidelity
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
 *                 example: "64abc123def456"
 *               importo:
 *                 type: number
 *                 description: Purchase amount in euros (must be > 0)
 *                 example: 50
 *     responses:
 *       200:
 *         description: Points added successfully
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
 *                   example: "Punti aggiunti con successo"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing/invalid barcode or importo, shop is in visit-based mode (use scan instead), or conversion rate not configured
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
 *                   example: "Barcode e importo obbligatori"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       404:
 *         description: Fidelity card not found
 *       409:
 *         description: Fidelity card manager not configured for this shop
 *       500:
 *         description: Internal server error
 */
router.post('/fidelity/scan/addPoints', authMiddleware.autenticateToken, shopController.addPoints);

/**
 * @openapi
 * /api/shops/fidelity/scan/redeem:
 *   post:
 *     summary: Redeem a fidelity benefit
 *     description: Redeems a fidelity benefit for a customer by scanning their barcode. The customer must have enough points to cover the benefit threshold.
 *     tags:
 *       - Fidelity
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
 *                 example: "64abc123def456"
 *               descrizioneVantaggio:
 *                 type: string
 *                 description: Description of the benefit to redeem
 *                 example: "10% discount"
 *     responses:
 *       200:
 *         description: Benefit redeemed successfully
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
 *                   example: "Vantaggio riscattato con successo"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields or not enough points
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
 *                   example: "Not enough points"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Fidelity card or benefit not found
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
 *                   example: "Fidelity card not found"
 *       500:
 *         description: Internal server error
 */
router.post('/fidelity/scan/redeem', authMiddleware.autenticateToken, shopController.redeemVantaggio);

/**
 * @openapi
 * /api/shops/fidelity/modifyConversion:
 *   put:
 *     summary: Set point conversion rate
 *     description: Sets how many euros a customer must spend to earn 1 point. Must be greater than 0.
 *     tags:
 *       - Fidelity
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
 *                 description: Euros required per 1 point (e.g. 10 means €10 = 1 point)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Conversion rate updated
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
 *                   example: "Tasso di conversione aggiornato"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing tasso or tasso is not greater than 0
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
 *                   example: "Tasso di conversione obbligatorio"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       500:
 *         description: Internal server error
 */
router.put('/fidelity/modifyConversion', authMiddleware.autenticateToken, shopController.modifyConversion);

/**
 * @openapi
 * /api/shops/{shopId}/feedback:
 *   post:
 *     summary: Add feedback to a shop
 *     description: Submits a rating and optional comment for a shop. Only customers can leave feedback.
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
 *         description: ID of the shop to review
 *         example: "64f1c2a8b9d1e2f3a4b5c6d7"
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
 *                 description: Rating from 1 to 5
 *                 example: 4
 *               commento:
 *                 type: string
 *                 description: Optional comment
 *                 example: "Great service!"
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
 *                 message:
 *                   type: string
 *                   example: "Feedback aggiunto con successo"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid or missing rating (must be 1–5)
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
 *                   example: "Il voto deve essere compreso tra 1 e 5"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop or user not found
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
router.post('/:shopId/feedback', authMiddleware.autenticateToken, shopController.addFeedback);

/**
 * @openapi
 * /api/shops/update:
 *   put:
 *     summary: Update shop data
 *     description: Updates the authenticated vendor's shop information. At least one field must be provided.
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
 *                       type: string
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Shop updated successfully"
 *                 results:
 *                   type: object
 *       400:
 *         description: No data provided
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
 *                   example: "No data provided for update."
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a vendor
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Internal server error
 */
router.put('/update', authMiddleware.autenticateToken, shopController.updateShop);

module.exports = router;
