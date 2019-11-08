<template>
    <div class="transfer bgfff pos-r">
    	<div class="back pos-a flex flex-ai-c cur-p" @click="back">
  			<img src="../../../assets/images/open/back.png">
  			<span class="color999">返回</span>
  		</div>
  		<div class="transfer-cont m-auto">
  			<div>
  				<h2 class="color000">选择币种</h2>
  				<div class="input-psd flex flex-jc-b flex-ai-c pos-r cur-p" @click="selActive = !selActive" v-click-outside="onClickoutside">
  					<span>{{chooseCoin}}</span>
  					<img src="../../../assets/images/main/down_select.png" :class="{'select-active':selActive}">
  					<!--  -->
  				</div>
  				<div class="color1166ff">余额：<span class="bold">{{chooseValue}}</span></div>
  			</div>
  			<div>
  				<h2 class="color000">发送至</h2>
  				<div class="input-psd flex flex-ai-c m-auto pos-r" v-click-outside="onClickoutside1">
		    		<input type="text" name="" placeholder="请输入转出地址" v-model="form.addr" @focus="focusAddrAllEv" style="font-size:12px" spellcheck="false">
		    		<div class="pos-a focus-box" v-show="focusShow">
		    			<div v-for="(item,index) in toAddrArr" :key="index" @click="focusSingle(item)">
		    				{{ item }}
		    			</div>
		    		</div>
		    	</div>
  			</div>
  			<div>
  				<h2 class="color000" style="margin-top:18px">金额</h2>
  				<div class="input-psd flex flex-ai-c m-auto">
		    		<input type="text" name="" placeholder="请输入转出金额" v-model="form.value" style="flex:1">
		    		<span @click="allTransferEv" class="all-transfer">全部转出</span>
		    	</div>
		    	<div class="colorF9794D">网络矿工费：<span v-show="feeShow">{{ fee }} {{ feeCoinType }}</span></div>
  			</div>
  			<div>
  				<h2 class="color000">备注</h2>
  				<div class="input-psd flex flex-ai-c m-auto">
		    		<input type="text" name="" placeholder="选填" v-model="form.note">
		    	</div>
  			</div>
  			<div class="threeBlueBtn colorfff tac cur-p fs16 btn-transfer" style="width:320px" @click="transferEv">转账</div>
  		</div>
  		<mt-popup
		  v-model="selActive"
		  position="bottom" style="height: initial;">
		    <div>
		    	<div class="pop-head bold tac fs16">选择币种</div>
		    	<img src="../../../assets/images/main/close.png" class="close pos-a cur-p" @click="close">
		    	<div class="pop-body m-auto">
					<div v-for="(item,index) in coinArr" :class="{'choose-coin':chooseCoin == item.symbol}" @click="chooseCoinEv(item)" class="coinAll">
						<div class="flex flex-ai-c coinAll-e">
							<img :src="item.coinIcon" style="width:34px;height:34px">
			  				<!-- <img src="../../../assets/images/main/USDX.png" v-if="index == 1">
			  				<img src="../../../assets/images/main/DC.png" v-if="index == 2">
			  				<img src="../../../assets/images/main/XT.png" v-if="index == 3"> -->
							<div class="item-coin">{{item.symbol}}</div>
							<div class="flex flex-jc-b flex-ai-c c-right">
								<div>{{item.balance}}</div>
								<img src="../../../assets/images/main/coin_active.png" v-if="chooseCoin == item.symbol" class="selRight">
							</div>
							
							
						</div>
						<div class="line" v-if="index != coinArr-1"></div>
					</div>
		    	</div>
		    </div>
		</mt-popup>
  		<mt-popup
		  v-model="popupVisible"
		  position="bottom">
		    <div>
		    	<div class="pop-head bold tac fs16">使用BCB参与Dice游戏</div>
		    	<img src="../../../assets/images/main/close.png" class="close pos-a cur-p" @click="close">
		    	<div class="pop-body m-auto">
		    		<div class="line"></div>
		    		<div class="num bold tac">1.5BCB</div>
		    		<div class="cont tac color999 fs12">猜硬币正反，您选择的是：正面</div>
		    		<div class="threeBlueBtn colorfff tac cur-p fs16 bold">立即支付</div>
		    	</div>
		    </div>
		</mt-popup>
		<mt-popup
		  v-model="popupVisible1"
		  position="bottom" style="height:324px">
		    <div>
		    	<div class="pop-head bold tac fs16">转账确认</div>
		    	<img src="../../../assets/images/main/close.png" class="close pos-a cur-p" @click="close">
		    	<div class="pop-body m-auto">
		    		<div class="line"></div>
		    		<div class="pop-tran">
		    			<span>发送至</span>
		    			<span style="font-size:12px;width: 232px;" class="ell">{{form.addr}}</span>
		    		</div>
		    		<div class="line"></div>
		    		<div class="pop-tran">
		    			<span>金额</span>
		    			<span>{{form.value}} {{chooseCoin}}</span>
		    		</div>
		    		<div class="line" v-show="feeShow"></div>
		    		<div class="pop-tran" style="margin-bottom:20px">
		    			<span>手续费</span>
		    			<span v-show="feeShow">{{fee}} {{feeCoinType}}</span>
		    		</div>
		    		<div class="threeBlueBtn colorfff tac cur-p fs16 bold flex flex-ai-c flex-jc-c" @click="gotoPay">
		    			<mt-spinner type="snake" v-if="isPaying" style="margin-right:10px"></mt-spinner>
		    			<span v-if="isPaying">支付中</span>
		    			<span  v-if="!isPaying">立即支付</span>
		    		</div>
		    	</div>
		    </div>
		</mt-popup>
		<mt-popup v-model="popupVisible2" position="bottom">
		    <div>
		    	<div class="pop-head bold tac fs16">{{popupTitle}}</div>
		    	<img src="../../../assets/images/main/close.png" class="close pos-a cur-p" @click="close">
		    	<div class="pop-body m-auto">
		    		<div class="line"></div>
		    		<div class="input-psd flex flex-ai-c m-auto">
			    		<input type="password" name="" placeholder="输入密码">
			    	</div>
		    		<div class="threeBlueBtn colorfff tac cur-p fs16 bold">确定</div>
		    	</div>
		    </div>
		</mt-popup>
    </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Vue from 'vue'
