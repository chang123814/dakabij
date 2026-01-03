# 习惯日记小程序

以“习惯打卡 + 素材收集 + 数据统计”为核心的微信小程序项目，包含 Node.js + Express + MySQL 后端与原生小程序前端。当前仓库按照《详细开发计划 V2.0》分阶段迭代，此版本处于基础结构搭建阶段。

## 仓库结构

```
.
├── backend/                # Node.js 后端服务
├── miniprogram/            # 微信小程序源码
├── project.config.json     # 微信开发者工具配置
├── project.private.config.json
├── README.md
└── 前端/后端规划文档
```

## 快速开始

### 1. 准备环境
- Node.js 18+
- MySQL 8+
- 微信开发者工具（libVersion 3.13.0）

### 2. 配置环境变量
根据 `.env.example` 新建 `.env`，可放在项目根目录或 `backend/.env`：
```
APP_ID=wx766b73af56ba849d
APP_SECRET=your_app_secret_here
SERVER_HOST=127.0.0.1
SERVER_PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=habit_diary
NODE_ENV=development
```

### 3. 启动后端
```
cd backend
npm install
npm run dev
```
默认会监听 `SERVER_PORT`，并暴露 `/health`、`/api/status` 等基础探活接口。

### 4. 启动小程序
- 打开微信开发者工具，选择“导入项目”
- 项目目录选择 `miniprogram/`
- AppID 使用 `.env` 中的 `APP_ID`

## 里程碑
- [x] 基础目录 & 工具链搭建
- [ ] 任务/素材后端接口
- [ ] 前端打卡与素材页面联调
- [ ] 统计模块、联调及上线

## 贡献
采用 Git 分支管理：`feature/*` → `develop` → `master`。每个阶段合并前需附测试用例或截图说明。
