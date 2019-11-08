<template>
  <div class="main-all pos-r" :class="{bgfff:tabIndex == 0}"  v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="count">
  	<img src="../../assets/images/main/main_bg.png" class="pos-a main-bg" v-if="tabIndex == 0">
    <div class="flex flex-jc-b">
      <div class="main-tab pos-r flex" :class="{mb23:tabIndex != 0}">
        <div v-for="(item,index) in tabArr" @click="clickTab(item,index)" class="pos-r cur-p">
          <span class="fs14 colorfff" :class="{'bold':tabIndex == index,'color444':tabIndex != 0}">{{item}}</span>
          <div v-if="tabIndex == index" class="bgfff pos-a" :class="{'bg0170FF':tabIndex !=0}"></div>
        </div>
      </div>
      <div class="net-work pos-r" v-if="tabIndex == 0">
        <div class="flex flex-jc-c flex-ai-c" @click.stop="netWorkEv">
          <span>{{ valueRadio }}</span>
          <span></span>
        </div>
        <div class="pop-net" v-if="netWorkPopShow" v-click-outside="onClickoutside">
          <h2>网络</h2>
          <p>默认以BCB网络为主网</p>
          <div>
            <!-- <div v-for="(item,index) in chainsArr" :key="index">
              <mt-radio
                title="radio list"
                v-model="value"
                :options="['optionA', 'optionB', 'optionC']">
              </mt-radio>
              <span>{{item}}</span>
            </div> -->
            <mt-radio
              v-model="valueRadio"
              :options="chainsArr">
            </mt-radio>
          </div>
        </div>
      </div>
      
    </div>
  	
  	<div v-if="tabIndex == 0" class="part-0">
  		<div class="main-center pos-r m-auto bgfff">
  			<h3 class="fs14 color444 tac">{{ walletName.length>12 ? walletName.substr(0,4)+'...'+walletName.substr(-4):walletName}}的资产({{ selCoinObj.symbol }})</h3>
  			<div class="line"></div>
  			<div class="fs36 color444 tac main-num pos-r" @click="gotoDetail">
  				<span :class="{'sx_ft':sxShow}">{{selCoinObj.balance}} </span><!-- <span class="fs16">{{selCoinObj.symbol}}</span> -->
  				<img src="../../assets/images/main/arrow_right.png" class="pos-a">
  			</div>
  			<div class="fs14 color999 tac">≈{{selLegalCurrency == 'CNY' ? '¥' :'$'}}{{selCoinObj.legalValue}}</div>
  			<div class="main-btn flex flex-jc-b">
  				<div class="tac cur-p" @click="gotoTransfer">转账</div>
  				<div class="colorfff tac cur-p" @click="gotoReceipt">收款</div>
  			</div>
  		</div>
  		<div class="tran-record m-auto">
  			<h3 class="fs14 color444">交易记录</h3>
  			<div v-if="tranRecord.length">
  				<div v-for="(item,index) in tranRecord" :key="index" class="tran-detail bgfff flex flex-ai-c cur-p" @click="recordDetail(item,index)">
  					<img src="../../assets/images/main/down.png" v-if="item.from == myAddress">
  					<img src="../../assets/images/main/up.png" v-if="item.from != myAddress">
  					<div class="flex flex-jc-b tran-data-addr flex-ai-c">
  						<div>
  							<p class="color444">{{(item.from == myAddress ? item.to : item.from).substr(0,12)}}...{{(item.from == myAddress ? item.to : item.from).substr(-8)}}
  							</p>
  							<p class="color999">{{item.modifyTime.replace('T',' ')}}</p>
  						</div>
  						<span class="color0170FF" :class="{colorFF6F6F:item.from == myAddress}">{{item.from == myAddress ? '-' : '+'}}{{item.value}}{{item.valueName}}</span>
  					</div>
  					
  				</div>
  			</div>
  			<div v-if="!tranRecord.length" class="no-record tac color999">
  				暂无交易记录
  			</div>
  			<div v-if="loadingTip" class="flex flex-ai-c flex-jc-c"><mt-spinner type="fading-circle"></mt-spinner><span style="margin-left:10px">加载中...</span></div>
  			<div class="color999 tac" v-if="noLast" style="margin-bottom:10px">没有更多了</div>
  			
  		</div>
  	</div>
  	<div v-if="tabIndex == 1" class="part-1 bgfff">
  		<div class="wallet m-auto">
  			<div v-for="(item,index) in walletArr" :key="index" class="wallet-single flex flex-jc-b cur-p pos-r" :class="{'selWallet':myAddress == item.walletAddr}" @click="selWallet(item,index)">
  				<div>
  					<div class="wallet-name flex">
  						<h3 class="fs14 ell" style="width:220px">{{item.walletName}}</h3>
  						<!-- <span class="tac fs12" :class="{'orange':item.type=='未备份','blue':item.type=='导入'}">{{item.type }}</span> -->
  					</div>
  					<div class="flex">
  						<p>{{item.walletAddr.substr(0,12)}}...{{item.walletAddr.substr(-8)}}</p>
  						<img src="../../assets/images/main/copy.png" @click.stop="copy(item.walletAddr)">
  					</div>
  				</div>
  				<img src="../../assets/images/main/more.png" class="copy" @click.stop="gotoMore(item,index)">
  				<img src="../../assets/images/main/dui.png" class="pos-a duigou" v-if="myAddress == item.walletAddr">
  			</div>
  		</div>
  		<div class="m-auto">
  			<div class="threeBlueBtn create-wallet flex flex-ai-c flex-jc-c bold m-auto colorfff cur-p" @click="gotoCreateWallet">
  				<img src="../../assets/images/main/create.png">
  				<span>创建钱包</span>
  			</div>
  			<div class="threeBlueBtn import-wallet flex flex-ai-c flex-jc-c bold m-auto cur-p" @click="gotoImportWallet">
  				<img src="../../assets/images/main/import.png">
  				<span>导入钱包</span>
  			</div>
  		</div>
  	</div>
  	<div v-if="tabIndex == 2" class="part-2 bgfff">
  		<div class="m-auto">
  			<div v-for="(item,index) in setArr" :key="index" @click="toRightDetail(item,index)">
  				<div class="flex flex-jc-b set-word cur-p">
  					<span>{{item.name}}</span>
  					<div class="set-right flex flex-ai-c">
  						<div v-if="index == 0" class="flex flex-ai-c">
  							<img src="../../assets/images/open/lan_cn.png" v-if="$i18n.locale == 'zh-CN'">
  							<img src="../../assets/images/open/lan_en.png" v-if="$i18n.locale == 'en-US'">
  							<span>{{$i18n.locale == 'zh-CN'?'中文':'English'}}</span>
  						</div>
              <!-- <div v-if="index==1">
                <mt-switch v-model="switchValue"></mt-switch>
              </div> -->
  						<div v-if="index==1">{{selOption.label}}</div>
              <div v-if="index==2">{{nodeChose}}</div>
              <div v-if="index==3">{{selLegalCurrency}}</div>
  						<div class="to-right" v-if="!(index == 5)" :class="{'to-right-active':item.active}"></div>
  					</div>
  				</div>
  				<div v-if="index == 0" class="lan-all dn" :class="{db:item.active}">
  					<div v-for="(item,index) in lanArr" :key="index" class="flex flex-ai-c cur-p" @click="setLan(item,index)" :class="{'lan-active':lanActive == index}">
  						<img src="../../assets/images/open/lan_cn.png" v-if="index == 0">
  						<img src="../../assets/images/open/lan_en.png" v-if="index == 1">
  						<span>{{item.name}}</span>
  					</div>
  				</div>
  				<div v-if="index == 3" class="lan-all dn" :class="{db:item.active}">
  					<div v-for="(item,index) in legalCurrencyArr" :key="index" class="flex flex-ai-c coin-single cur-p" @click="setLegalCurrency(item,index)" :class="{'lan-active':lanActive1 == index}">
  						<span>{{item.name}}</span>
  					</div>
  				</div>
  			</div>
  		</div>
  	</div>
  	<div class="pop-modal pos-f" v-if="popupVisible">
  		<div class="popBox pos-a bgfff fs12">
  			<img src="../../assets/images/main/close.png" class="close pos-a cur-p" @click="close">
  			<div class="popTitle fs16 tac bold">{{recordDetailData.from == myAddress ? '-' : '+'}}{{recordDetailData.value}}{{recordDetailData.valueName}}</div>
  			<div class="popBody">
  				<div>
  					<span>发送方</span>
  					<span class="width200">{{recordDetailData.from}}</span>
  				</div>
  				<div>
  					<span>接收方</span>
  					<span class="width200">{{recordDetailData.to}}</span>
  				</div>
  				<div>
  					<span>网络手续费</span>
  					<span>{{recordDetailData.fee}} BCB</span>
  				</div>
  				<div>
  					<span>备注</span>
  					<span>{{recordDetailData.memo}}</span>
  				</div>
  				<div class="line"></div>
  				<div>
  					<span>交易hash</span>
  					<span class="width200">{{recordDetailData.txHash}}</span>
  				</div>
  				<div>
  					<span>区块</span>
  					<span>{{recordDetailData.blockN}}</span>
  				</div>
  				<div>
  					<span>交易时间</span>
  					<span>{{recordDetailData.modifyTime.replace('T',' ')}}</span>
  				</div>
  			</div>
  			
  			<div class="btn-go colorfff cur-p fs14 flex flex-jc-c flex-ai-c pos-a" @click="gotoBcbscan(recordDetailData.txHash)">
  				<span>bcbscan </span>
  				<img src="../../assets/images/main/jump.png">
  			</div>
  		</div>
  	</div>
  	<mt-popup
  	  v-model="HAS_REMARK_MNEM"
  	  position="bottom" style="height: initial;width: 330px;box-shadow: 0 0 6px 0 #E3E7F2;
      border-radius: 4px;margin-bottom:6px">
  	    <div>
  	    	<div class="pop-head bold fs16">安全提醒</div>
  	    	<div class="pop-body m-auto">
  				<div class="p-body-1 flex flex-ai-c">
  					您的钱包助记词未备份，请务必备份助记词，助记词可用于恢复钱包资产，防止忘记密码、应用删除、浏览器中毒等情况导致资产损失。
  				</div>
  				<div class="p-body-btn flex flex-jc-b">
  					<div class="colorfff bold cur-p" @click="HAS_REMARK_MNEM = false">稍后提醒</div>
  					<div class="colorfff bold cur-p" @click="gotoRemark">立即备份</div>
  				</div>
  	    	</div>
  	    </div>
  	</mt-popup>
    <div class="pop-modal pos-f" v-if="islogoutBoxShow">
      <div class="logoutBox pos-a bgfff">
        <div class="tac">
          是否退出当前账号？
        </div>
        <div class="flex flex-jc-c c-button">
          <div @click="logoutCancel">取消</div>
          <div @click="logoutConfirm">确认</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { directive as clickOutside } from 'v-click-outside-x';