import { Popup,Toast,Spinner } from 'mint-ui';
Vue.component(Popup.name, Popup);
Vue.component(Spinner.name, Spinner);
import { directive as clickOutside } from 'v-click-outside-x';
export default {
  name: "transfer",
  directives: { clickOutside },
  data(){
  	return {
  		BASE_URL:process.env.VUE_APP_LOCAL_BASE_URL,
  		BCBID:process.env.VUE_APP_BCBID,
  		CHAINID:process.env.VUE_APP_CHAINID,
  		selActive:false,
  		isPaying:false,//正在支付中
  		coinArr:[],
  		chooseCoin:'',
  		chooseValue:'',
  		popupVisible:false,
  		popupVisible1:false,
  		popupVisible2:false,
  		popupTitle:'输入密码',
  		initCoinArr:[],
  		clickNum:0,//立即支付按钮避免连续点击
  		myAddress:'',
  		form:{
  			value:'',
  			addr:'',
  			note:''
  		},
  		focusShow:false,
  		toAddrArr:[],
  		fee:0,//手续费
  		contractAddr:'',//合约地址
  		selChainId:'',
  		feeShow:true,
  		selCoinObj:{},
  		feeCoinType:''
  	}
  },
  created(){
  	// this.account = JSON.parse(localStorage.getItem('myAddress'))//当前账户
   //  this.myAddress = this.account.address
   // this.contractAddr = this.$route.params.contractAddr
   let _this = this
   	_this.selChainId = _this.$route.params.chainId
    _this.myAddress = _this.$store.state.account.address
    if(!_this.myAddress){
   		_this.PopupAPI.getSelectedAccount().then(res=>{
	        _this.myAddress = res.address
	    })
    }
  	_this.selLegalCurrency = localStorage.getItem('selLegalCurrency') || 'CNY'
  	let initArr = localStorage.getItem('initCoinArr')
    _this.initCoinArr = initArr ? JSON.parse(initArr) : []
  	
  	let selCoinObjAb = localStorage.getItem('selCoin')
    _this.selCoinObj = selCoinObjAb ? JSON.parse(selCoinObjAb) : {symbol:'',balance:'0',legalValue:'0'}
    _this.chooseCoin = _this.selCoinObj.symbol
    _this.chooseValue = _this.selCoinObj.balance
    _this.feeCoinType = _this.CHAINID == 'devtest' ? 'DEVT' :
    _this.CHAINID == 'bcb' ? 'BCB' :
    _this.CHAINID == 'bcbtest' ? 'BCBT' : ''
    _this.initData()
  },
  methods:{
  	allTransferEv(){
  		let _this = this
  		
  		if(_this.chooseCoin == _this.feeCoinType){
  			if(_this.chooseValue<_this.fee){
  				Toast({
		          message: "手续费不足",
		        });
		        return
  			}else{
  				_this.form.value = _this.chooseValue - _this.fee
  			}
  		}else{
  			_this.form.value = _this.chooseValue
  			for(let i = 0;i<_this.coinArr.length;i++){
	  			if(_this.coinArr[i].symbol == _this.feeCoinType){
	  				if(_this.coinArr[i].balance<_this.fee){
	  					Toast({
				          message: "手续费不足",
				        });
			  			return
	  				}
	  			}
	  		}
  		}
  		
  	},
  	getTokenAddress(chooseCoin){
  		let _this = this
  		_this.PopupAPI.getTokenAddress(chooseCoin).then(res=>{
                _this.contractAddr = res
                _this.getFee()
              }).catch(err=>{
                Toast({
                  message:err,
                })
              })
  	},
  	chooseCoinEv(item){
  		let _this = this
  		_this.chooseCoin = item.symbol;
  		_this.chooseValue = item.balance
  		_this.getTokenAddress(_this.chooseCoin)
  	},
  	getFee(){
  		let _this = this,addApi = '';
  		if(_this.selChainId == _this.CHAINID){
  			addApi = ''
  		}else{
  			addApi = '/'+_this.selChainId
  		}
  		_this.$http.get(_this.BASE_URL+addApi+_this.$url.getFee+'/'+_this.BCBID+'/'+_this.contractAddr+'/'+_this.myAddress+'?appid=100')
  		.then(res=>{
  			_this.feeShow = true
  			_this.fee = res.data.result.feeInfo.bcbFee
  		}).catch(err=>{
  			_this.feeShow = false
  		})
  	},
  	focusSingle(item){
  		this.form.addr = item
  		this.focusShow = false
  	},
  	transferEv(){
  		let _this = this
  		if(!_this.form.addr){
  			Toast({
	          message: "请输入转出地址",
	        });
  			return
  		}
  		if((!_this.form.value)){
  			Toast({
	          message: "请输入转出金额且转出金额",
	        });
  			return
  		}
  		if(_this.form.value == 0){
  			Toast({
	          message: "转出金额不能为0",
	        });
  			return
  		}
  		var patrn = /^\d+(\.\d+)?$/;
  		if(!patrn.test(_this.form.value)){
  			Toast({
	          message: "请输入正确的数字",
	        });
  			return
  		}
  		var reg = /^\d+(?=\.{0,1}\d+$|$)/;
  		if(!reg.test(_this.form.value)){
  			Toast({
	          message: "请输入正确的金额",
	        });
  			return
  		}
  		let tringNum = String(_this.form.value)
  		if(tringNum.indexOf('.')>-1){
  			if(tringNum.substring(tringNum.indexOf('.')+1).length>6){
  				Toast({
		          message: "金额最多6位小数",
		        });
	  			return
  			}
  		}
  		console.log(_this.chooseCoin,_this.feeCoinType)
  		if(_this.chooseCoin == _this.feeCoinType){
  			if(Number(_this.chooseValue)<Number(_this.fee)){
  				Toast({
		          message: "手续费不足",
		        });
		        return
  			}else{
  				if(Number(_this.chooseValue)<(Number(_this.fee)+Number(_this.form.value))){
  					Toast({
			          message: "输入金额加手续费不能大于币种余额",
			        });
			        return
  				}
  			}
  		}else{
  			for(let i = 0;i<_this.coinArr.length;i++){
	  			if(_this.coinArr[i].symbol == _this.feeCoinType){
	  				if(Number(_this.coinArr[i].balance)<Number(_this.fee)){
	  					Toast({
				          message: "手续费不足",
				        });
			  			return
	  				}
	  			}
	  			if(_this.coinArr[i].symbol == _this.chooseCoin&&Number(_this.chooseValue)<Number(_this.form.value)){
	  				Toast({
			          message: "输入金额不能大于币种余额",
			        });
		  			return
	  			}
	  		}
  		}
  		this.popupVisible1 = true
  	},
  	focusAddrAllEv(){
  		let _this = this
  		_this.focusShow = true
  		_this.PopupAPI.getRecentToAddress().then(res=>{
  			console.log(res,'转出地址集合')
  			_this.toAddrArr = res
  		})
  	},
  	onClickoutside1(){
  		this.focusShow = false
  	},
  	gotoPay(){
  		let _this = this
  		if(_this.isPaying == true){
  			Toast({
	          message: "正在支付中，请稍等",
	        });
  			return
  		}
  		_this.isPaying = true

  		console.log(_this.form.note)
  		_this.PopupAPI.transfer(
			_this.chooseCoin,
			_this.form.addr,
			_this.form.value,
			_this.form.note
		).then(result => {
			_this.popupVisible1 = false
			console.log(result);
			_this.getAddrBalance()
			Toast({
		        message: "转账成功",
		        position: 'top',
		        iconClass: 'mintui mintui-success'
		    });
		    _this.isPaying = false
		}).catch(err=>{
			Toast({
  				message:'转账失败!',
  			})
  			_this.isPaying = false
		})
  	},
  	close(){
  		this.popupVisible = false
  		this.popupVisible1 = false
  		this.popupVisible2 = false
  	},
  	back(){
  		this.$router.back();
  	},
  	onClickoutside(){
  		this.selActive = false
  	},
  	getAddrBalance(){
      let _this = this,addApi = '';
  		if(_this.selChainId == _this.CHAINID){
  			addApi = ''
  		}else{
  			addApi = '/'+_this.selChainId
  		}
  		_this.$http.get(_this.BASE_URL+addApi+_this.$url.addrBalance+'/'+_this.BCBID+'/'+_this.myAddress+'/'+_this.selLegalCurrency+'?appid=100')
      .then(d =>{
        if(d.data.code == 0){
          _this.coinArr = []
          let result = d.data.result
          let initCoinArr = _this.initCoinArr,len = initCoinArr.length
          if(len){
            _this.initCoinArr.forEach((item,index) =>{
            	// if(item.switch){
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
                _this.coinArr.push(param)
	            // }
            })
            _this.getTokenAddress(_this.chooseCoin)
          }
        }else{
        	_this.getAddrBalance()
        }
      }).catch(error => {
        _this.getAddrBalance()
        Toast({
          message: error,
        });
      })
    },
  	initData(){
      let _this = this
      _this.getAddrBalance()
    }
  }
};
</script>
<style lang="stylus">
.close
	right:19px
	top:25px
