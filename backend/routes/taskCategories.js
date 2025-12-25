const express = require('express');
const router = express.Router();
const taskCategoryController = require('../controllers/taskCategoryController');

router.get('/', taskCategoryController.getTaskCategories);
router.post('/', taskCategoryController.createTaskCategory);
router.put('/:id', taskCategoryController.updateTaskCategory);
router.delete('/:id', taskCategoryController.deleteTaskCategory);

module.exports = router;