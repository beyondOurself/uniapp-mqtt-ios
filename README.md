# uniapp-mqtt-ios

验证 **uni-app 项目运行到 iOS 时的 MQTT 连接问题** 的最小样例工程。

## 如何运行

1. 用 HBuilderX 打开本目录
2. 安装依赖：`yarn`（锁定 **mqtt@3.0.0**）
3. 运行到 iOS 真机 / 自定义基座 → 选环境 → 连接

## mqtt 版本

| 项 | 值 |
|----|-----|
| npm 包 | `mqtt@3.0.0` |
| 声明 | `package.json` → `"mqtt": "3.0.0"` |
| 锁文件 | `yarn.lock` |
| 引入 | `import mqtt from "mqtt/dist/mqtt.js"` |

## 兼容处理摘要

1. **`main.js`（APP-PLUS）**：为 `uni.connectSocket` 补默认 `success`，避免 iOS App 下 mqtt.js 建连异常  
2. **`utils/mqtt-browser-shim.js`**：webpack / process / `wx=uni` 垫片（按需）  
3. **协议**：Broker 用 `wxs://`；`manifest.json` iOS `urlschemewhitelist` 含 `ws`、`wss`  

完整说明见 [`TECH_DESIGN.md`](./TECH_DESIGN.md)。

## 目录摘要

| 路径 | 作用 |
|------|------|
| `pages/index/index.vue` | 联调页 |
| `main.js` | 入口 + connectSocket 补丁 |
| `TECH_DESIGN.md` | 版本与兼容设计 |
| `DESIGN.md` | UI 规范 |
| `CHANGELOG.md` | 变更归档（本仓库不用 TODO.md） |

## 文档索引

- `RESEARCH.md` / `PRD.md` / `TECH_DESIGN.md` / `AGENTS.md` / `DESIGN.md` / `CHANGELOG.md`

## 注意

页面内联调账号仅供验证；外发前请自行评估脱敏。
