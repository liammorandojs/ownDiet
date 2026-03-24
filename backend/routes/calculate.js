const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { calculateMacros, getHistory, deleteHistoryItem } = require('../controllers/calculateController');

router.post('/calculate', calculateMacros);
router.get('/history', authMiddleware, getHistory);
router.delete('/history/:id', authMiddleware, deleteHistoryItem);

module.exports = router;
