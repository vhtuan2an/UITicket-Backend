const CategoryController = require('../controllers/CategoryController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const express = require('express');
const router = express.Router();

router.post('/create', authMiddleware(['admin']), CategoryController.craeteCategory);
router.get('/', authMiddleware(['admin', 'ticket_buyer', 'event_creator']), CategoryController.getCategories);

module.exports = router;