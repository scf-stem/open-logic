# Open Logic 源问

**Open Logic 源问** 是一个面向青少年的 AI 增强型开源技术学习社区，聚焦编程、开源硬件与实践型学习场景。项目提供社区问答、AI 助手、课程内容与在线代码运行能力，帮助学习者获得更及时的反馈。

## 功能概览

- 社区问答：支持用户发帖、评论、点赞与个人内容查看
- AI 助手：为问题和评论生成参考回复
- 课程内容：提供面向初学者的学习材料与页面展示
- 在线运行：支持 Python 和 C 代码执行接口
- 双语界面：支持中英文界面切换

## 技术栈

- 后端：Flask
- 数据库：SQLAlchemy
- 迁移：Flask-Migrate
- 前端：HTML、CSS、Vanilla JavaScript
- AI 接口：OpenAI 兼容接口
- 生产服务：Gunicorn

## 项目结构

```text
Open Logic/
├── app.py                 # Flask 应用入口
├── config.py              # 开发/生产配置
├── extensions.py          # Flask 扩展初始化
├── routes/                # 路由蓝图
├── models/                # 数据模型
├── services/              # AI 与代码执行等服务
├── templates/             # Jinja 模板
├── static/                # CSS / JS / 图片
├── data/                  # 课程与内容数据
├── instance/              # 本地运行时数据
├── requirements.txt       # Python 依赖
├── Procfile               # 生产启动命令
└── zbpack.json            # Zeabur Python 版本声明
```

## 本地开发

### 1. 创建虚拟环境

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

推荐在项目根目录创建 `.env` 文件：

```env
FLASK_CONFIG=development
SECRET_KEY=dev-secret-key
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com
```

说明：

- `FLASK_CONFIG=development`：本地开发模式
- `SECRET_KEY`：用于 Session 和登录态
- `OPENAI_API_KEY`：AI 回复功能必需
- `OPENAI_BASE_URL`：默认可使用 DeepSeek 的 OpenAI 兼容地址

本地开发环境下，如果未设置 `DATABASE_URL`，项目会默认使用 SQLite：

```text
sqlite:///openlogic.db
```

### 4. 启动项目

```bash
python3 app.py
```

默认监听：

```text
http://127.0.0.1:8080
```

## 生产环境要求

生产环境默认要求以下变量必须存在：

```env
FLASK_CONFIG=production
SECRET_KEY=your-strong-secret
DATABASE_URL=your-production-database-url
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com
```

说明：

- `FLASK_CONFIG=production`：启用生产配置
- `SECRET_KEY`：必填，不能为空
- `DATABASE_URL`：必填，生产环境不再回退到本地 SQLite
- `PORT`：由部署平台注入，通常不需要手动设置

## Gunicorn 启动

项目已内置生产启动命令：

```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60
```

对应文件：

- `Procfile`

## 数据库说明

### 本地开发

- 默认使用 SQLite
- 适合演示、开发和本地调试

### 线上部署

- 建议使用 Zeabur 提供的 PostgreSQL 或 MySQL
- 不建议在线上继续使用 SQLite 作为主数据库

当前项目已经禁用了生产环境自动回退 SQLite，因此如果没有配置 `DATABASE_URL`，应用会在启动时直接报错，便于尽早发现部署问题。

## Zeabur 部署指南

### 1. 上传代码到 GitHub

在上传前，确认以下内容不要提交：

- `.env`
- `venv/`
- `instance/*.db`
- `__pycache__/`

项目已经通过 `.gitignore` 处理了这些常见本地文件。

### 2. 在 Zeabur 中创建项目

操作建议：

1. 将 GitHub 仓库导入 Zeabur
2. 让 Zeabur 自动识别 Python 项目
3. 添加数据库服务，推荐 PostgreSQL
4. 将数据库连接串填入 `DATABASE_URL`

### 3. 配置环境变量

在 Zeabur 控制台中至少配置：

```env
FLASK_CONFIG=production
SECRET_KEY=your-strong-secret
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com
```

可选：

```env
ZBPACK_PYTHON_VERSION=3.12
```

说明：

- 项目根目录已提供 `zbpack.json`，会优先声明 Python `3.12`
- 若你习惯在平台环境变量中统一管理版本，也可额外设置 `ZBPACK_PYTHON_VERSION`

### 4. 启动方式

默认使用仓库中的 `Procfile` 即可：

```text
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60
```

Zeabur 会通过 `PORT` 分配实际监听端口，因此不要将生产端口写死为 `8080`。

### 5. 关于数据库迁移

当前项目已经移除了应用启动时自动 `db.create_all()` 的逻辑，避免生产环境中出现隐式建表问题。

如果你后续引入正式迁移流程，推荐在部署前或发布流程中执行：

```bash
flask db upgrade
```

如果你打算在 Zeabur 使用自定义启动命令并顺带执行迁移，请注意 Zeabur 的自定义 `start_command` 需要包含 `_startup`。

## 部署检查清单

上线前可按下面快速核对：

- 已上传到 GitHub 的仓库不包含 `.env` 和本地数据库
- Zeabur 已添加数据库服务
- `DATABASE_URL` 已正确配置
- `SECRET_KEY` 已配置强随机值
- `OPENAI_API_KEY` 已配置
- 使用 Gunicorn 启动而不是 Flask 开发服务器
- 没有把生产端口写死

## 常见问题

### 1. 启动时报 `Missing required production environment variables`

原因：生产环境缺少 `SECRET_KEY` 或 `DATABASE_URL`。  
解决：在 Zeabur 环境变量中补齐它们。

### 2. 页面能打开，但 AI 回复不可用

原因通常是：

- `OPENAI_API_KEY` 未配置
- `OPENAI_BASE_URL` 配置错误
- 所使用的模型或接口与当前服务不兼容

### 3. 本地能跑，线上报数据库错误

常见原因：

- 本地使用的是 SQLite
- 线上没有配置 `DATABASE_URL`
- 数据库服务尚未创建完成

## 后续建议

- 增加 `tests/` 下的基础测试，覆盖认证、发帖、评论和关键接口
- 将数据库迁移流程正式化
- 如果代码运行器需要系统级编译环境，可考虑后续改为 Docker 部署

---

Created by Open Logic Team.
当前默认文件名已同步更新为 `openlogic.db`，并会继续复用现有本地数据文件。
