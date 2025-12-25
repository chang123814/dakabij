const express = require('express');
const router = express.Router();
const contentPublishController = require('../controllers/contentPublishController');

router.get('/', contentPublishController.getContentPublishes);
router.get('/:id', contentPublishController.getContentPublishById);
router.post('/', contentPublishController.createContentPublish);
router.put('/:id', contentPublishController.updateContentPublish);
router.delete('/:id', contentPublishController.deleteContentPublish);
router.patch('/:id/stats', contentPublishController.updatePublishStats);

module.exports = router;
