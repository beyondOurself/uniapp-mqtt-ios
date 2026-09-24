<template>
  <view class="page">
    <view
      v-for="item in envList"
      :key="item.key"
      class="card"
      :class="{ active: selectedKey === item.key }"
      @click="selectEnv(item.key)"
    >
      <view class="card-title">
        <text>{{ item.label }}</text>
        <text v-if="selectedKey === item.key" class="tag">当前</text>
      </view>
      <text class="url">{{ item.url }}</text>
      <text class="meta">{{ item.username }}</text>
    </view>

    <view class="card">
      <text class="status" :class="status">{{ statusText }}</text>
      <text class="meta">clientId {{ clientId || "-" }}</text>
      <input class="input" v-model="topic" placeholder="主题" />
      <input class="input" v-model="payload" placeholder="消息内容" />
    </view>

    <view class="btns">
      <button class="btn primary" :disabled="connecting" @click="connectMQTT">连接</button>
      <button class="btn" @click="sendMessage">发送</button>
      <button class="btn" @click="disconnect">断开</button>
      <button class="btn" @click="logs = []">清空日志</button>
    </view>

    <scroll-view scroll-y class="log" :scroll-top="scrollTop">
      <text v-for="(line, i) in logs" :key="i" class="line">{{ line }}</text>
    </scroll-view>
  </view>
</template>

<script>
import mqtt from "mqtt/dist/mqtt.js";
import { onSockLog } from "@/utils/sock-log.js";

const envList = [
  {
    key: "prod",
    label: "生产",
    url: "wxs://mqt.bsgoal.net.cn:9084/mqtt",
    username: "bsg_owner_app_2404",
    password: "4BfE842f_9806aKdD",
  },
  {
    key: "pre",
    label: "预生产",
    url: "wxs://accountb.bsgoal.net.cn:9084/mqtt",
    username: "test",
    password: "Tt4@0#kA8",
  },
];

