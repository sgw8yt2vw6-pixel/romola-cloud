# 🎀 Romola 工作台 - 云端同步版

多设备通用·全自动同步·Supabase + Railway

## 快速部署

### 1️⃣ 创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) → **New project**
2. 填写项目名称 → 设置数据库密码 → 选择区域（推荐**北京**或**新加坡**）
3. 创建完成后，进入 **SQL Editor** → 粘贴并运行 [supabase-schema.sql](./supabase-schema.sql)
4. 进入 **Project Settings → API**，复制：
   - `Project URL` → 即 `SUPABASE_URL`
   - `anon public` → 即 `SUPABASE_ANON_KEY`

### 2️⃣ 部署到 Railway

点击下方按钮一键部署（需要 GitHub 账号）：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

或手动部署：

1. Fork / Push 此仓库到你的 GitHub
2. 登录 [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo**
3. 选择此仓库
4. 在 Railway 项目面板 → **Variables** 添加以下环境变量：

| 变量 | 说明 | 从哪里获取 |
|------|------|-----------|
| `SUPABASE_URL` | Supabase 项目 URL | Supabase Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Settings → API → anon public |
| `PORT` | 服务端口（默认 8080） | 无需修改 |

5. Railway 自动检测 `railway.json` 并部署
6. 部署完成后，Railway 面板会显示一个公网 URL（`https://xxx.railway.app`）

### 3️⃣ 多设备使用

1. 在 **所有设备**上打开 Railway 提供的公网 URL
2. 进入 **设置 → 云端同步** → 输入**相同的设备码**
3. 第一台设备点击 **推送** → 其他设备点击 **拉取**
4. 之后每次保存 **自动同步**，后台每 5 分钟也自动检查更新

## 本地开发

```bash
# 安装依赖
cd backend && npm install

# 设置环境变量
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export PORT=8080

# 启动服务（前端 + 后端一体化）
node server.js

# 浏览器打开 http://localhost:8080
```

## 技术栈

- **前端**: 纯 HTML/CSS/JS（PWA 类原生体验）
- **后端**: Node.js + Express
- **数据库**: Supabase（PostgreSQL + JSONB）
- **部署**: Railway（自动从 GitHub 部署）
- **同步**: REST API + 自动推送/拉取

## 项目结构

```
romola-cloud/
├── backend/
│   ├── server.js        # Express 服务端
│   ├── supabase.js      # Supabase 客户端
│   ├── package.json     # Node 依赖
│   └── .env.example     # 环境变量模板
├── public/
│   └── index.html       # 前端页面（自动同步版）
├── supabase-schema.sql  # 数据库建表 SQL
├── railway.json         # Railway 部署配置
├── package.json         # 根配置
└── README.md            # 本文件
```

## License

MIT
