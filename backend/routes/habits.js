// 习惯路由
const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// 获取习惯列表
router.get('/', habitController.getHabits);

// 创建习惯
router.post('/', habitController.createHabit);

// 获取习惯详情
router.get('/:id', habitController.getHabitDetail);

// 更新习惯
router.put('/:id', habitController.updateHabit);

// 删除习惯
router.delete('/:id', habitController.deleteHabit);

// 获取习惯打卡记录
router.get('/:id/checkins', habitController.getHabitCheckIns);

module.exports = router;
