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

router.get(
     '/', 
     authMiddleware(['admin','event_creator', 'ticket_buyer']), 
     EventController.getEvent
);

router.get(
     '/search', 
     authMiddleware(['admin','event_creator', 'ticket_buyer']),
     EventController.searchEvent
)

router.get('/:id', authMiddleware(['admin','event_creator', 'ticket_buyer']), EventController.getEventById);



module.exports = router;