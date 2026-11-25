# FurEver API

服务端是零依赖 Node.js HTTP 服务，默认监听 `0.0.0.0:3000`。
所有 `/api/*` 接口接收和返回 JSON；错误响应格式为 `{ "message": "..." }`。

## 健康检查

### `GET /api/health`

```json
{ "ok": true, "time": "2026-11-25T05:34:35.886Z" }
```

## 认证

`POST /api/auth/register`、`POST /api/auth/login` 成功后返回：

```json
{ "token": "…", "email": "test@example.com" }
```

之后需要登录的接口使用 `Authorization: Bearer <token>`。

### `POST /api/auth/register`

```json
{ "email": "test@example.com", "password": "123456" }
```

- 成功：`201`，返回 `{token,email}`
- 邮箱无效：`400`
- 密码少于 6 位或多于 128 位：`400`
- 邮箱已注册：`409`

### `POST /api/auth/login`

```json
{ "email": "test@example.com", "password": "123456" }
```

- 成功：返回 `{token,email}`
- 失败：`401`，`{ "message": "邮箱或密码不正确" }`

### `GET /api/auth/me`

返回 `{ "email": "…" }`。

### `POST /api/auth/logout`

使当前会话失效，返回 `{ "ok": true }`。

### `POST /api/auth/forgot-password`

```json
{ "email": "test@example.com" }
```

当前是开发模式，不发送邮件。若账号存在，会在响应里直接返回 `resetToken`：

```json
{ "ok": true, "message": "开发模式：重置令牌已返回，请复制到下方完成重置", "resetToken": "…" }
```

为了避免枚举账号，邮箱不存在时也返回 `{ok:true, resetToken:null}`。

### `POST /api/auth/reset-password`

```json
{ "token": "<resetToken>", "password": "new-password" }
```

成功返回 `{ "ok": true }`，并使该账号所有已有会话失效。令牌无效或过期返回 `400`。

## 账户与安全

### `PUT /api/account/email`

```json
{ "email": "new@example.com", "password": "current-password" }
```

- 成功：`{ "ok": true, "email": "new@example.com" }`
- 当前密码错误：`401`
- 新邮箱无效：`400`
- 新邮箱与当前相同：`400`
- 新邮箱已被占用：`409`

### `PUT /api/account/password`

```json
{ "currentPassword": "old-password", "newPassword": "new-password" }
```

成功返回 `{ "ok": true }`。当前会话保留，其他会话失效。

## 管理看板

### `GET /api/dashboard/data`

需要请求头 `X-Admin-Token: <管理员令牌>`。返回：

```json
{
  "stats": { "users": 1, "sessions": 1, "resets": 0 },
  "users": [
    { "id": 1, "email": "test@example.com", "created_at": "…", "last_login_at": "…" }
  ],
  "requests": [],
  "server": {
    "hostname": "…",
    "platform": "linux",
    "arch": "x64",
    "node": "v26.13.1",
    "pid": 1234,
    "uptimeSeconds": 60,
    "memoryRssBytes": 12345678,
    "host": "0.0.0.0",
    "port": 3000,
    "dbPath": "…",
    "dbFileSize": 24576,
    "sessionDays": 30,
    "resetMinutes": 1440,
    "dashboardUrl": "/",
    "appUrl": "/app/"
  }
}
```

## 页面路由

| 路径 | 说明 |
| --- | --- |
| `/` | 管理看板（输入管理员令牌后显示数据） |
| `/dashboard/` | 与 `/` 相同的看板 |
| `/app/` | HTML5 应用，Android 使用同一套文件 |
| `/favicon.ico` | 应用图标 |
