# Trusted Web Activity — 生命倒计时

## 应用概述

**应用名称**: 生命倒计时  
**包名**: com.lifecountdown.app  
**版本**: 1.0.0  
**构建日期**: 2026-04-06

## 功能特性

- PWA + TWA 架构，离线可用
- 生命倒计时（天/周/季节）
- 生命周历图（渐变颜色表示生命流逝）
- 每日时间分配可视化
- 自由时间高亮统计
- 名人名言随机展示
- 深色琥珀金主题
- 数据完全存储在本地（localStorage），无隐私风险

## 技术架构

- 前端：纯 HTML/CSS/JS PWA
- 打包：Trusted Web Activity (Bubblewrap)
- 最低支持：Android 5.0 (API 21)
- 签名：Google Play 应用签名（无需自行管理）

## 文件结构

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml    # 应用清单
│   │   ├── java/.../MainActivity.java
│   │   └── res/                   # 资源文件
│   ├── build.gradle               # 模块构建配置
│   └── proguard-rules.pro
├── build.gradle                   # 项目构建配置
├── settings.gradle
├── gradle.properties
└── gradlew / gradlew.bat         # Gradle Wrapper
```

## TWA 工作原理

1. PWA 运行在浏览器的 Trusted Web Activity 容器中
2. 通过 Digital Asset Links 验证网站所有权
3. 应用本身只是一个极简的 Android Shell
4. 所有 UI/逻辑由 PWA 提供
5. Google Play 管理应用签名

## 局限性

- 无法实现系统级功能（灵动岛、悬浮窗、后台服务等）
- 无法访问未在 Web API 中暴露的系统 API
- App Store 不可用（仅限 Google Play）
