const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.post(
    '/book',
    authMiddleware(['ticket_buyer']),
    TicketController.bookTicket
);

router.delete(
    '/:ticketId/cancel',
    authMiddleware(['ticket_buyer']),
    TicketController.cancelTicket
);

router.post(
    '/check-in',
    authMiddleware(['event_creator']),
    TicketController.checkInTicket
);



router.get(
    '/:ticketId',
    authMiddleware(['admin', 'event_creator', 'ticket_buyer']),
    TicketController.getTicketById
);

module.exports = router;