.pop-head
	line-height: 22px;
	margin-top: 22px;
	margin-bottom: 15px;
.pop-body
	width:300px
	.line
		width:100%
		height:1px
		background:#f1f4f7
	.num
		font-size: 20px;
		margin-top: 35px;
		line-height: 28px;
		margin-bottom: 28px;
	.cont
		margin-bottom:29px
	.input-psd
		margin-top:36px
		margin-bottom:55px
	.pop-tran
		height:52px
		line-height:52px
		display:flex
		>span
			&:first-child
				margin-right:26px
				width: 42px;
				text-align:right
	.coinAll
		&.choose-coin
			background: #E4EFFF
			
		.coinAll-e
			height:56px
			>img
				margin-right:19px
				margin-left:4px
			.item-coin
				width:80px;
				margin-right:10px
			.c-right
				width:calc(100% - 132px)
				.selRight
					margin-right:10px
				
.color1166ff
	color:#1166ff
	margin:8px 0 12px
	line-height:20px
.colorF9794D
	color:#ccc
	margin:8px 0 10px
	line-height:20px
.transfer
	width:100%
	height:100%
	.transfer-cont
		width:320px
		padding-top:100px
		h2
			line-height:20px
			margin-bottom:6px
		.input-psd
			width:320px
			padding:0 10px
			.pop-coin
				width: 100%;
				box-shadow: 0 0 3px #ccc;
				border-radius: 5px;
				top: 46px;
				left: 0;
				
				height:0
				overflow:hidden
				transition:all 0.3s
				&.heightAll
					height:160px
				>div
					height: 40px;
					line-height: 40px;
					border-bottom: 1px solid #F2F2F2;
					padding: 0 16px;
					&.choose-coin
						background:#F2F2F2
			img
				width:8px
				height:12px
				transform: rotate(90deg);
				transition:all 0.3s
			.select-active
				transform: rotate(270deg);
		.btn-transfer
			margin-top:24px
.focus-box
	background: #fff;
	left: 0;
	top: 46px;
	width: 320px;
	box-shadow: 0 0 5px #ccc;
	border-radius: 5px;
	max-height:120px;
	overflow-y:auto;	
	>div	
		font-size: 12px;
		height: 30px;
		line-height: 30px;
		padding-left:15px;
		cursor:pointer;
.all-transfer
	color:#1166ff;
	cursor:pointer;
</style>
<style>
	.mint-spinner-snake{
	    border-top-color: #fff!important;
	    border-left-color: #fff!important;
	    border-bottom-color: #fff!important;
	}
</style>