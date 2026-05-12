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


module.exports = router;