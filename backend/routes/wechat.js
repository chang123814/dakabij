// 微信相关路由
const express = require('express');
const router = express.Router();
const wechatController = require('../controllers/wechatController');

// 微信登录
router.post('/login', wechatController.wechatLogin);

// 获取微信access_token
router.get('/access_token', wechatController.getAccessToken);

module.exports = router;