import Vue from "vue";
import { Toast,InfiniteScroll,Spinner,Switch,Radio } from "mint-ui";
import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);
Vue.use(InfiniteScroll);
Vue.component(Spinner.name, Spinner);
Vue.component(Switch.name, Switch);
Vue.component(Radio.name, Radio);
// Vue.component(Popup.name, Popup);
export default {
  name: "mainPage",
  directives: { clickOutside },
  data(){
  	return {
  		BASE_URL: process.env.VUE_APP_LOCAL_BASE_URL,
      BCBID:process.env.VUE_APP_BCBID,
      BCBSCAN:process.env.VUE_APP_BCBSCAN,
      CHAINID:process.env.VUE_APP_CHAINID,
  		myAddress:'',
  		tabIndex:'0',
  		tabArr:['交易','钱包','设置'],
  		tranRecord:[],
  		walletArr:[],//钱包信息
  		selWalletIndex:'0',
  		setArr:[
  			{name:'设置语言',active:false},
        {name:'自动签名授权',active:false},
        {name:'节点选择',active:false},
  			{name:'计价货币',active:false},
  			{name:'修改密码',active:false},
  			{name:'退出登录',active:false},
  		],
  		lanArr:[
  			{name:'中文',active:false,value:'zh-CN'},
  			{name:'English',active:false,value:'en-US'},
  		],
  		legalCurrencyArr:[
  			{name:'CNY',active:false,value:'CNY'},
  			{name:'USD',active:false,value:'USD'},
  		],
      selOption:{
        label:'不自动签名',status:0
      },
  		recordDetailData:{},
  		lanActive:'0',
  		lanActive1:'0',
  		selLegalCurrency:'CNY',
  		popupVisible:false,
  		initComeing:true,
  		initCoinArr:[],
  		selCoinObj:{symbol:'',balance:'0',legalValue:'0'},
  		cAddress:'',
  		page:1,
  		count:10,
  		loading:false,
  		loadingTip:false,
  		noLast:false,
  		HAS_REMARK_MNEM:true,
      sxShow:false,
      switchValue:false,
      islogoutBoxShow:false,
  		chainsArr:[],//链集合
      valueRadio:'',
      netWorkPopShow:false,
      walletName:'',
      nodeChose:'',
      contractAddr:'',
      selChainId:''
  	}
  },
  watch:{
    valueRadio:function(newValue,oldValue){
      if(oldValue != ''){
        let _this = this
        console.log(newValue,'新值',oldValue,'主测链')
        _this.selChainId = newValue.substring(0,newValue.length-2)
        _this.PopupAPI.setChain(_this.selChainId).then(res=>{
          _this.tranRecord = []
          _this.page = 1
          _this.zuichuInitData()
          _this.getAssets().then(suc =>{
            _this.getAddrBalance()
          })
        })
      }
    }
  },
  created(){
    let _this =this
    _this.selCoinObj.symbol = _this.CHAINID == 'devtest' ? 'DEVT' :
    _this.CHAINID == 'bcb' ? 'BCB' :
    _this.CHAINID == 'bcbtest' ? 'BCBT' : ''
    _this.PopupAPI.getChain().then(res=>{
      if(res == _this.CHAINID){
        _this.valueRadio = res+ '主链'
      }else{
        _this.valueRadio = res+ '侧链'
      }
      _this.selChainId = res
      _this.zuichuInitData()
    })
  	
    
  },
  methods:{
    zuichuInitData(){
      let _this = this

      _this.lanActive = this.$i18n.locale == 'zh-CN' ? '0' : '1'//设置语言
      _this.selLegalCurrency = localStorage.getItem('selLegalCurrency') || 'CNY'
      localStorage.setItem('selLegalCurrency',this.selLegalCurrency)
      _this.lanActive1 = this.selLegalCurrency == 'CNY' ? '0' : '1'//设置货币

      let state = _this.$store.state.appState//获取状态
      if(state == 0){
        _this.PopupAPI.requestState().then(res=>{
          if(res<2){
            sessionStorage.removeItem('tabIndex')
            _this.$router.push('/open/fromMain')
          }
        })
      }else{
        if(state<2){
          sessionStorage.removeItem('tabIndex')
          _this.$router.push('/open/fromMain')
        }
      }
      
      _this.tranRecord = []
      let initCome = localStorage.getItem('initComeing')//是否第一次进来
      if(initCome){
        _this.initComeing = initCome == 'true'?true:false
      }
      let HAS_REMARK_MNEM = localStorage.getItem('HAS_REMARK_MNEM')
      if(HAS_REMARK_MNEM){
        _this.HAS_REMARK_MNEM = HAS_REMARK_MNEM == 'true' ? false : true
      }//是否备注助记词
      _this.tabIndex = sessionStorage.getItem('tabIndex') || '0'//tab切换
      // this.account = JSON.parse(localStorage.getItem('myAddress'))//当前账户

      _this.PopupAPI.getNodes().then(res=>{
        console.log(res,'获取所有节点结果')
        let nodes = res.nodes
        let selNode = res.selected
        for(let key in nodes){
          if(key == selNode){
            _this.nodeChose = nodes[key].host
            break
          }
        }
      })

      let account = _this.$store.state.account
      _this.PopupAPI.getSelectedAccount().then(res=>{
        _this.myAddress = res.address
        _this.walletName = res.name
        _this.$store.state.account = res
      })

      _this.PopupAPI.getAccounts().then(accounts=>{
        let arr = []
        for(let key in accounts){
          let param = {}
          param.walletAddr = key
          param.walletName = accounts[key].name
          param.type = accounts[key].type
          arr.push(param)
        }
        _this.walletArr = arr
        _this.$store.state.accounts = arr
      })

      
      
      
      /*获取签名时长设置*/
      this.PopupAPI.getSetting().then(res=>{
          _this.selOption.status = res.autoConfirm.duration/3600000
          _this.selOption.label = _this.selOption.status == 0 ? '不自动签名':
                                  _this.selOption.status == 0.5 ? '30分钟内自动签名':
                                  _this.selOption.status == 1 ? '1小时内自动签名':
                                  _this.selOption.status == 24 ? '一天内自动签名':'不自动签名'
      }).catch(err=>{
        Toast({
          message:err,
        })
      })
         /*币种和余额*/
      let initArr = localStorage.getItem('initCoinArr')
      this.initCoinArr = initArr ? JSON.parse(initArr) : []
      let selCoinObjAb = localStorage.getItem('selCoin')
      if(selCoinObjAb){
        this.selCoinObj = JSON.parse(selCoinObjAb)
      }
      console.log(String(this.selCoinObj.balance),'balance')
      this.sxShow = String(this.selCoinObj.balance).length>9 ? true : false
    },
    netWorkEv(){
      this.netWorkPopShow =!this.netWorkPopShow
      this.netWorkPopShow == true && this.chainsAll()
    },
    onClickoutside(){
      this.netWorkPopShow = false
    },
    chainsAll(){
      let _this = this
      _this.chainsArr = []
      _this.PopupAPI.getAllChains().then(res=>{
        console.log(res,'获取所有节点')
        res.forEach((item,index)=>{
          let param = {}
          if(item == _this.CHAINID){
            param.label = item+'主链'
            param.value = item+'主链'
          }else{
            param.label = item+'侧链'
            param.value = item+'侧链'
          }
          
          
          _this.chainsArr.push(param)
        })
        if(!_this.selChainId){
          _this.selChainId = _this.chainsArr[0].value
          _this.valueRadio = _this.chainsArr[0].value + '主链'
        }
      }).catch(err=>{
        Toast({
          message:err,
        })
      })
    },
    logoutCancel(){
      this.islogoutBoxShow =false
    },
    logoutConfirm(){
      let _this =this
      _this.PopupAPI.lockWallet().then(res=>{
        console.log('退出成功')
        _this.islogoutBoxShow =false
        sessionStorage.removeItem('tabIndex')
        _this.selCoinObj.balance = '-'
        _this.selCoinObj.legalValue = '-'
        localStorage.setItem('selCoin',JSON.stringify(_this.selCoinObj))
        localStorage.removeItem('initComeing')
        _this.$router.push('/open/fromMain')
      }).catch(err=>{
        Toast({
          message: err,
        });
      })
    },
  	gotoRemark(){
  		let _this = this
  		_this.$router.push({name:'backupMnemonic',params:{type:0}})
  	},
  	loadMore(){
  		let _this = this
  		_this.loading = true
  		_this.loadingTip = true
    	_this.timer = setTimeout(() => {
        	_this.initData();
    	}, 1000);
  	},
  	clickTab(item,index){
      let _this =this
  		_this.tabIndex = index
  		sessionStorage.setItem('tabIndex',_this.tabIndex)
  		if(index == 0){
        _this.tranRecord = []
        _this.page = 1
        _this.initData()
      }
  	},
  	getAssets(){
  		let _this = this,addApi = '';
      if(_this.selChainId == _this.CHAINID){
        addApi = ''
      }else{
        addApi = '/'+_this.selChainId
      }
      let assetsPromise = _this.$http.get(_this.BASE_URL+addApi+_this.$url.assets+'/'+_this.BCBID+'/0')
      .then(d =>{
        if(d.data.code == 0){
          let coinArr = d.data.result
          if(_this.initComeing){
            coinArr.forEach((item,index) =>{
              if(index == 0){
                item.switch = true
              }else{
                item.switch = false
              }
            })
            _this.initComeing = false
            localStorage.setItem('initComeing','false')
            // localStorage.setItem('initCoinArr',JSON.stringify(coinArr))
          }else{
            let newArr = []
            let length1 = coinArr.length;
            let length2 = _this.initCoinArr.length;
            for (let i = 0; i < length1; i++) {
              for (let j = 0; j < length2; j++) 
              {
                //判断添加的数组是否为空了
                if (coinArr.length > 0) {
                    if (coinArr[i]["symbol"] === _this.initCoinArr[j]["symbol"]) {
                        coinArr.splice(i, 1); //利用splice函数删除元素，从第i个位置，截取长度为1的元素
                        length1--; 
                        // console.log(jsonArr2[j]);//重复元素
                    }
                }
              }

            } 
            for (let n = 0; n < _this.initCoinArr.length; n++) {
                coinArr.push(_this.initCoinArr[n]);
            }
          }
          
          localStorage.setItem('initCoinArr',JSON.stringify(coinArr))
        }else{
          _this.getAssets()
        }
      }).catch(err =>{
        // _this.getAssets()
        Toast({
          message: error,
        });
      })
      return assetsPromise
  	},
  	getAddrBalance(){
      let _this = this,addApi = '';
      if(_this.selChainId == _this.CHAINID){
        addApi = ''
      }else{
        addApi = '/'+_this.selChainId
      }
      let getAddrBalancePromise = _this.$http.get(_this.BASE_URL+addApi+_this.$url.addrBalance+'/'+_this.BCBID+'/'+_this.myAddress+'/'+_this.selLegalCurrency+'?appid=100')
      .then(d =>{
        if(d.data.code == 0){
          let coinArr = []
          let result = d.data.result
          let initArr = localStorage.getItem('initCoinArr')
          _this.initCoinArr = initArr ? JSON.parse(initArr) : []
          let initCoinArr = _this.initCoinArr,len = initCoinArr.length
          if(len){
            _this.initCoinArr.forEach((item,index) =>{
              let param = {}
              param.symbol = item.symbol
              param.coinIcon = item.coinIcon
              param.balance = 0
              param.legalValue = 0
              if(result.length){
                result.forEach((sitem,sindex) =>{
                  if(item.symbol == sitem.symbol){
                    param.balance = Number(parseFloat(sitem.balance).toFixed(7).slice(0,-1))
                    param.legalValue = Number(parseFloat(sitem.legalValue).toFixed(7).slice(0,-1))
                  }
                })
              }
              coinArr.push(param)
            })
            for(let i = 0;i<coinArr.length;i++){
              if(coinArr[i].symbol.indexOf(_this.selCoinObj.symbol)>-1){
                _this.selCoinObj = coinArr[i]
                break;
              }
            }
            if(_this.selCoinObj.symbol ==''){
              _this.selCoinObj = coinArr[0]
            } 
            console.log(_this.selCoinObj.symbol,'合约地址传币种')
            // _this.getCoinContract(_this.selCoinObj.symbol)
            _this.addrTransaction()
            _this.sxShow = String(_this.selCoinObj.balance).length>9 ? true : false
            localStorage.setItem('selCoin',JSON.stringify(_this.selCoinObj))
          }
        }else{
          _this.getAddrBalance()
        }
      }).catch(error => {
        // _this.getAddrBalance()
        Toast({
          message: error,
        });
      })
      return getAddrBalancePromise
    },
    addrTransaction(){
    	let _this = this,addApi = '';
      for(let i = 0;i<_this.initCoinArr.length;i++){
        if(_this.initCoinArr[i].symbol == _this.selCoinObj.symbol){
          _this.contractAddr = _this.initCoinArr[i].conAddr
        }
      }
      if(_this.selChainId == _this.CHAINID){
        addApi = ''
      }else{
        addApi = '/'+_this.selChainId
      }

    	_this.$http.get(_this.BASE_URL+addApi+_this.$url.addrTransaction+'/'+_this.BCBID+'/'+_this.myAddress+'?conAddr='+_this.contractAddr+'&page='+_this.page+'&count='+_this.count)
      .then(d =>{
      	if(d.data.code == 0){
          if(_this.page == 1){
            _this.tranRecord = []
          }
      		_this.loadingTip = false
      		_this.loading = false
      		if(!d.data.result){
      			_this.loading = true
                _this.noLast = true
      			return
      		}
      		let result = d.data.result.records
      		if(!result.length){
              _this.loading = true
              _this.noLast = true
              if(!_this.tranRecord.length){_this.noLast = false}
              return
            }
            _this.tranRecord = _this.tranRecord.concat(result)
            _this.page++;
      	}else{
          _this.addrTransaction()
        }
      }).catch(error => {
        Toast({
          message: error,
        });
      })
    },
    initData(){
    	let _this = this
      if(_this.myAddress === ''){
        Toast({
          message: '当前没有钱包，请创建或导入钱包',
        });
        this.selCoinObj = {symbol:'',balance:'0',legalValue:'0'}
        return
      }
      if(_this.initComeing){
        _this.getAssets().then(suc =>{
          _this.getAddrBalance()
        })
      }else{
        _this.getAddrBalance()
      }
    	
    },
  	gotoMore(item,index){
  		this.$router.push({name:'walletDetail',params:{walletInfo:item}})
  	},
  	gotoImportWallet(){
  		this.$router.push('/importWallet/fromMain')
  	},
  	gotoCreateWallet(){
  		this.$router.push('/createWallet/fromMain')
  	},
  	gotoBcbscan(tx){
  		window.open(this.BCBSCAN+'tx/0x'+tx)
  	},
  	recordDetail(item,index){
  		this.popupVisible = true
  		this.recordDetailData = item
  	},
  	close(){
  		this.popupVisible = false
  	},
  	gotoDetail(){
  		this.$router.push('/assetsDetail')
      sessionStorage.setItem('selChainId',this.selChainId)
  	},
  	gotoTransfer(){
      if(this.myAddress === ''){
        Toast({
          message: '当前没有钱包，请创建或导入钱包',
        });
        return
      }
  		this.$router.push({name:'transfer',params:{chainId:this.selChainId}})
  	},
  	gotoReceipt(){
      if(this.myAddress === ''){
        Toast({
          message: '当前没有钱包，请创建或导入钱包',
        });
        return
      }
  		this.$router.push('/receipt')
  	},
  	selWallet(item,index){
  		this.selWalletIndex = index
  		this.myAddress = item.walletAddr
      this.walletName = item.walletName
      this.PopupAPI.selectAccount(item.walletAddr)
  	},
  	copy(addr){
  		this.$copyText(addr).then(() => {
        Toast({
          message: "复制成功",
          position: 'top',
          iconClass: 'mintui mintui-success'
        });
      });
  	},
  	toRightDetail(item,index){
  		item.active = !item.active
  		this.setArr.splice(index,1,item)
      index == 1?this.$router.push('/signAuth'):
      index == 2?this.$router.push('/nodeChoise'):
  		index == 4?this.$router.push('/changePsd'):
  		index == 5?this.islogoutBoxShow = true:''
  	},
  	setLan(item,index){
  		this.lanActive = index
  		//this.$i18n.locale = item.value
  	},
  	setLegalCurrency(item,index){
  		this.lanActive1 = index
  		this.selLegalCurrency = item.value
  		localStorage.setItem('selLegalCurrency',item.value)
  	}
  }

};
</script>
<style lang="stylus">
@import './../../assets/css/var.styl';

