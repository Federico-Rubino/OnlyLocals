const express = require('express');
const router = express.Router();
const Shop = require('../models/shopModel');
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
 *           schema:
 *             $ref: '#/components/schemas/Shop'
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

module.exports = router;