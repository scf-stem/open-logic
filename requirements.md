# 项目需求文档 (完整版)：Open Logic 源问

**版本**: V1.1 (Detailed)  
**日期**: 2026-01-13  
**状态**: 待确认

---

## 1. 项目概述
**Open Logic 源问** 是一个面向青少年的 AI 增强型开源技术学习社区。
*   **目标**: 解决偏远地区学生在学习开源技术时的资源匮乏与答疑延迟问题。
*   **核心功能**: 社区问答 + AI 智能助手自动回答。
*   **技术栈**:
    *   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
    *   **Backend**: Python Flask
    *   **Database**: SQLite (MVP)
    *   **AI**: OpenAI API / Compatible Interface

## 2. 详细功能需求

### 2.1 用户模块
*   **注册/登录**: 简单的用户名/密码注册，存入数据库（密码哈希存储）。
*   **个人资料**: 显示用户名、头像（可选）、积分（预留字段）、发帖历史。

### 2.2 问答社区 (Q&A)
*   **帖子列表**:
    *   支持分页加载。
    *   支持按“最新”、“最热”、“未解决”筛选。
    *   支持按标签过滤 (Arduino, Python, etc.)。
*   **发布帖子**:
    *   标题 (Title)
    *   内容 (Content): 支持 Markdown 语法（暂定 simpleMDE 或原生 textarea）。
    *   标签 (Tags): 选择或输入。
    *   图片上传 (Images): 允许上传图片辅助说明问题。
*   **帖子详情**:
    *   展示完整问题内容。
    *   **AI 回答区**: 帖子发布后，后端通过 SSE (Server-Sent Events) 或 轮询方式异步展示 AI 生成的回答。AI 回答需有特别样式标记。
    *   **人工回答区**: 其他用户可提交回答。
    *   **评论**: 针对回答的简短评论（MVP 阶段可选，若时间紧可仅支持一级回答）。
    *   **点赞**: 对有帮助的回答进行点赞。

### 2.3 AI 智能助手逻辑
*   **触发机制**: 用户提交新问题时，后台异步触发 AI 任务。
*   **Prompt 设计**:
    *   角色: "你是一个友好的少儿编程导师..."
    *   约束: 解释通俗易懂，代码需加注释，鼓励学生自己思考。
*   **Fallback**: 若 AI 调用失败，应有重试机制或错误提示（仅管理员可见），用户端不应崩溃。

## 3. 数据库设计 (Schema)

使用 SQLite，当前默认文件名为 `openlogic.db`。

### 3.1 `users` 表
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER PK | 用户 ID |
| username | TEXT | 用户名 (Unique) |
| password_hash | TEXT | 密码哈希 |
| created_at | DATETIME | 注册时间 |
| avatar_url | TEXT | 头像链接 (Optional) |

### 3.2 `posts` 表
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER PK | 帖子 ID |
| user_id | INTEGER FK | 作者 ID |
| title | TEXT | 标题 |
| content | TEXT | 内容 (Markdown) |
| tags | TEXT | 标签 (JSON string: "['python', 'web']") |
| created_at | DATETIME | 发布时间 |
| status | TEXT | 状态 (open, solved) |

### 3.3 `comments` (回答/评论) 表
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER PK | 回答 ID |
| post_id | INTEGER FK | 所属帖子 ID |
| user_id | INTEGER FK | 回答者 ID (若是 AI，可设为特定系统用户 ID) |
| content | TEXT | 内容 |
| is_ai | BOOLEAN | 是否为 AI 生成 |
| likes | INTEGER | 点赞数 |
| created_at | DATETIME | 回答时间 |

## 4. API 接口设计 (RESTful)

### Auth
*   `POST /api/auth/register`: 注册 `{username, password}`
*   `POST /api/auth/login`: 登录 `{username, password}` -> 返回 Session Cookie

### Posts
*   `GET /api/posts`: 获取帖子列表 `?page=1&tag=python`
*   `GET /api/posts/<id>`: 获取单个帖子详情 (包含 comments)
*   `POST /api/posts`: 发布新帖 `{title, content, tags}` -> 触发 AI 任务

### Comments
*   `POST /api/posts/<id>/comments`: 发布新回答 `{content}`
*   `POST /api/comments/<id>/like`: 点赞

### AI (Backend Internal)
*   `POST /internal/generate_answer`: (异步任务) 调用 LLM 生成回答并存入 `comments` 表。

## 5. 项目文件结构规划

```text
Open_Logic/
├── app.py              # Flask 主入口, 路由定义
├── config.py           # 配置 (DB路径, API Keys)
├── extensions.py       # DB 实例等扩展
├── models.py           # 数据库模型定义 (SQLAlchemy/Raw SQL)
├── services/
│   ├── ai_service.py   # AI 调用逻辑
│   └── auth_service.py # 认证逻辑
├── static/
│   ├── css/
│   │   ├── style.css   # 全局样式
│   │   └── glass.css   # 玻璃拟态组件样式
│   ├── js/
│   │   ├── main.js     # 公共 JS
│   │   └── api.js      # API 封装
│   └── images/
├── templates/
│   ├── base.html       # 基础模板 (Header, Footer)
│   ├── index.html      # 首页
│   ├── login.html      # 登录/注册页
│   ├── post_detail.html# 帖子详情页
│   └── post_create.html# 发布页
├── requirements.txt
└── README.md
```

## 6. UI/UX 设计风格规范
*   **色彩**: 
    *   主色: 科技蓝/紫渐变 (代表科技与未来)
    *   背景: 浅灰/纯白搭配半透明玻璃层
*   **字体**: 系统默认 Sans-serif，简洁易读。
*   **交互**: 按钮悬停发光效果，卡片轻微浮动。

---

> 请确认以上详细技术规格。如果没问题，您可以说“**批准**”，我将开始创建项目结构。
