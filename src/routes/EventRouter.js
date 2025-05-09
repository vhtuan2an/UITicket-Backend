const EventController = require('../controllers/EventController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const uploadImage = require('../middlewares/UploadImage');
const express = require('express');
const router = express.Router();

router.post('/create',
     authMiddleware(['event_creator']), 
     uploadImage.array('images', 5),
     EventController.createEvent
);

module.exports = router;