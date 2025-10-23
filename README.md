# 设备管理系统

一个基于 Next.js 和 LeanCloud 的设备管理系统，用于管理公司安全设备信息。

## 功能特性

- **设备管理**: 添加、编辑、删除设备信息
- **状态监控**: 自动计算设备状态（正常、即将过期、已过期）
- **智能筛选**: 按状态筛选设备，支持搜索功能
- **数据统计**: 实时显示设备统计信息

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript
- **样式**: Tailwind CSS
- **后端**: LeanCloud
- **部署**: Vercel (推荐)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 LeanCloud

1. 在 [LeanCloud 控制台](https://console.leancloud.cn/) 创建应用
2. 复制 `env.example` 为 `.env.local`
3. 填入你的 LeanCloud 配置信息：

```env
NEXT_PUBLIC_LEANCLOUD_APP_ID=your-app-id
NEXT_PUBLIC_LEANCLOUD_APP_KEY=your-app-key
NEXT_PUBLIC_LEANCLOUD_SERVER_URL=https://your-app-id.api.lncldglobal.com
INVITE_CODE=your-invite-code
```

### 3. 创建数据表

在 LeanCloud 控制台中创建名为 `Devices` 的数据表，包含以下字段：

- `name` (String): 设备名称
- `expiryDate` (String): 到期时间 (格式: YYYY-MM-DD)
- `building` (String): 楼宇
- `room` (String): 房间
- `location` (String): 位置 (自动生成: 楼宇-房间)

### 4. 启动开发服务器

```bash
npm run dev -- --webpack
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 页面说明

### 主页 (`/`)
- 显示设备统计概览
- 快捷操作按钮
- 最近添加的设备列表

### 添加设备 (`/add-device`)
- 表单包含：设备名称、到期时间、楼宇、房间
- 位置信息自动生成
- 实时表单验证

### 设备列表 (`/device-list`)
- 显示所有设备
- 按状态筛选（正常、即将过期、已过期）
- 搜索功能
- 统计卡片

### 编辑设备 (`/edit-device?id=xxx`)
- 编辑设备信息
- 删除设备功能
- 状态显示

## 设备状态规则

- **正常**: 到期时间距离今天 7 天以上
- **即将过期**: 到期时间距离今天 7 天内
- **已过期**: 到期时间已过

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

支持任何支持 Next.js 的平台，如：
- Netlify
- Railway
- 自建服务器

## 开发

### 项目结构

```
├── app/                    # Next.js App Router
│   ├── add-device/        # 添加设备页面
│   ├── device-list/       # 设备列表页面
│   ├── edit-device/       # 编辑设备页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── lib/                   # 工具库
│   ├── leancloud.ts       # LeanCloud 配置和API
│   └── types.ts           # TypeScript 类型定义
└── public/                # 静态资源
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件和 Hooks
- 样式使用 Tailwind CSS

## 许可证

MIT License