export default {
  data() {
    return {
      envList,
      selectedKey: "pre",
      client: null,
      clientId: "",
      topic: "ios_mqtt_test/ping",
      payload: "Hello from UniApp",
      status: "idle",
      connecting: false,
      logs: [],
      scrollTop: 0,
      connectTimer: null,
    };
  },
  onLoad() {
    onSockLog((line) => this.pushLog(line));
    let info = {};
    try {
      info = uni.getSystemInfoSync();
    } catch (e) {}
    this.pushLog(`平台 ${info.platform || "?"} ${info.system || ""} uni=${info.uniPlatform || ""}`);
    this.pushLog(`WebSocket=${typeof WebSocket} connectSocket=${typeof uni.connectSocket} wx=${typeof wx}`);
  },
  computed: {
    selected() {
      return this.envList.find((e) => e.key === this.selectedKey) || this.envList[1];
    },
    statusText() {
      if (this.status === "connected") return "已连接";
      if (this.status === "connecting") return "连接中";
      if (this.status === "error") return "连接失败";
      if (this.status === "closed") return "已断开";
      return "未连接";
    },
  },
  onUnload() {
    this.disconnect();
  },
  methods: {
    pushLog(msg) {
      const t = new Date().toTimeString().slice(0, 8);
      this.logs = [...this.logs, `${t} ${msg}`].slice(-200);
      this.scrollTop = this.logs.length * 40;
    },
    selectEnv(key) {
      if (this.client) {
        uni.showToast({ title: "请先断开", icon: "none" });
        return;
      }
      this.selectedKey = key;
    },
    connectMQTT() {
      const cfg = this.selected;
      if (this.client) {
        this.pushLog("已有连接，请先断开");
        return;
      }
      const clientId = "uniap_" + Math.random().toString(16).substr(2, 8);
      this.clientId = clientId;
      this.connecting = true;
      this.status = "connecting";
      this.pushLog(`[${cfg.label}] 连接 ${cfg.url}`);
      this.pushLog(`clientId=${clientId} user=${cfg.username} passLen=${String(cfg.password).length}`);
      if (this.connectTimer) clearTimeout(this.connectTimer);

      let client;
      try {
        client = mqtt.connect(cfg.url, {
          clean: true,
          connectTimeout: 10000,
          clientId,
          username: cfg.username,
          password: cfg.password,
          keepalive: 60,
          reconnectPeriod: 0,
        });
      } catch (e) {
        this.connecting = false;
        this.status = "error";
        this.pushLog(`connect 抛错 ${e && e.message} ${e && e.stack}`);
        return;
      }
      this.client = client;
      const opt = client.options || {};
      this.pushLog(`解析 protocol=${opt.protocol} host=${opt.hostname} port=${opt.port} path=${opt.path}`);

      this.connectTimer = setTimeout(() => {
        if (this.status === "connecting") {
          this.pushLog("10s 仍未收到 MQTT connect，看上面 [SOCK] onError/fail");
        }
      }, 10000);

      client.on("connect", (connack) => {
        if (this.connectTimer) clearTimeout(this.connectTimer);
        this.connecting = false;
        this.status = "connected";
        this.pushLog(`[${cfg.label}] MQTT 连接成功 sessionPresent=${connack && connack.sessionPresent}`);
        client.subscribe(this.topic, (err) => {
          if (err) {
            this.pushLog(`订阅失败 ${this.topic} ${err.message || err}`);
            return;
          }
          this.pushLog(`订阅成功 ${this.topic}`);
        });
      });
      client.on("packetsend", (packet) => {
        this.pushLog(`>> ${packet && packet.cmd}`);
      });
      client.on("packetreceive", (packet) => {
        const rc = packet && packet.returnCode;
        this.pushLog(`<< ${packet && packet.cmd}${rc != null ? " returnCode=" + rc : ""}`);
      });
      client.on("message", (topic, message) => {
        this.pushLog(`收到 ${topic} ${message.toString()}`);
      });
      client.on("error", (error) => {
        this.connecting = false;
        this.status = "error";
        this.pushLog(`MQTT error ${error && error.message ? error.message : String(error)} ${error && error.stack ? error.stack : ""}`);
      });
      client.on("offline", () => {
        this.pushLog("offline");
      });
      client.on("reconnect", () => {
        this.pushLog("reconnect");
      });
      client.on("disconnect", (packet) => {
        this.pushLog(`disconnect reasonCode=${packet && packet.reasonCode}`);
      });
      client.on("close", () => {
        this.connecting = false;
        if (this.status === "connecting") this.status = "closed";
        this.pushLog("close");
      });
      client.on("end", () => {
        this.connecting = false;
        if (this.status !== "error") this.status = "closed";
        this.pushLog("end");
      });
    },
    sendMessage() {
      if (!this.client || this.status !== "connected") {
        uni.showToast({ title: "未连接", icon: "none" });
        return;
      }
      const topic = this.topic;
      const body = this.payload;
      this.client.publish(topic, body, (err) => {
        if (err) {
          this.pushLog(`发送失败 ${err.message || err}`);
          return;
        }
        this.pushLog(`已发送 ${topic} ${body}`);
      });
    },
    disconnect() {
      if (!this.client) return;
      const client = this.client;
      this.client = null;
      this.connecting = false;
      try {
        client.end();
      } catch (e) {
        this.pushLog(`断开异常 ${String(e)}`);
      }
      this.status = "closed";
      this.pushLog("已断开");
    },
  },
};
</script>

<style>
.page {
  padding: 24rpx;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;
}
.card.active {
  border-color: #007aff;
}
.card-title {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;
  color: #333;
}
.tag {
  color: #007aff;
  font-size: 24rpx;
}
.url,
.meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
}
.status {
  font-size: 32rpx;
  color: #333;
}
.status.connected {
  color: #19be6b;
}
.status.error {
  color: #fa3534;
}
.input {
  margin-top: 16rpx;
  height: 72rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
}
.btns {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.btn {
  flex: 1;
  min-width: 40%;
  font-size: 28rpx;
  margin: 0;
}
.primary {
  background: #007aff;
  color: #fff;
}
.log {
  height: 520rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
}
.line {
  display: block;
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8rpx;
}
</style>
