const express = require('express')
const {
  listMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory
} = require('../../controllers/materialCategoryController')

const router = express.Router()

router.get('/', listMaterialCategories)
router.post('/', createMaterialCategory)
router.put('/:id', updateMaterialCategory)
router.delete('/:id', deleteMaterialCategory)

module.exports = router
