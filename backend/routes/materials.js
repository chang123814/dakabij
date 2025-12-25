const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);
router.post('/:id/favorite', materialController.toggleFavorite);

module.exports = router;
