import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accounts:[],//钱包列表
    account:{},//我的钱包信息
    appState:0,//流程状态
  	myAddress:''//主界面显示使用address
  },
  mutations: {},
  actions: {}
});
