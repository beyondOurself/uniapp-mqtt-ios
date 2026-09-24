# 技术设计

> 目的：验证 uni-app 跑在 iOS 上的 MQTT 连接问题。本章专述依赖版本与兼容处理。

## 技术栈

| 项 | 选型 |
|----|------|
| 框架 | uni-app，`vueVersion: 3` |
| 运行 | HBuilderX → App-Plus（重点 iOS） |
| MQTT | **mqtt@3.0.0**（精确版本，见 `package.json` / `yarn.lock`） |
| 安装 | `yarn`（以 `yarn.lock` 为准；勿混用过期 npm lock） |

## 目录结构

```
ios_mqtt_test/
├── main.js                 # App 下 connectSocket 补丁
├── pages/index/index.vue   # 联调页：连接 / 收发 / 日志
├── utils/
│   ├── mqtt-browser-shim.js  # 浏览器/uni 垫片（按需引入）
│   └── sock-log.js           # Socket 日志桥
├── manifest.json           # iOS urlschemewhitelist
├── package.json            # mqtt: 3.0.0
└── yarn.lock
```

## mqtt 安装版本（强制）

- **声明与安装必须一致：`mqtt@3.0.0`**
- 安装命令：`yarn` 或 `yarn add mqtt@3.0.0`
- 校验：`node_modules/mqtt/package.json` 的 `"version"` 应为 `"3.0.0"`
- **禁止**在未验证的情况下改用 4.x；4.x 打包入口与 App 行为与本样例结论不可直接等同

## 兼容处理（强制）

### 1. App `uni.connectSocket` 补丁（核心）

文件：`main.js`（须在应用入口尽早执行）

```js
// #ifdef APP-PLUS
uni.connectSocket = (function(connectSocket) {
  return function(options) {
    options.success = options.success || function() {}
    return connectSocket.call(this, options)
  }
})(uni.connectSocket)
// #endif
```

- **原因**：`mqtt.js` 经 `uni.connectSocket` 建连时，若未传 `success`，App（尤其 **iOS**）侧易异常或回调异常，导致 MQTT 层收不到 `connect`
- **对照**：与 `owner_uniapp/main.js` 同款
- **范围**：仅 `APP-PLUS`；勿无条件覆盖 H5/小程序原生实现

### 2. 引入浏览器包

页面：`import mqtt from "mqtt/dist/mqtt.js"`

- 使用官方打包好的浏览器包，避免 Node `net`/`tls` 入口进入 App 编译产物

### 3. 浏览器 / uni 垫片（可选）

文件：`utils/mqtt-browser-shim.js`

- 补 `__webpack_require__` 空实现
- `process.title = "browser"`
- 无 `wx` 时 `globalThis.wx = uni`（部分 mqtt 路径走 wx Socket API）

按需在入口 `import`；当前联调页主要依赖 dist 包 + connectSocket 补丁。

### 4. 协议与 iOS URL Scheme 白名单（强制）

- Broker URL 使用 **`wxs://`**（uni-app App WebSocket 约定）
- **iOS 必须**在 `manifest.json` 放开 `ws` / `wss`，否则真机 WebSocket 建连会被系统拦截

文件：`manifest.json` → `app-plus.distribute.ios`

```json
"ios" : {
    "urlschemewhitelist" : [ "ws", "wss" ]
}
```

- **路径**：`app-plus` → `distribute` → `ios` → `urlschemewhitelist`
- **值**：必须含 `"ws"`、`"wss"`（与 `wxs://` 底层协议对应）
- **生效**：改完须 **重新打包 / 自定义基座** 后再测 iOS；仅改源码热更新不够
- **禁止**：删掉该字段或留空数组后再测「iOS MQTT 连不上」

### 5. 连接参数（样例）

`mqtt.connect(url, { clean, connectTimeout: 10000, clientId, username, password, keepalive: 60, reconnectPeriod: 0 })`

联调默认关闭自动重连，便于观察单次失败原因。

## 验证与排查

1. HBuilderX 运行到 **iOS 真机 / 自定义基座**
2. 选预发 → 连接 → 日志出现 `MQTT 连接成功`
3. 若卡在「连接中」：查补丁是否生效、`urlschemewhitelist`、账号、网络；看页面内 Socket 能力探测日志
4. Android 对照：同一工程应同样能连，用于区分「仅 iOS」问题

## 多端差异

| 端 | 本仓库态度 |
|----|------------|
| iOS App | **验收重点** |
| Android App | 对照 |
| H5 / 小程序 | 非目标 |

## 密钥说明

`pages/index/index.vue` 内嵌联调账号，提交远程仅作样例；业务工程请改自有配置，勿扩散。
