const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const errorMiddleware = require('../middlewares/errorMiddleware');

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new general user account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid input data
 */
router.post('/register', errorMiddleware.validateRegisterData, userController.register);


/**
 * @openapi
 * /api/users/shops/{id}:
 *   get:
 *     summary: Get a single shop by ID
 *     description: Returns all info of a specific commercial activity
 *     tags:
 *       - Users
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
router.get('/shops/:id', userController.getShopById);

module.exports = router;