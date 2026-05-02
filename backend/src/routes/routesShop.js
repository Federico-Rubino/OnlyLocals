const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

/**
 * @openapi
 * /api/shops/register:
 *   post:
 *     summary: Register a new commercial activity
 *     description: Creates a new shop including weekly itinerary, events, promotions, loyalty system, and statistics.
 *     tags:
 *       - Shops
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Central Museum"
 *             description: "Tourist shop in the city center"
 *             itinerario:
 *               lunedi:
 *                 mattina:
 *                   latitudine: 45.4642
 *                   longitudine: 9.19
 *                   indirizzo: "Piazza Duomo, Milan"
 *     responses:
 *       201:
 *         description: Shop successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Invalid request data (validation failed)
 *       500:
 *         description: Internal server error
 */


router.post('/register', shopController.registerShop);

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