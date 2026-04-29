const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
* @openapi
* /api/users/register::
*   post:
*       description: register a new user!
*       responses:
*           200:
*               description: Returns resgistered user data.
*/
router.post('/register', userController.register);

router.get('/', userController.getUsers);

module.exports = router;