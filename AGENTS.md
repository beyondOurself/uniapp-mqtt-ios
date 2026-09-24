# AGENTS

> 长期开发规范。进度与变更只写 `CHANGELOG.md`，**不维护 TODO.md**。

## 项目概述

- **定位**：验证 **uni-app 运行到 iOS 时的 MQTT 连接问题** 的最小样例
- **栈**：uni-app Vue3 + mqtt@3.0.0 + HBuilderX App
- **远程**：`git@github.com:beyondOurself/uniapp-mqtt-ios.git`

## 开发规范

- 默认最小改动；优先改用户指定路径
- Windows：PowerShell；路径注意反斜杠与 uni-app 条件编译
- App 专有逻辑用 `#ifdef APP-PLUS`

## mqtt 与兼容（强制）

- 依赖锁定 **mqtt@3.0.0**（`package.json` + `yarn.lock`），安装用 yarn
- 保留 `main.js` 中 App 下 `uni.connectSocket` 的 `success` 补丁，禁止无说明删除
- 业务引入统一 `mqtt/dist/mqtt.js`
- Broker 用 `wxs://`；`manifest.json` → `app-plus.distribute.ios.urlschemewhitelist` 须为 `["ws","wss"]`，改完须重打 iOS 基座
- 细节见 `TECH_DESIGN.md`「mqtt 安装版本」「兼容处理」

## UI 与 DESIGN.md（强制）

- 根目录 **`DESIGN.md`** 为 UI 设计规范单一事实来源
- 改页面/样式前须阅读并遵守 `DESIGN.md`

## 文档协作

- 顺序：`RESEARCH.md` → `PRD.md` → `TECH_DESIGN.md` → `AGENTS.md`
- **不使用 TODO.md**；已完成与变更只写 `CHANGELOG.md`
- 需求变更改 PRD/RESEARCH；方案改 TECH_DESIGN；规则改 AGENTS；视觉改 DESIGN.md

## 跨设备

- 开发前读 `CHANGELOG.md` 与 `TECH_DESIGN.md` 了解当前结论

## 代码风格

- 缩进 2 空格；命名与现有文件一致
- 注释仅用于非显而易见的兼容/平台逻辑

## 提交规范（强制中文）

- 描述内容中文为主
- 格式：`类型(范围): 内容摘要`（Conventional Commits）
- 类型：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore`
- 单次提交聚焦单一改动
- 严禁 `fix: .`、`update`、`修改文件` 等笼统描述

## 测试与发布

- 改 MQTT / 补丁后须 **iOS 真机** 验证连接
- 证书、密钥勿新增进仓库；样例内联调账号勿当生产密钥宣传

## 注意事项

- 本仓库非业务 App，勿塞入登录/推送/RTC 等与「验证 iOS MQTT」无关的大模块
