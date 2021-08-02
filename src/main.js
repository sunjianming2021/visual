import Vue from 'vue';
import axios from 'lib/axios';
import SocketService from 'lib/websocket';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/global.stylus';
// 引入字体文件
import './assets/font/iconfont.css';
// 主题文件
import './assets/theme/chalk';
import './assets/theme/vintage';

Vue.prototype.$http = axios;
SocketService.Instance.connection();
Vue.prototype.$socket = SocketService.Instance;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
