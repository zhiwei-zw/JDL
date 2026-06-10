# 打卡挑战小程序

一个社交互动类微信小程序，用户可以创建和参与各种打卡挑战（如早起打卡、阅读打卡、健身打卡等）。

## 技术栈

- **前端**：微信小程序原生框架
- **后端**：微信云开发（CloudBase）
  - 云数据库：存储挑战、打卡、用户数据
  - 云函数（可选）：模板消息推送、数据导出等

## 项目结构

```
challenger-mini/
├── app.js                    # 应用入口
├── app.json                  # 全局配置（页面路由、TabBar）
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图
├── pages/
│   ├── index/                # 首页 - 挑战列表
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   ├── index.js
│   │   └── index.json
│   ├── challenge-detail/     # 挑战详情页
│   │   ├── challenge-detail.wxml
│   │   ├── challenge-detail.wxss
│   │   ├── challenge-detail.js
│   │   └── challenge-detail.json
│   ├── create-challenge/     # 创建挑战页
│   │   ├── create-challenge.wxml
│   │   ├── create-challenge.wxss
│   │   ├── create-challenge.js
│   │   └── create-challenge.json
│   └── profile/              # 个人中心
│       ├── profile.wxml
│       ├── profile.wxss
│       ├── profile.js
│       └── profile.json
└── cloudfunctions/
    └── initDB/               # 数据库初始化函数
        ├── index.js
        └── package.json
```

## 快速开始

### 1. 初始化云开发环境

1. 在微信开发者工具中打开此项目
2. 点击菜单栏 **工具 → 云开发设置**，开通云开发
3. 记录你的**环境 ID**（如 `prod-xxx`）
4. 替换 `app.js` 中的 `env: 'your-env-id'`

### 2. 创建数据库集合

在云开发控制台的 **数据库** 中创建以下集合：

| 集合名 | 字段 |
|--------|------|
| `challenges` | title, desc, icon, dailyLimit, creatorId, joinCount, isPublic, status |
| `checkins` | challengeId, userId, nickname, days |
| `user_challenges` | userId, challengeId, currentDay, totalDays, isCreator, status |

### 3. 安装云函数依赖

```bash
cd cloudfunctions/initDB
npm install
# 在开发者工具中右键 initDB → 安装依赖
# 然后右键 → 上传并部署：云端安装依赖
```

### 4. 准备 TabBar 图标

在 `assets/` 目录下放置 4 个图标文件：
- `tab-challenge.png` / `tab-challenge-active.png`
- `tab-profile.png` / `tab-profile-active.png`

（推荐尺寸 40x40px 和 81x81px）

### 5. 编译运行

点击开发者工具的 **编译** 按钮即可预览。

## 功能清单

### 已实现
- [x] 挑战列表（搜索、分类筛选）
- [x] 创建挑战（图标、名称、天数、公开/私密）
- [x] 挑战详情（加入、打卡、进度条）
- [x] 个人中心（统计、创建列表、参与列表）
- [x] TabBar 导航

### 待迭代
- [ ] 打卡提醒（模板消息推送）
- [ ] 分享邀请（自定义分享卡片）
- [ ] 排行榜
- [ ] 用户主页
- [ ] 打卡相册（上传图片）
- [ ] 数据分析（连续天数、完成率）

## 数据库 Schema

详见 `cloudfunctions/initDB/index.js` 中的字段定义。

## License

MIT
