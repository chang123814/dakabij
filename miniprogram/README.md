# 习惯日记小程序前端

微信小程序前端项目，用于习惯打卡和笔记记录。

## 项目结构

```
miniprogram/
├── app.js                  # 小程序入口文件
├── app.json                # 小程序全局配置
├── app.wxss                # 小程序全局样式
├── project.config.json     # 项目配置文件
├── sitemap.json            # 站点地图配置
├── pages/                  # 页面目录
│   ├── index/             # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── habits/            # 习惯列表页
│   │   ├── habits.js
│   │   ├── habits.json
│   │   ├── habits.wxml
│   │   └── habits.wxss
│   ├── notes/             # 笔记列表页
│   │   ├── notes.js
│   │   ├── notes.json
│   │   ├── notes.wxml
│   │   └── notes.wxss
│   ├── statistics/        # 统计页
│   │   ├── statistics.js
│   │   ├── statistics.json
│   │   ├── statistics.wxml
│   │   └── statistics.wxss
│   └── profile/           # 个人中心页
│       ├── profile.js
│       ├── profile.json
│       ├── profile.wxml
│       └── profile.wxss
├── utils/                 # 工具函数
│   ├── request.js         # 网络请求封装
│   └── util.js            # 通用工具函数
└── images/                # 图片资源
    └── README.md
```

## 技术栈

- 微信小程序原生框架
- JavaScript (ES6+)
- WeUI/Vant Weapp 组件库（可选）

## 功能特性

### 已实现功能

1. **首页**
   - 用户信息展示
   - 今日打卡统计
   - 快捷操作入口
   - 最近笔记列表
   - 每日一句

2. **习惯管理**
   - 习惯列表展示
   - 习惯打卡
   - 习惯详情查看
   - 习惯创建（待实现）

3. **笔记管理**
   - 笔记列表展示
   - 笔记搜索
   - 笔记详情查看
   - 笔记创建（待实现）

4. **统计分析**
   - 数据概览
   - 周统计图表
   - 成就展示

5. **个人中心**
   - 用户信息展示
   - 设置管理
   - 登录/退出

### 待实现功能

1. 习惯创建页面
2. 习惯详情页面
3. 笔记创建页面
4. 笔记详情页面
5. 日历视图页面
6. 数据导出功能

## 配置说明

### API 配置

在 `app.js` 中配置后端API地址：

```javascript
globalData: {
  apiBaseUrl: 'http://129.211.62.76:3001/api',  // 后端API地址
  // ...
}
```

### 小程序 AppID

在 `project.config.json` 中配置小程序AppID：

```json
{
  "appid": "your_appid_here"
}
```

## 开发指南

### 环境要求

- 微信开发者工具
- Node.js (可选，用于构建)

### 开发步骤

1. 克隆或下载项目
2. 使用微信开发者工具打开项目
3. 配置 AppID 和 API 地址
4. 点击编译运行

### 调试技巧

1. 使用 `console.log` 输出调试信息
2. 使用微信开发者工具的调试面板
3. 使用真机调试测试真实环境

## 部署说明

1. 在微信开发者工具中点击"上传"
2. 登录微信公众平台
3. 提交审核
4. 审核通过后发布

## 注意事项

1. 所有网络请求需要配置合法域名
2. 图片资源需要上传到CDN或使用云存储
3. 需要配置微信登录和用户信息获取权限
4. 注意小程序包大小限制（主包2MB）

## 后续优化

1. 添加组件化开发
2. 引入状态管理
3. 优化性能和用户体验
4. 添加单元测试
5. 完善错误处理

## 联系方式

如有问题，请联系：support@habitdiary.com
