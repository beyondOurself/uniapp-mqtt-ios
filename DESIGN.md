# ios_mqtt_test

Minimal MQTT debug console for uni-app iOS verification. Flat light gray canvas, white cards, system-blue primary.

## Overview

Single-screen联调页：环境卡片 + 状态区 + 操作按钮 + 日志滚动区。深度用白底卡片与细边框分层，不用重阴影。主色对齐常见 iOS / 博享家 `#007AFF`，便于与业务 App 视觉对照。

## Colors

- **Primary** (#007AFF): 主按钮、选中环境边框、「当前」标签
- **Background** (#F5F5F5): 页面底
- **Surface** (#FFFFFF): 卡片、日志区
- **Text** (#333333): 标题、状态默认
- **Text Secondary** (#666666): URL、meta、日志行
- **Border Soft** (#EEEEEE): 输入框边框
- **Success** (#19BE6B): 已连接状态字色
- **Error** (#FA3534): 连接失败状态字色

## Typography

- **Headline Font**: 系统默认（uni-app 原生字体栈）
- **Body Font**: 系统默认

- **Title**: 30rpx / #333 — 环境卡片标题
- **Status**: 32rpx — 连接状态
- **Body**: 28rpx — 按钮、输入
- **Meta**: 24rpx — URL、账号、标签
- **Log**: 22rpx / #666 / line-height 1.5 — 日志行

## Spacing

- **Base unit:** 8rpx
- **Scale:** 8, 16, 20, 24
- **Page padding:** 24rpx
- **Card padding:** 24rpx；卡片间距 20rpx
- **Input height:** 72rpx；上边距 16rpx

## Border Radius

- **Small:** 8rpx — 输入框
- **Medium:** 16rpx — 卡片、日志区
- **Full:** 不用于本页主按钮（沿用系统 button）

## Elevation

Flat：无阴影。选中环境用 **2rpx solid Primary** 描边；未选中透明描边占位。

## Components

### Environment Card

**Default** — `bg: #FFF`, `radius: 16rpx`, `padding: 24rpx`, `border: 2rpx transparent`  
**Active** — `border-color: #007AFF`；右侧「当前」`color: #007AFF` `font: 24rpx`

### Buttons

**Primary** — `bg: #007AFF`, `text: #FFF`, `font: 28rpx`, 行内 flex 均分  
**Secondary** — 系统默认 button 样式，同字号  
**Layout** — `flex-wrap` + `gap: 16rpx`，`min-width: 40%`

### Inputs

**Text** — `h: 72rpx`, `border: 1px #EEE`, `radius: 8rpx`, `padding-x: 16rpx`, `font: 28rpx`

### Status Text

**Connected** — `#19BE6B`  
**Error** — `#FA3534`  
**Other** — `#333`

### Log Panel

**Default** — `h: 520rpx`, `bg: #FFF`, `radius: 16rpx`, `padding: 16rpx`；行 `display: block` 可滚动

## Do's and Don'ts

- **Do** 保持单页调试布局，信息密度服务排障
- **Do** 用 Primary 只表示「可操作主路径」与「当前环境」
- **Do** 日志区固定高度，避免挤掉操作按钮
- **Do** 改色前对齐本文件色值
- **Don't** 引入仪表盘式多卡片数据墙
- **Don't** 用紫色渐变 / 大阴影 / 圆角胶囊堆装饰
- **Don't** 在日志区叠悬浮徽章
- **Don't** 为联调页引入重型 UI 组件库（除非验收需要）
