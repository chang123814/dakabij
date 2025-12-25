// 习惯日记小程序 - 后端服务器
// 主入口文件

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入路由
const userRoutes = require('./routes/users');
const habitRoutes = require('./routes/habits');
const checkInRoutes = require('./routes/checkIn');
const noteRoutes = require('./routes/notes');
const statisticsRoutes = require('./routes/statistics');
const wechatRoutes = require('./routes/wechat');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// 创建Express应用
const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: '习惯日记小程序后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/wechat', wechatRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log('=================================');
  console.log('习惯日记小程序后端服务');
  console.log('=================================');
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`数据库: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log('=================================');
});

module.exports = app;
