// 笔记路由
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// 获取笔记列表
router.get('/', noteController.getNotes);

// 创建笔记
router.post('/', noteController.createNote);

// 获取笔记详情
router.get('/:id', noteController.getNoteDetail);

// 更新笔记
router.put('/:id', noteController.updateNote);

// 删除笔记
router.delete('/:id', noteController.deleteNote);

// 获取笔记分类
router.get('/categories/list', noteController.getNoteCategories);

// 创建笔记分类
router.post('/categories', noteController.createNoteCategory);

// 删除笔记分类
router.delete('/categories/:id', noteController.deleteNoteCategory);

module.exports = router;
