const express = require('express');
const router = express.Router();
const socialPlatformController = require('../controllers/socialPlatformController');

router.get('/', socialPlatformController.getSocialPlatforms);
router.get('/:id', socialPlatformController.getSocialPlatformById);
router.post('/', socialPlatformController.createSocialPlatform);
router.put('/:id', socialPlatformController.updateSocialPlatform);
router.delete('/:id', socialPlatformController.deleteSocialPlatform);

module.exports = router;
