# 🌿 生命倒计时 LifeCountdown

<div>

![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20PWA-34A853?style=flat-square&logo=android&logoColor=white)
![Language](https://img.shields.io/badge/Language-TypeScript%20%7C%20Java-2D3748?style=flat-square&logo=typescript&logoColor=white)
![Framework](https://img.shields.io/badge/Framework-PWA%20%7C%20TWA-FF6B6B?style=flat-square&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00D4AA?style=flat-square)

</div>

> _每一次亮屏，都是一次提醒。_

**生命倒计时** 是一款帮助用户直观感受时间流逝的自我觉醒工具。通过视觉化的生命进度条、时间分配分析和自由时间统计，激励你重新审视每一天，活出更有意义的人生。

---

## ✨ 功能特性

### 🗓️ 生命倒计时
- 精确到天 / 周 / 季节的生命终点倒计时
- 基于出生日期和预期寿命自动计算
- 生命周历图：52×90 格子，用渐变色彩直观展示生命流逝

### ⏰ 每日时间分配
- 自主配置睡眠、工作、学习、运动、娱乐等时间分类
- 柱状图实时展示每日时间分配比例
- 识别并高亮"真正属于自己的自由时间"

### 🧠 名人名言
- 内置精选名言库，每次打开随机展示一句
- 给你思考，给你力量

### 🌙 极简设计
- 深色琥珀金主题，护眼且有质感
- 极简主义界面，专注于核心数据
- PWA 架构，支持离线使用
- 数据完全存储在本地（localStorage），无隐私风险

---

## 📁 项目结构

\\\
LifeCountdown/
├── android/                        # Android TWA 包装层
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/.../MainActivity.java   # Android 入口
│   │   │   ├── assets/                       # PWA 资源文件
│   │   │   │   ├── index.html                # 主页面
│   │   │   │   ├── app.js                    # 应用逻辑
│   │   │   │   ├── style.css                 # 样式
│   │   │   │   └── sw.js                     # Service Worker
│   │   │   └── res/                          # Android 资源（图标、主题）
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
└── README.md
\\\

---

## 🔧 构建说明

### 前置要求
- Android Studio / Android SDK
- Node.js（可选，用于开发 PWA）
- Bubblewrap CLI（用于 TWA 打包）

### 本地构建
\\\ash
cd android
./gradlew assembleDebug
# APK 输出位置: android/app/build/outputs/apk/debug/app-debug.apk
\\\

---

## 📱 App 下载

| 版本 | 日期 | 说明 |
|------|------|------|
| v4-debug | 2026-04-10 | 最新版，迭代优化中 |

---

## 🚀 未来计划

- [ ] 添加 Widget 小部件
- [ ] 支持 iOS 版本（SwiftUI）
- [ ] 名言库持续更新
- [ ] 暗黑模式切换
- [ ] 数据导出功能

---

*Developed with intention. Built with ❤️.*