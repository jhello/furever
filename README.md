# 毛孩子 · FurEver

一个自托管的「宠物档案」应用：Android 客户端 + Linux 服务端。

- **毛孩子** 是中文名，**FurEver** 是英文名。
- **邮箱注册 / 登录**：邮箱是唯一登录标识。支持修改邮箱、修改密码、忘记密码重置。
- **宠物档案**：来源、类型、名字、性别、出生日期、相识时间、在一起时间、绝育信息等，通过聊天式固定选项采集。
- **本地优先**：所有宠物资料都保存在当前客户端的 `localStorage`；服务端只保存账户登录信息，不上传宠物资料。
- **离线可用**：页面与宠物数据都在本机，没有网络也能打开。登录、账户安全等功能需要服务端。
- **一套界面**：服务端在 `/app/` 直接提供同一套 HTML5 界面，Android 是一个很薄的 WebView 外壳；将来上 iOS 时用 `WKWebView` 包一层即可。
- **无构建步骤**：前端是原生 HTML / CSS / JavaScript，改完刷新即可；服务端零依赖，直接 `node server/src/server.js`。

## 应用结构

页面没有标题栏和页面标题。Android 使用系统返回键，iOS 使用从屏幕左侧边缘右滑返回。
顶部控件会自动避开状态栏、挖孔和灵动岛等安全区域。

| 页面 | 作用 |
| --- | --- |
| 登录 / 注册 | 邮箱与密码，中英文切换 |
| 主页 | 聊天式宠物向导；已保存的宠物会显示为档案卡片，可继续添加 |
| 设置 | 右上角猫爪按钮进入，含账户与安全、关于、退出登录 |
| 账户与安全 | 更换邮箱、更改密码、忘记密码重置 |
| 关于 | 版本、本地数据与服务说明 |

界面语言支持中文 / English，默认跟随系统语言。

## 项目结构

```text
web/                  原生 HTML/CSS/JS 前端（Android、浏览器共用）
server/               零依赖 Node.js HTTP 服务（node:sqlite）
server/public/dashboard/  管理员看板（原生 HTML/CSS/JS）
android/              薄 WebView 外壳
scripts/              启停服务、构建与安装 APK
data/                 运行时数据（SQLite、PID、日志、管理员令牌，已 gitignore）
deploy/               systemd 服务示例
docs/                 API / 服务端 / Android 文档
```

## 本地运行

需要 Node.js 22.5+（本项目开发时使用 26.x）。

```bash
# 前台启动（开发）
node server/src/server.js

# 或后台启动，日志与 PID 写入 data/，不占用当前终端
./scripts/start-server.sh
./scripts/stop-server.sh
./scripts/status-server.sh
```

启动后：

- `http://localhost:3000/` — 管理看板（需要管理员令牌）
- `http://localhost:3000/app/` — 手机 / 浏览器共用的应用界面
- `http://localhost:3000/api/health` — 健康检查

管理员令牌在首次启动时自动生成于 `data/admin-token`（权限 0600），也可用 `FUREVER_ADMIN_TOKEN` 指定。

## Android

需要 JDK 17+、Android SDK Platform 36、Build-Tools 36 与 `adb`。

```bash
# 构建 APK（输出到 build/android/furever.apk）
./scripts/build-android.sh

# 构建 + 安装 + 启动，并转发 3000 端口到手机
./scripts/dev-android.sh
```

`dev-android.sh` 会执行 `adb reverse tcp:3000 tcp:3000`，手机上访问 `http://127.0.0.1:3000` 即电脑上的服务端。
如果手机和电脑不在同一台机器，可用 `FUREVER_SERVER_URL=http://<电脑IP>:3000 ./scripts/build-android.sh` 指定默认服务地址。

## 数据说明

- 服务端：`data/furever.db`（SQLite）保存邮箱、密码哈希、登录会话与重置令牌。
- 客户端：宠物资料保存在 `localStorage`，键名为 `furever.pets`；登录状态为 `furever.token` / `furever.email`。
- 忘记密码：当前为开发模式，重置令牌会直接返回给客户端显示，不发送邮件。

## 文档

- `docs/API.md` — API 合同
- `docs/SERVER.md` — 服务端配置与部署
- `docs/ANDROID.md` — Android 构建与调试

## GitHub

仓库：Public，`jhello/furever`。
