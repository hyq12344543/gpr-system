# AGENT.md - 项目上下文指南

本项目是一个企业官网全栈应用，前后端分离架构。

## 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 后端框架 | Django | 5.2.16 |
| 后端 API | Django REST Framework | 3.17.1 |
| 管理后台 | django-simpleui | 2026.1.13 |
| 数据库 | SQLite (开发) | --- |
| 前端框架 | Vue 3 | ^3.5.39 |
| 构建工具 | Vite | ^8.1.1 |
| 路由 | Vue Router | ^4.6.4 |
| HTTP 客户端 | Axios | ^1.18.1 |
| Python | CPython | 3.11.0 |
| Node.js | --- | 22.14.0 |
## 项目结构

```
django企业官网/
├── config/                  # Django 项目配置
│   ├── settings.py          # 全局配置（含 DRF、CORS、SimpleUI）
│   ├── urls.py              # 根路由
│   ├── asgi.py              # ASGI 入口
│   └── wsgi.py              # WSGI 入口
├── main/                    # Django 主应用（企业官网业务逻辑）
│   ├── models.py            # 数据模型（待开发）
│   ├── views.py             # API 视图（待开发）
│   ├── admin.py             # 后台管理注册（待开发）
│   ├── serializers.py       # DRF 序列化器（待创建）
│   └── urls.py              # 应用路由（待创建）
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── main.js          # 入口（挂载 Router）
│   │   ├── App.vue          # 根组件（导航 + router-view + 页脚）
│   │   ├── router/
│   │   │   └── index.js     # 路由配置（首页 /about）
│   │   ├── views/
│   │   │   ├── Home.vue     # 首页（Hero + 特色卡片）
│   │   │   └── About.vue    # 关于我们
│   │   ├── api/
│   │   │   └── index.js     # Axios 实例（baseURL: /api）
│   │   ├── components/      # 可复用组件
│   │   ├── assets/          # 静态资源
│   │   └── style.css        # 全局样式
│   ├── vite.config.js       # Vite 配置（proxy /api -> :8000）
│   ├── index.html           # HTML 模板
│   └── package.json         # 依赖管理
├── venv/                    # Python 虚拟环境
└── manage.py                # Django 管理入口
```

## 开发服务器

两个服务同时运行，前后端分离开发：

| 服务 | 端口 | 启动命令 | 用途 |
|---|---|---|---|
| Django 后端 | :8000 | python manage.py runserver | REST API + Admin 后台 |
| Vue 前端 | :5173 | npm run dev (在 frontend/ 目录) | 企业官网前台页面 |

### 代理规则

Vite 开发服务器将 /api/* 请求自动代理到 Django 后端 http://127.0.0.1:8000，避免跨域问题。详情见 frontend/vite.config.js。

### 启动顺序

```
# 终端 1 - 后端
.\venv\Scripts\Activate.ps1
$env:PYTHONUTF8='1'
python manage.py runserver 127.0.0.1:8000

# 终端 2 - 前端
cd frontend
npm run dev
```

## 关键配置

### Django settings.py

- INSTALLED_APPS 顺序：simpleui -> rest_framework -> corsheaders -> 内置应用 -> main
- LANGUAGE_CODE = zh-hans
- TIME_ZONE = Asia/Shanghai
- CORS_ALLOW_ALL_ORIGINS = True（开发阶段）
- 数据库：SQLite（db.sqlite3）

### Vite 配置

- 开发端口：5173
- API 代理：/api -> http://127.0.0.1:8000

## 环境变量

- PYTHONUTF8=1 - 解决 Windows 中文路径下 pip 编码报错
- Node.js 路径需手动加入 $env:Path（安装于 C:\Users\dell\.nodejs\node-v22.14.0-win-x64\）

## 管理后台

- 地址：http://127.0.0.1:8000/admin/
- 超级管理员：kymcode / admin123 / 1160844067@qq.com
- 界面：SimpleUI（已启用中文）

## 开发约定

### 后端（Django）

- 所有业务逻辑放在 main/ 应用下，按模块拆分
- 新功能对应新 Django app 或在 main 内分模块
- API 使用 DRF（viewsets.ModelViewSet 优先），路由集中注册
- 数据库迁移：python manage.py makemigrations && python manage.py migrate

### 前端（Vue）

- 页面级组件放在 src/views/，可复用组件放在 src/components/
- 路由统一在 src/router/index.js 配置
- API 调用通过 src/api/index.js 的 Axios 实例发起
- 前端页面路径与 /api/* 代理规则对应
- 后端返回的数据通过 API 接口交互，不在前端直接操作数据库

### 数据流

```
用户浏览器 -> Vue Router -> View 组件 -> Axios -> /api/* -> Vite 代理 -> Django API -> DRF -> 数据库
```

## 常用命令

### 后端

```powershell
# 激活虚拟环境
.\venv\Scripts\Activate.ps1
$env:PYTHONUTF8='1'

# 运行开发服务器
python manage.py runserver

# 创建迁移
python manage.py makemigrations

# 执行迁移
python manage.py migrate

# 创建超级管理员
python manage.py createsuperuser

# Django shell
python manage.py shell
```

### 前端

```powershell
# 安装依赖
cd frontend && npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 快速开始（全新环境）

```powershell
# 1. 创建虚拟环境并激活
python -m venv venv
.\venv\Scripts\Activate.ps1
$env:PYTHONUTF8='1'

# 2. 安装后端依赖
pip install django djangorestframework django-cors-headers django-simpleui

# 3. 迁移数据库
python manage.py migrate

# 4. 创建超级管理员
python manage.py createsuperuser

# 5. 启动后端
python manage.py runserver

# 6. 另一个终端 - 启动前端
cd frontend
npm install
npm run dev
```
