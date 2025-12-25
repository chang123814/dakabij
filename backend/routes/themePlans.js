const express = require('express');
const router = express.Router();
const themePlanController = require('../controllers/themePlanController');

router.get('/plans', themePlanController.getThemePlans);
router.get('/plans/:id', themePlanController.getThemePlanById);
router.post('/plans', themePlanController.createThemePlan);
router.put('/plans/:id', themePlanController.updateThemePlan);
router.delete('/plans/:id', themePlanController.deleteThemePlan);
router.get('/contents', themePlanController.getThemeContents);
router.post('/contents', themePlanController.addThemeContent);

module.exports = router;
