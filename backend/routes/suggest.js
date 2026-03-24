const express = require('express');
const router = express.Router();
const { suggestDiet, refreshMeal, getFoods } = require('../controllers/suggestController');

router.post('/suggest', suggestDiet);
router.post('/refresh-meal', refreshMeal);
router.get('/foods', getFoods);

module.exports = router;
