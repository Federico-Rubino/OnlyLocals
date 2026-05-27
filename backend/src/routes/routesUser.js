const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const errorMiddleware = require('../middlewares/errorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/shops/register:
 *   post:
 *     summary: Register a new shop
 *     description: Creates a shop with itinerary, events, promotions, and automatically computes geolocation data from itinerary slots.
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
 *                 example: "Shop specializing in Italian food products"
 *               category:
 *                 type: string
 *                 example: "food"
 *               fidelityCardManager:
 *                 type: string
 *                 description: ID of fidelity card manager (if applicable)
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *               itinerario:
 *                 type: object
 *                 description: Weekly schedule with time slots and optional geolocation
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
 *                       location:
 *                         type: object
 *                         description: Auto-generated from latitudine/longitudine
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
 *                   example: Shop registration failed
 *                 error:
 *                   type: string
 *                   example: Name is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/register', errorMiddleware.validateRegisterData, userController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email/username and password, returning access and refresh tokens.
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
 *                 description: Email or username used to identify the user
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123!"
 *     responses:
 *       201:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login ok
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *       400:
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bad request. Missing identifier or password.
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
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
router.post('/login', userController.login);

/**
 * @openapi
 * /api/auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token and refresh token using a valid refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldRefreshToken
 *             properties:
 *               oldRefreshToken:
 *                 type: string
 *                 description: Existing refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       201:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh ok
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *       401:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: refresh token absent
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh Token not valid or revoked
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


/**
 * @openapi
 * /api/users/favorites:
 *   post:
 *     summary: Add a shop to favorites
 *     description: Adds a shop to the authenticated user's favorites list.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopId
 *             properties:
 *               shopId:
 *                 type: string
 *                 description: ID of the shop to add to favorites
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: Shop successfully added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shop added to favorites
 *                 results:
 *                   type: object
 *                   description: Updated favorites list or user object
 *       400:
 *         description: Missing shopId
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
 *                   example: shopId needed.
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
router.post('/favorites', authMiddleware.autenticateToken, userController.addShopToFavorites);

/**
 * @openapi
 * /api/users/favorites:
 *   delete:
 *     summary: Remove a shop from favorites
 *     description: Removes a shop from the authenticated user's favorites list.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopId
 *             properties:
 *               shopId:
 *                 type: string
 *                 description: ID of the shop to remove from favorites
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: Shop successfully removed from favorites
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
 *                   example: Shop removed from favorites
 *                 results:
 *                   type: object
 *                   description: Updated favorites list or user object
 *       400:
 *         description: Bad request (missing shopId or shop not in favorites)
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
 *                   example: shopId needed
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 */
router.delete('/favorites', authMiddleware.autenticateToken, userController.removeShopFromFavorites);

/**
 * @openapi
 * /api/users/setAsCustomer:
 *   patch:
 *     summary: Set user as customer
 *     description: Updates the authenticated user's status to customer.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully set as customer
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
 *                   example: User set as customer
 *                 results:
 *                   type: object
 *                   description: Updated user object
 *       400:
 *         description: Invalid state (user not pending)
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
 *                   example: User is not pending
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
router.patch('/setAsCustomer', authMiddleware.autenticateToken, userController.setAsCustomer);

/**
 * @openapi
 * /api/users/profile:
 *   patch:
 *     summary: Update user personal data
 *     description: Updates the authenticated user's personal profile information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update (all fields are optional, but at least one is required)
 *             additionalProperties: true
 *             example:
 *               username: "newUsername"
 *               email: "newemail@example.com"
 *               firstName: "Mario"
 *               lastName: "Rossi"
 *               bornDate: "19990501"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 results:
 *                   type: object
 *                   description: Updated user object
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
 *                   example: No data provided.
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
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
 *                   example: User not found
 *       409:
 *         description: Conflict (email or username already in use)
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
 *                   example: Email already in use
 *       500:
 *         description: Internal server error
 */
router.patch('/profile', authMiddleware.autenticateToken, userController.updatePersonalData);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get personal data
 *     description: Returns the authenticated user's personal data
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
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
 *                     surname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bornDate:
 *                       type: string
 *                     role:
 *                       type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/me', authMiddleware.autenticateToken, userController.getUserData);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     summary: Delete account
 *     description: Permanently deletes the authenticated user's account. If the user is a vendor, their shop is also deleted and removed from all users' saved shops.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
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
 *                   example: Account deleted successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/me', authMiddleware.autenticateToken, userController.deleteAccount);

module.exports = router;