.color0170FF
	color:$color0170FF
.colorFF6F6F
	color:$colorFF6F6F
.width200
	width:200px	
.bg0170FF
	background:$color0170FF!important
.orange
	border: 1px solid #FF9512;
	color: #FF9512;
.blue
	border: 1px solid $color0195FF;
	color: $color0195FF;
.main-all
	width:100%;
	height:100%;
	padding-top: 25px;
	overflow-y:auto	
	.main-bg
		width:100%
		top:0
	.main-tab
	.main-center
		z-index:100
		&.main-tab
			padding-left:23px
			margin-bottom: 30px
			>div
				margin-right:32px
				>span
					line-height:22px
				.bold
					font-weight:bold
					font-size:16px
				>div
					width: 18px
					border-radius: 2px
					height: 3px
					bottom: -8px
					left: 6px
		&.mb23
			margin-bottom:23px
		&.main-center
			box-shadow: 0 0 6px 0 #E6EDF2
			border-radius: 4px
			width: 330px
			height: 221px
			padding:21px 35px 25px
			margin-bottom:26px
			h3
				margin-bottom: 14px;
			.line
				width: 100%;
				height: 1px;
				background: #F1F4F7;
				margin-bottom: 22px;
			.main-num
				margin-bottom:15px
				img
					right: 14px;
					top: 10px;
			.main-btn
				>div
					width:118px
					height:32px
					line-height:32px
					margin-top:24px
					font-size: 14px;
					&:first-child
						background: #D4E7FF;
						color: $color0170FF;
					&:last-child
						background: $color0170FF;
	.tran-record
		width:330px
		h3
			line-height:20px
			margin-bottom:5px
			font-weight:bold
		.tran-detail
			box-shadow: 0 0 6px 0 #E6EDF2
			border-radius: 6px
			height:68px
			padding:16px 10px 15px 13px
			margin-bottom:12px
			img
				width:33px
				height:33px
				margin-right:12px
		.tran-data-addr
			width: calc(100% - 45px);
			>div
				>p
					&:first-child
						line-height:20px
					&:last-child
						line-height:17px
	.no-record
		background:$colorf7f7f7
		height:68px
		line-height:68px
		border-radius: 4px;
		margin-bottom:10px
	.part-1
	.part-2	
		box-shadow: 0 0 4px 0 #F7F8FA;
		border-radius: 14px 14px 0 0;
		border-radius: 14px 14px 0px 0px;
		height:526px;
		padding-top:34px
		&.part-1
			.wallet
				width:330px
				height:330px
				overflow:auto
				.wallet-single
					background: #F5F6F8
					border-radius: 6px
					height:91px
					width:100%
					padding:20px 15px 21px 14px
					margin-bottom:22px
					&:last-child
						margin-bottom:0
					&.selWallet
						background: #EDF3FF;
						border: 1px solid $color0195FF;
					.wallet-name
						>span
							width:46px
							height:20px
							line-height:20px
							border-radius:10px
					.copy
						width:26px
						height:17px
					h3
						font-weight:bold
						line-height:20px
						margin-bottom:10px
						margin-right:6px
					p
						color:#AEB2C2;
						margin-right:20px
					.duigou
						bottom:-1px
						right:0
			.create-wallet
				margin-bottom:18px
				margin-top:11px
			.import-wallet
				border:1px solid $color0195FF
				background:#fff
				color:$color0195FF
			.threeBlueBtn
				img
					width:18px
					height:18px
					margin-right:10px
		&.part-2
			padding-top:10px
			>div
				width:314px
				>div
					width:100%
					
					.set-word
						line-height:20px
						padding:24px 0 13px	
						border-bottom: 1px solid #F2F2F2;
						.set-right
							>div
								span
									margin-left:14px
							img
								width:22px
								height:22px
							.to-right
								transform: rotate(45deg);
								border-top:1px solid $fontColor444;
								border-right:1px solid $fontColor444;
								width: 8px
								height:8px
								transition:all 0.3s
								margin-left:10px
							.to-right-active
								transform: rotate(135deg);
					.lan-all
						>div
							height:53px
							background:$mainBodyBgcolorGray
							&:last-child
								border-radius: 0 0 6px 6px;
							&.lan-active
								background: #D8D8D8;
						.coin-single
							padding-left:10px
						img
							width:22px
							height:22px
							margin-right:14px
							margin-left:9px
