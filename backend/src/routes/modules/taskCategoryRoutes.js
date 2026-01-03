const express = require('express')
const {
  listTaskCategories,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory
} = require('../../controllers/taskCategoryController')

const router = express.Router()

router.get('/', listTaskCategories)
router.post('/', createTaskCategory)
router.put('/:id', updateTaskCategory)
router.delete('/:id', deleteTaskCategory)

module.exports = router
