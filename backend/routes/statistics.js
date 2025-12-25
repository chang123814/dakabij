// 统计路由
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// 获取用户统计数据
router.get('/user/:userId', statisticsController.getUserStatistics);

// 获取日期范围统计数据
router.get('/range', statisticsController.getRangeStatistics);

// 获取习惯统计数据
router.get('/habit/:habitId', statisticsController.getHabitStatistics);

// 获取月度统计
router.get('/monthly/:userId', statisticsController.getMonthlyStatistics);

module.exports = router;
