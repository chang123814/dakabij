// 打卡路由
const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');

// 创建打卡记录
router.post('/', checkInController.createCheckIn);

// 获取打卡记录列表
router.get('/', checkInController.getCheckIns);

// 获取今日打卡状态
router.get('/today', checkInController.getTodayCheckIns);

// 删除打卡记录
router.delete('/:id', checkInController.deleteCheckIn);

// 获取打卡统计
router.get('/statistics/:habitId', checkInController.getCheckInStatistics);

module.exports = router;
