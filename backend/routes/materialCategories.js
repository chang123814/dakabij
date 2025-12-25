const express = require('express');
const router = express.Router();
const materialCategoryController = require('../controllers/materialCategoryController');

router.get('/', materialCategoryController.getMaterialCategories);
router.post('/', materialCategoryController.createMaterialCategory);
router.put('/:id', materialCategoryController.updateMaterialCategory);
router.delete('/:id', materialCategoryController.deleteMaterialCategory);

module.exports = router;
