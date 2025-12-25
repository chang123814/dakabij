// 用户路由
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 获取用户信息
router.get('/info', userController.getUserInfo);

// 更新用户信息
router.put('/info', userController.updateUserInfo);

// 获取用户统计概览
router.get('/overview', userController.getUserOverview);

module.exports = router;
