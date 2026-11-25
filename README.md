# 毛孩子 FurEver

一个简单的服务器-客户端项目。服务端只保存账户登录信息，宠物资料等所有业务数据都保存在客户端本地。

## 项目结构

- `server/`：Node.js + Express 服务端，提供邮箱注册/登录/账户安全 API，并带一个简单看板。
- `client/`：React + Vite + TypeScript 的 H5 客户端，通过 Capacitor 打包 Android，后续可补齐 iOS。

当前客户端页面：

- 邮箱登录 / 注册（中英文切换）
- 聊天式主页（仿 ChatGPT 的问答引导，固定选项直接点击按钮）
- 宠物信息采集向导（本地保存）
- 设置页：账户与安全（更换邮箱、更改密码、忘记密码重置）、关于
- 页面不显示标题栏；Android 使用系统返回键，iOS 使用左侧边缘右滑返回
- 顶部控件避开系统状态栏 / 灵动岛等安全区域

## 本地运行

需要 Node.js 20+。

```bash
# 服务端
cd server
npm install
npm run dev
# http://localhost:3000 是看板，http://localhost:3000/api 是 API

# H5 客户端（另开一个终端）
cd client
npm install
npm run dev
# http://localhost:5173
```

Android（需要 JDK 21 与 Android SDK Platform 36 / Build-Tools 36）：

```bash
cd client
npm install
npm run build
npx cap add android   # 只在第一次执行
npx cap sync android
npx cap open android   # 用 Android Studio 打开并运行
```

如果手机和电脑在同一局域网，Android 上需要把 API 地址改成电脑的局域网 IP：

```bash
VITE_API_BASE_URL=http://<电脑IP>:3000 npm run build
npx cap sync android
```

## 应用图标

图标源文件位于项目根目录的 `Flauschiger Pfotenabdruck auf Rosa.png`，已生成到 `client/android/app/src/main/res/mipmap-*`，同时配置了 Android 自适应图标。

## 数据说明

- 服务端：`server/data/accounts.json` 保存邮箱、密码哈希、登录时间等账户信息（该文件已 gitignore）。
- 客户端：宠物资料保存在浏览器/Android WebView 的 `localStorage`，键名为 `furever.pets`。
- 忘记密码：当前是 MVP，没有接入邮件发送，重置令牌会直接返回给客户端显示，便于本地联调。

## GitHub

仓库：Public，名称 `furever`。