.pop-modal
	background:rgba(0,0,0,0.5)
	width: 357px;
	height: 596px;
	z-index:2002
	left:0
	right:0
	bottom:0
	top:0
	.popBox
		width: 290px
		height: 450px
		left:0
		right:0
		bottom:0
		top:0
		margin: 77px auto 0
		border-radius: 11px
		padding:0 19px
		.close
			right:17px
			top:13px
		.popTitle
			line-height:20px
			margin:18px 0 18px
		.popBody
			margin-bottom:9px
			overflow: hidden;
			>div
				display:flex
				margin-bottom:16px
				>span
					line-height: 17px;
					&:first-child
						font-weight:bold
						margin-right:16px		
					&:last-child
						color:$color999
						word-break: break-all;
		.btn-go
			width:246px;
			height:36px;
			line-height:36px;
			background:$color0195FF
			border-radius: 8px;
			bottom: 15px;
			img
				width:14px
				height:14px
				margin-left:16px
.pop-head
	color: #545A6D;
	text-align: left;
	width: 306px;
	margin: 15px auto 8px;	
.p-body-1
	color: #7C8297;
	line-height: 20px;
.p-body-btn
	margin:11px auto 21px
	>div
		border-radius: 4px;
		width:136px
		height:34px
		line-height:34px
		text-align:center
		&:first-child
			background: #A7B0CD;
		&:last-child
			background: #0170FF;
