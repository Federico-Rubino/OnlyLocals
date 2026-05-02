const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

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
router.post('/register', shopController.registerShop);
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



module.exports = router;