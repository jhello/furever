# 服务端

服务端只依赖 Node.js 内置模块，使用 `node:http` 提供 API 和静态文件，使用 `node:sqlite` 保存账户与会话。
不需要 `npm install`，也没有前端构建步骤。

## 运行

```bash
# 前台
node server/src/server.js

# 开发（文件变化时重启）
node --watch server/src/server.js

# 后台
./scripts/start-server.sh
./scripts/stop-server.sh
./scripts/status-server.sh
```

启动横幅会打印看板地址、HTML5 地址、健康检查地址、管理员令牌与数据库路径。

## 配置

复制 `.env.example` 为 `.env`，`start-server.sh` / `status-server.sh` 会自动加载。
也可以直接设置环境变量。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `FUREVER_HOST` / `HOST` | `0.0.0.0` | 监听地址 |
| `FUREVER_PORT` / `PORT` | `3000` | 监听端口 |
| `FUREVER_DATA_DIR` | `<项目>/data` | 数据目录 |
| `FUREVER_DB_PATH` | `<data>/furever.db` | SQLite 数据库文件 |
| `FUREVER_WEB_DIR` | `<项目>/web` | HTML5 前端目录 |
| `FUREVER_DASHBOARD_DIR` | `<server>/public/dashboard` | 看板目录 |
| `FUREVER_ADMIN_TOKEN` | 自动生成 | 管理看板令牌 |
| `FUREVER_SESSION_DAYS` | `30` | 会话闲置有效天数 |
| `FUREVER_RESET_MINUTES` | `1440` | 重置令牌有效分钟数 |

管理员令牌首次启动时写入 `data/admin-token`，权限 `0600`。忘记令牌可删除该文件后重启。

## 数据存储

SQLite 数据库包含三张表：

- `users`：邮箱、密码哈希、创建 / 登录 / 最近活跃时间
- `sessions`：登录会话令牌哈希、创建 / 最近活跃 / 过期时间
- `password_resets`：重置令牌哈希、用户、创建与过期时间

密码使用 `scrypt` 加盐哈希；令牌只存 SHA-256 哈希，不存明文。
过期会话与重置令牌会定时清理；服务停止时数据库会正常关闭。

## systemd

`deploy/furever.service` 是示例单元，使用前按实际用户与路径修改：

```bash
sudo cp deploy/furever.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now furever
sudo systemctl status furever
```

请把 `EnvironmentFile` 指向受权限保护的配置，或直接在单元里设置所需环境变量。
