const EventController = require('../controllers/EventController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const express = require('express');
const router = express.Router();

router.post('/create', authMiddleware(['event_creator']), EventController.createEvent);

module.exports = router;