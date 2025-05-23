const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const UserController = require('../controllers/UserController');

router.get('/:id', authMiddleware(['admin', 'ticket_buyer', 'event_creator']), UserController.getUserById);




module.exports = router;