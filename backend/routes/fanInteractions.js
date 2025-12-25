const express = require('express');
const router = express.Router();
const fanInteractionController = require('../controllers/fanInteractionController');

router.get('/', fanInteractionController.getFanInteractions);
router.get('/stats', fanInteractionController.getInteractionStats);
router.get('/:id', fanInteractionController.getFanInteractionById);
router.post('/', fanInteractionController.createFanInteraction);
router.put('/:id', fanInteractionController.updateFanInteraction);
router.delete('/:id', fanInteractionController.deleteFanInteraction);

module.exports = router;
