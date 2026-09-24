# 需求调研报告 — uniapp-mqtt-ios

> 验证 uni-app 跑在 iOS 上的 MQTT 连接问题。仅记录调研事实与结论，不存放任务排期。

## 一、项目背景与目标

uni-app + `mqtt.js` 在 Android App 上可连 Broker，但在 **iOS App（真机 / 自定义基座）** 上常出现 WebSocket / MQTT 握手失败或静默无回调。需要一个**剥离业务的最小可复现工程**，固定依赖版本与兼容补丁，便于对照业主端（`owner_uniapp`）已验证方案并复用到其他 uni-app 工程。

## 二、问题场景

- 运行端：uni-app Vue3 → App-Plus，重点 **iOS**
- 传输：Broker 提供 `wxs://`（经 `uni.connectSocket`）
- 库：npm `mqtt`，业务侧 `import mqtt from "mqtt/dist/mqtt.js"`
- 典型现象：调用 `mqtt.connect` 后长时间无 `connect` 事件；或 Socket 层 `fail` / `onError`

## 三、对照结论

| 项 | 结论 |
|----|------|
| 依赖版本 | 本样例锁定 **mqtt@3.0.0**（见 `package.json` / `yarn.lock`） |
| App 关键补丁 | `main.js` 在 `#ifdef APP-PLUS` 下为 `uni.connectSocket` 补默认 `success`（与 `owner_uniapp` 同款） |
| 引入方式 | 必须用 `mqtt/dist/mqtt.js`，勿用 Node 主入口 |
| iOS 清单 | `manifest.json` → `app-plus.distribute.ios.urlschemewhitelist: ["ws","wss"]`（改完须重打基座） |

## 四、风险与约束

- 样例页内嵌预发/生产 Broker 账号，仅联调用；勿当生产密钥外泄
- mqtt 4.x 与 3.x API/打包行为不同，本仓库**不升 4.x**，避免干扰复现结论

## 五、结论与建议

以本仓库为「iOS MQTT 能否连上」的验收基线：装好 **mqtt@3.0.0**、保留 **connectSocket 补丁** 与 **wxs + urlschemewhitelist**，再在业务工程对齐同一套处理。
