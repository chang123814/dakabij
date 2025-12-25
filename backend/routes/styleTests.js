const express = require('express');
const router = express.Router();
const styleTestController = require('../controllers/styleTestController');

router.get('/', styleTestController.getStyleTests);
router.get('/:id', styleTestController.getStyleTestById);
router.post('/', styleTestController.createStyleTest);
router.put('/:id', styleTestController.updateStyleTest);
router.delete('/:id', styleTestController.deleteStyleTest);
router.post('/:id/result', styleTestController.addTestResult);

module.exports = router;
