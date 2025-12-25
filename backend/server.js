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
const taskCategoriesRoutes = require('./routes/taskCategories');
const materialCategoriesRoutes = require('./routes/materialCategories');
const materialsRoutes = require('./routes/materials');
const socialPlatformsRoutes = require('./routes/socialPlatforms');
const contentPublishesRoutes = require('./routes/contentPublishes');
const styleTestsRoutes = require('./routes/styleTests');
const fanInteractionsRoutes = require('./routes/fanInteractions');
const monetizationRoutes = require('./routes/monetization');
const themePlansRoutes = require('./routes/themePlans');

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
app.use('/api/task-categories', taskCategoriesRoutes);
app.use('/api/material-categories', materialCategoriesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/social-platforms', socialPlatformsRoutes);
app.use('/api/content-publishes', contentPublishesRoutes);
app.use('/api/style-tests', styleTestsRoutes);
app.use('/api/fan-interactions', fanInteractionsRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/theme-plans', themePlansRoutes);

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
