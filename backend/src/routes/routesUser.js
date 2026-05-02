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
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user using either their email or username and returns a JWT token for accessing protected routes.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: The user's registered email or username.
 *                 example: "mariorossi92"
 *               password:
 *                 type: string
 *                 description: The user's plain text password.
 *                 example: "MySuperSecretPassword123!"
 *     responses:
 *       200:
 *         description: Login successful. Returns the JWT authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: Bearer token to be used in the Authorization header.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request. Missing identifier or password.
 *       401:
 *         description: Unauthorized. Invalid credentials provided.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', userController.login);

router.post('/refreshToken', userController.refreshToken);
module.exports = router;