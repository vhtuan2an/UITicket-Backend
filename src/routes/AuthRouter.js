const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.post('/register', AuthController.createUser);
router.post('/login', AuthController.loginUser);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;