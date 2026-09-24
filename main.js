import App from './App'


// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif


// 修复 App 环境下 mqtt.js 的兼容性问题
// #ifdef APP-PLUS
uni.connectSocket = (function(connectSocket) {
  return function(options) {
    options.success = options.success || function() {}
    return connectSocket.call(this, options)
  }
})(uni.connectSocket)
// #endif