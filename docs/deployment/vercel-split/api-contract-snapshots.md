# API Contract Snapshots

## Purpose

This is the phase-0 baseline for payload-level API freeze. Downstream extraction work should preserve these shapes or explicitly version them.

## Auth

### `GET /api/auth/captcha`

- Response: image/png
- Current behavior: writes captcha challenge into Flask session state

### `POST /api/auth/register`

Request body:
```json
{
  "username": "string",
  "password": "string",
  "captcha": "string"
}
```

Current success response:
```json
{
  "code": 200,
  "message": "注册成功"
}
```

### `POST /api/auth/login`

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Current success response shape:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": "number",
    "username": "string"
  }
}
```

### `GET /api/auth/me`

Current success response shape:
```json
{
  "code": 200,
  "data": {
    "id": "number",
    "username": "string"
  }
}
```

### `POST /api/auth/logout`

Current success response:
```json
{
  "code": 200,
  "message": "Logged out"
}
```

## Posts / Comments

### `GET /api/posts`

Current consumers:
- home feed
- profile filtered by `user_id`

Expected query usage:
- optional `user_id`
- optional tag/filter inputs

### `POST /api/posts`

Request body:
```json
{
  "title": "string",
  "content": "string",
  "tags": "string-or-array"
}
```

Notes:
- current frontend may also try to send bearer auth, but server-side ownership is session-based
- current route triggers background AI work after post creation

### `GET /api/posts/:id`

Current consumer:
- post detail page

Expected payload includes:
- post metadata
- comments array
- AI vs non-AI comment flags

### `POST /api/posts/:id/comments`

Request body:
```json
{
  "content": "string"
}
```

Notes:
- current route may trigger AI reply when content contains `@AI` or `@源问AI`

### `POST /api/posts/:id/like`

Current response usage:
- client expects updated `likes`

## Courses

### `GET /api/courses/graph`

Current success response shape:
```json
{
  "code": 200,
  "data": {
    "python": ["..."],
    "c": ["..."],
    "vibe": ["..."]
  }
}
```

### `GET /api/courses/lesson/:track/:id`

Current success response shape:
```json
{
  "code": 200,
  "data": {
    "content": "markdown",
    "total": "number",
    "current": "number"
  }
}
```

## Runner

### `POST /api/run`

Request body:
```json
{
  "code": "string",
  "language": "python|c",
  "context": {}
}
```

Current response characteristics:
- top-level `requestId`
- nested `execution`
- nested `analysis`
- nested `telemetry`
- nested metrics fields such as `time_ms`, `compile_ms`, `memory_kb`

## Freeze Rule

Before any frontend or service extraction starts, each of the above contracts should be upgraded from this baseline summary into exact request/response fixtures captured from the live app or dedicated tests.
