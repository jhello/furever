# Android

Android 端是一个很薄的 WebView 外壳，界面全部来自共享的 `web/` 目录。
`MainActivity` 只负责：

- 加载打包进 APK 的 `assets/www/index.html`
- 把状态栏 / 挖孔 / 键盘的边距交给网页（`AndroidBars.getTopInsetDp()`）
- 把系统返回键交给网页（`window.__fureverSystemBack()`），在根页面才退出应用
- 打开 `chrome://inspect` 调试

## 环境

- JDK 17+
- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- `adb`（手机调试）

项目不依赖 Gradle wrapper 或 npm。构建脚本直接使用 `aapt2` / `javac` / `d8` / `zipalign` / `apksigner`。

## 构建与安装

```bash
./scripts/build-android.sh
adb install -r build/android/furever.apk
adb shell am start -n com.furever.app/.MainActivity
```

构建脚本会：

1. 复制 `web/` 到 `build/android/assets/www/`，并写入当前默认服务地址到 `config.js`
2. 用 `aapt2` 编译资源并链接成未签名 APK
3. 用 `javac` 编译 Java，`d8` 生成 `classes.dex`
4. 用 `zipalign` 对齐，用开发证书签名并验证

开发签名证书默认在 `~/.furever/furever-dev.jks`，可用 `FUREVER_KEYSTORE` 覆盖。

## 手机调试

先启动服务端，然后：

```bash
./scripts/dev-android.sh
```

该脚本会构建、安装、启动应用，并执行 `adb reverse tcp:3000 tcp:3000`。
这样手机上的 `http://127.0.0.1:3000` 会转发到电脑上的服务端，不需要同一局域网。

如果不用脚本：

```bash
./scripts/build-android.sh
adb reverse tcp:3000 tcp:3000
adb install -r build/android/furever.apk
```

构建时也可指定服务端地址：

```bash
FUREVER_SERVER_URL=http://<电脑IP>:3000 ./scripts/build-android.sh
```

应用内的 `furever.server` 本地存储优先级最高，可在浏览器控制台修改后重新打开页面。

## 查看 WebView 日志

```bash
adb logcat | grep -i furever
# 或连接 Chrome 开发者工具
adb forward tcp:9222 localabstract:webview_devtools_remote_$(adb shell pidof com.furever.app)
```

## 图标

图标来自项目原有粉色猫爪图片，已生成各密度图像与自适应图标前景，位于：

```text
android/app/src/main/res/mipmap-*/ic_launcher.png
android/app/src/main/res/mipmap-*/ic_launcher_foreground.png
android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
```

自适应图标背景色为 `#FAA2B6`。
