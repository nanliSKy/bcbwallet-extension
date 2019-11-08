import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from 'axios';
import $url from './utils/url.js'
import 'mint-ui/lib/style.css';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n)
import './assets/css/reset.css'
import './assets/css/common.styl'
import { CHINESE } from '@/utils/regexp';
Vue.prototype.Base64 = require('js-base64').Base64
// import './../public/bcbjs.js'
import { PopupAPI } from '@bcblink/lib/api';
import MessageDuplex from '@bcblink/lib/MessageDuplex';
import '@bcblink/lib/constants'

let duplex = new MessageDuplex.Popup()
PopupAPI.init(duplex);

duplex.on('setState', appState => {
  console.log(appState,'状态变化')
  store.state.appState = appState
});
// 监听请求确认队列
duplex.on('setConfirmations', confirmations => {});
// 监听账户选择
duplex.on('setAccount', account => {
  console.log(account,'我的账户')
  store.state.account = account
});
// 监听账户列表
duplex.on('setAccounts', accounts => {
  console.log(accounts,'账户列表')
  let arr = []
  for(let key in accounts){
    let param = {}
    param.walletAddr = key
    param.walletName = accounts[key].name
    param.type = accounts[key].type
    arr.push(param)
  }
  store.state.accounts = arr
});
// 监听设置
duplex.on('setSetting', setting => {});


Vue.prototype.PopupAPI = PopupAPI
Vue.prototype.$http = axios
Vue.prototype.$url = $url// 数据请求地址
let lang = window.navigator.language;
let locale;
if (CHINESE.test(lang)) {
  locale = 'zh-CN';
} else {
  locale = 'en-US';
}
const i18n = new VueI18n({
  locale, // 语言标识, 通过切换locale的值来实现语言切换,this.$i18n.locale 
  messages: {
    'zh-CN': require('./lang/cn'), // 中文语言包
    'en-US': require('./lang/en') // 英文语言包
  }
})
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
