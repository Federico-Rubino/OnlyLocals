const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const errorMiddleware = require('../middlewares/errorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account. The user starts with a "pending" role until setAsCustomer is called.
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
 *               - name
 *               - surname
 *               - password
 *               - bornDate
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "mario.rossi@example.com"
 *               name:
 *                 type: string
 *                 example: "Mario"
 *               surname:
 *                 type: string
 *                 example: "Rossi"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123!"
 *               bornDate:
 *                 type: string
 *                 description: Date of birth in YYYYMMDD format
 *                 example: "19990501"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *                 email:
 *                   type: string
 *                   example: "mario.rossi@example.com"
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing fields"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/register', errorMiddleware.validateRegisterData, userController.register);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email/username and password, returning access and refresh tokens.
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
 *                 description: Email or username
 *                 example: "mario.rossi@example.com"
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
 *                   example: "Login ok"
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (short-lived)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (long-lived)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing identifier or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request. Missing identifier or password."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error
 */
router.post('/login', userController.login);

/**
 * @openapi
 * /api/users/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     description: Issues a new access token and refresh token pair using a valid existing refresh token.
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
 *                   example: "Refresh ok"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "refresh token absent"
 *       500:
 *         description: Internal server error
 */
router.post('/refreshToken', userController.refreshToken);

/**
 * @openapi
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     description: Revokes the provided refresh token, ending the session for that device.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log out OK"
 *       400:
 *         description: Missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh Token missing"
 *       500:
 *         description: Internal server error
 */
router.post('/logout', userController.logout);

/**
 * @openapi
 * /api/users/setAsCustomer:
 *   patch:
 *     summary: Activate customer role
 *     description: Transitions the authenticated user from "pending" to "customer" role.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is now a customer
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
 *                   example: "User set as customer"
 *                 results:
 *                   type: object
 *                   description: Updated user object
 *       400:
 *         description: User is not in pending state
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
 *                   example: "User is not pending"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/setAsCustomer', authMiddleware.autenticateToken, userController.setAsCustomer);

/**
 * @openapi
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Updates the authenticated user's personal information. At least one field must be provided.
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
 *             properties:
 *               username:
 *                 type: string
 *                 example: "mario_rossi"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new.email@example.com"
 *               name:
 *                 type: string
 *                 example: "Mario"
 *               surname:
 *                 type: string
 *                 example: "Rossi"
 *               bornDate:
 *                 type: string
 *                 example: "19990501"
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
 *                   example: "Profile updated successfully"
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
 *                   example: "No data provided."
 *       401:
 *         description: Unauthorized
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
 *                   example: "User not found"
 *       409:
 *         description: Email or username already in use
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
 *                   example: "Email already in use"
 *       500:
 *         description: Internal server error
 */
router.patch('/profile', authMiddleware.autenticateToken, userController.updatePersonalData);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user data
 *     description: Returns the authenticated user's personal information.
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Mario"
 *                     surname:
 *                       type: string
 *                       example: "Rossi"
 *                     email:
 *                       type: string
 *                       example: "mario.rossi@example.com"
 *                     bornDate:
 *                       type: string
 *                       example: "19990501"
 *                     role:
 *                       type: string
 *                       example: "customer"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/me', authMiddleware.autenticateToken, userController.getUserData);

/**
 * @openapi
 * /api/users/favorites:
 *   get:
 *     summary: Get favorite shops
 *     description: Returns the authenticated user's favorite shops with full details.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite shops
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
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Add shop to favorites
 *     description: Adds the specified shop to the authenticated user's favorites list.
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
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: Shop added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shop added to favorites"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of favorite shop IDs
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
 *                   example: "shopId needed."
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Remove shop from favorites
 *     description: Removes the specified shop from the authenticated user's favorites list.
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
 *                 example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: Shop removed from favorites
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
 *                   example: "Shop removed from favorites"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of favorite shop IDs
 *       400:
 *         description: Missing shopId or shop not in favorites
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
 *                   example: "shopId needed"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/favorites', authMiddleware.autenticateToken, userController.getFavorites);
router.post('/favorites', authMiddleware.autenticateToken, userController.addShopToFavorites);
router.delete('/favorites', authMiddleware.autenticateToken, userController.removeShopFromFavorites);

/**
 * @openapi
 * /api/users/fidelity/points:
 *   get:
 *     summary: Get fidelity points
 *     description: Returns the fidelity points the authenticated user has accumulated across all shops.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fidelity points per shop
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
 *                       activity:
 *                         type: string
 *                         description: Shop name
 *                         example: "La Bottega Italiana"
 *                       count:
 *                         type: integer
 *                         description: Points accumulated at that shop
 *                         example: 12
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Fidelity card not found
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
router.get('/fidelity/points', authMiddleware.autenticateToken, userController.getPoints);

/**
 * @openapi
 * /api/users/pushToken:
 *   patch:
 *     summary: Save push notification token
 *     description: Saves or updates the device push notification token for the authenticated user.
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
 *               - pushToken
 *             properties:
 *               pushToken:
 *                 type: string
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Push token saved
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
 *                   example: "Push token saved"
 *       400:
 *         description: Missing pushToken
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
 *                   example: "pushToken required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/pushToken', authMiddleware.autenticateToken, userController.savePushToken);

/**
 * @openapi
 * /api/users/notifications:
 *   get:
 *     summary: Get notifications
 *     description: Returns all notifications for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
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
 *                       _id:
 *                         type: string
 *                       message:
 *                         type: string
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', authMiddleware.autenticateToken, userController.getNotifications);

/**
 * @openapi
 * /api/users/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks every notification of the authenticated user as read.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/notifications/read-all', authMiddleware.autenticateToken, userController.markAllNotificationsRead);

/**
 * @openapi
 * /api/users/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     description: Marks a single notification as read by its ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *         example: "64f1c2a8b9d1e2f3a4b5c6d7"
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/notifications/:notificationId/read', authMiddleware.autenticateToken, userController.markNotificationRead);

/**
 * @openapi
 * /api/users/searches:
 *   get:
 *     summary: Get saved searches
 *     description: Returns the authenticated user's saved searches.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved searches
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
 *                       name:
 *                         type: string
 *                         example: "pizza"
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["food", "italian"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Save a search
 *     description: Saves a search filter (name and/or categories) to the authenticated user's account. Only customers can save searches.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Search term (at least one of name or categories must be provided)
 *                 example: "pizza"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["food", "italian"]
 *     responses:
 *       200:
 *         description: Search saved successfully
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
 *                   description: Updated list of saved searches
 *       400:
 *         description: Neither name nor categories provided
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
 *                   example: "name or categories required"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only customers can save searches
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
 *                   example: "Only customers can save searches"
 *       409:
 *         description: Search already saved
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
 *                   example: "Search already saved"
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Remove a saved search
 *     description: Removes a saved search from the authenticated user's account.
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
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: The search string to remove
 *                 example: "pizza"
 *     responses:
 *       200:
 *         description: Search removed successfully
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
 *                   description: Updated list of saved searches
 *       400:
 *         description: Missing search string or search not found
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
 *                   example: "search string required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/searches', authMiddleware.autenticateToken, userController.getSavedSearches);
router.post('/searches', authMiddleware.autenticateToken, userController.saveSearch);
router.delete('/searches', authMiddleware.autenticateToken, userController.removeSearch);

module.exports = router;
