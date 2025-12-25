const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/dashboard', statisticsController.getDashboardOverview);
router.get('/tasks', statisticsController.getTaskStatistics);
router.get('/content', statisticsController.getContentStatistics);
router.get('/interactions', statisticsController.getFanInteractionStatistics);
router.get('/monetization', statisticsController.getMonetizationStatistics);

module.exports = router;
