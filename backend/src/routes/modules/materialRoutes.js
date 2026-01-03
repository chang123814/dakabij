const express = require('express')
const {
  listMaterials,
  getMaterialDetail,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleFavorite
} = require('../../controllers/materialController')

const router = express.Router()

router.get('/', listMaterials)
router.get('/:id', getMaterialDetail)
router.post('/', createMaterial)
router.put('/:id', updateMaterial)
router.delete('/:id', deleteMaterial)
router.post('/:id/favorite', toggleFavorite)

module.exports = router