.logoutBox{
  width:240px;
  height:160px;
  left:0
  right:0
  bottom:0
  top:0
  border-radius: 11px
  margin:200px auto 0
  >div{
    &:first-child{
      margin-top:50px
    }
  }
  .c-button{
    margin:30px auto 0;
    >div{
      border-radius: 4px;
      width:82px;
      height:36px;
      line-height:36px;
      text-align:center;
      cursor:pointer;
      &:first-child{
        background:#fff;
        border:1px solid #0195FF;
        color: #0195FF;
        margin-right:20px
      } 
      &:last-child{
        background: #0195FF;
        color:#fff
      } 
    }  
  }  
}
.net-work{
  z-index:102
  padding-right:13px;
  top:-6px;
  >div{
    &:first-child{
      background: 0170FF;
      border: 1px solid rgba(251,253,255,0.54);
      border-radius: 17px;
      width: 104px;
      height: 30px; 
      font-weight:bold;
      color: #FFFFFF;
      >span{
        &:last-child{
          border: 1px solid #fff;
          width: 9px;
          height: 9px;
          border-left: none;
          border-top: none;
          transform: rotate(45deg);
          margin-bottom: 5px;
          margin-left: 6px;
        }
      }
    }
    &.pop-net{
      position: absolute;
      right: 13px;
      width: 180px;
      background: #FFFFFF;
      box-shadow: 0 0 4px 0 #B5C5D6;
      border-radius: 12px;
      top:38px;
      overflow: hidden;
      >h2{
        height: 34px;
        line-height: 34px;
        text-align: center;
        font-weight: bold;
        border-bottom: 1px solid #D8D8D8;
      }
      >p{
        font-size: 12px;
        color: #8D8E8F;
        line-height: 17px;
        margin: 3px 0 10px 12px;
      }
    }
  }
  
}   
</style>
<style>
  .sx_ft{
    font-size: 0.5em
  }
  
</style>
