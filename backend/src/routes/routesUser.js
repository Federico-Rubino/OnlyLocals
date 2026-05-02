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
 *       - Authentication
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
 *       - Authentication
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

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh Tokens
 *     description: Exchanges an old refresh token for a new access token and a new refresh token (implementing refresh token rotation).
 *     requestBody:
 *       required: true
 *       description: The current, valid refresh token.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldRefreshToken
 *             properties:
 *               oldRefreshToken:
 *                 type: string
 *                 description: The JWT refresh token currently stored on the client's device.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi..."
 *     responses:
 *       201:
 *         description: Successfully generated new tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh ok"
 *                 accessToken:
 *                   type: string
 *                   description: The new short-lived access token.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuZXdBY2Nlc3Mi..."
 *                 refreshToken:
 *                   type: string
 *                   description: The new long-lived refresh token.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuZXdSZWZyZXNo..."
 *       401:
 *         description: Unauthorized. The token is missing, invalid, or has been revoked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "refresh token absent"
 *       500:
 *         description: Internal Server Error. An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error details"
 */
router.post('/refreshToken', userController.refreshToken);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User Logout
 *     description: Logs out the current user by revoking the provided refresh token from the database, effectively ending that specific device's session.
 *     requestBody:
 *       required: true
 *       description: The refresh token that needs to be revoked.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The JWT refresh token currently stored on the client's device.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N..."
 *     responses:
 *       200:
 *         description: Successfully logged out. The token has been removed from the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log out OK"
 *       400:
 *         description: Bad Request. The refresh token was missing from the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh Token missing"
 *       500:
 *         description: Internal Server Error. Something went wrong while updating the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error during logout"
 */
router.post('/logout', userController.logout);
module.exports = router;