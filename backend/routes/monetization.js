const express = require('express');
const router = express.Router();
const monetizationController = require('../controllers/monetizationController');

router.get('/plans', monetizationController.getMonetizationPlans);
router.get('/plans/:id', monetizationController.getMonetizationPlanById);
router.post('/plans', monetizationController.createMonetizationPlan);
router.put('/plans/:id', monetizationController.updateMonetizationPlan);
router.delete('/plans/:id', monetizationController.deleteMonetizationPlan);
router.get('/records', monetizationController.getMonetizationRecords);
router.post('/records', monetizationController.addMonetizationRecord);

module.exports = router;
