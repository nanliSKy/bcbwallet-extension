<template>
  <div class="importWallet pos-r">
  	<div class="back pos-a flex flex-ai-c cur-p" @click="back">
		<img src="../../assets/images/open/back.png">
		<span class="color999">返回</span>
	</div>
	<div class="iw-tab flex flex-ai-c flex-jc-b bgfff m-auto">
		<span v-for="(item,index) in tabArr" :key="index" class="tac cur-p" :class="{active:tabActiveNm == item}" @click="tabActive(item,index)">{{item}}</span>
	</div>
	<div class="bgfff iw-body">
		<textarea :placeholder="placeholderCont" class="width314 m-auto db" v-model="form.contInput" spellcheck="false"></textarea>
		<div class="input-psd flex flex-ai-c m-auto width314" v-if="tabActiveNm == 'Keystore'">
    		<input type="password" name="" placeholder="输入keystore密码" v-model="form.psd">
    	</div>
    	<div class="input-psd flex flex-ai-c width314 m-auto">
	    		<input type="text" name="" :placeholder="placeholderWalletName" v-model="form.walletName">
	    	</div>
    	<div class="pos-r m-auto width314" v-if="tabActiveNm == '助记词'">
    		<div class="input-psd flex flex-ai-c width314">
	    		<input type="password" name="" placeholder="输入新密码" v-model="form.newPsd">
	    	</div>
    		<div class="pos-a flex flex-ai-c fs12 rightTip">
	    		<img src="../../assets/images/open/right.png">
	    		<span>长度8位以上，大写字母、小写字母、数字至少两项</span>
	    	</div>
    	</div>
    		
    	<div class="pos-r m-auto width314" v-if="tabActiveNm == '助记词'">
    		<div class="input-psd flex flex-ai-c width314">
	    		<input type="password" name="" placeholder="确认新密码" v-model="form.rePsd">
	    	</div>
	    	<div class="pos-a flex flex-ai-c wrongTip fs12" v-show="isError">
	    		<img src="../../assets/images/open/wrong.png">
	    		<span>两次密码输入不一致</span>
	    	</div>
    	</div>
    	
    	<div class="threeBlueBtn colorfff tac cur-p fs16 m-auto flex flex-ai-c flex-jc-c" @click="sure">
    		<mt-spinner type="snake" v-if="isPaying" style="margin-right:10px"></mt-spinner>
    		<span v-if="isPaying">导入中</span>
        	<span  v-if="!isPaying">同意</span>
    	</div>
	</div>
	
  </div>
</template>

<script>

import Vue from 'vue'
import { Toast,Spinner } from "mint-ui";
Vue.component(Spinner.name, Spinner);
export default {
  name: "home",
  data(){
  	return {
  		chainId:process.env.VUE_APP_CHAINID,
  		tabArr:[],//第一阶段暂时不要助记词和keystore先注释
  		tabActiveNm:'',
  		form:{
  			contInput:'',
  			walletName:'',
  			psd:'',
  			newPsd:'',
  			rePsd:''
  		},
  		type:'',
  		isError:false,
  		walletArr: [],
  		importError:false,
  		isPaying:false
  	}
  },
  created(){
  	let _this = this
  	_this.type = _this.$route.params.type
  	if (_this.type == 'fromMain') {
  		_this.tabArr = ['私钥','Keystore']
  	}else{
  		_this.tabArr = ['助记词']
  	}
  	_this.tabActiveNm = this.tabArr[0]
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
    })
  },
  computed:{
  	placeholderCont(){
  		return '输入'+this.tabActiveNm+'文本内容'
  	},
  	placeholderWalletName(){
  		return '输入'+this.tabActiveNm+'新钱包名称'
  	}
  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	tabActive(item,index){
  		this.tabActiveNm = item
  	},
  	sure(){
  		let _this = this
  		if(_this.isPaying == true){
	        Toast({
	              message:'正在导入钱包中，请稍等',
	            })
	        return
	      }
  		
		if(_this.tabActiveNm == '助记词'){
			if(!_this.form.contInput){
				Toast({
	  				message:'请输入助记词文本内容',
	  			})
	  			return
			}
			if(!_this.form.walletName){
				Toast({
	  				message:'请输入新钱包名称',
	  			})
	  			return
			}
			if(!_this.form.newPsd){
				Toast({
	  				message:'请输入新密码',
	  			})
	  			return
			}
			if(!_this.form.rePsd){
				Toast({
	  				message:'请输入确认新密码',
	  			})
	  			return
			}
			if(_this.form.newPsd.length<8){
	  			Toast({
	  				message:'密码长度8位以上',
	  			})
	  			return
	  		}
	  		let arr = [new RegExp('[0-9]'),new RegExp('[a-z]'), new RegExp('[A-Z]')];
		    let result = arr.reduce((total, _v) => {
		        if(_v.test(_this.form.newPsd)) {
		          total += 1;
		        }
		        return total;
		      }, 0);
		    if(result < 2) {
		        Toast({
		            message: "需包含大写字母、小写字母、数字中至少两项！"
		        });
		        return false
		    }
	  		if(_this.form.newPsd !== _this.form.rePsd){
	  			Toast({
	  				message:'两次密码输入不一致',
	  			})
	  			_this.isError = true
	  			return
	  		}
	  		_this.isPaying = true
	  		console.log(_this.form.contInput)
	  		if(!_this.importError){
	  			_this.PopupAPI.setPassword(_this.form.newPsd).then(res=>{
		  			_this.PopupAPI.setNetwork(_this.chainId).then(res=>{
			  			_this.PopupAPI.importMnemonic(_this.form.contInput.trim(), _this.form.walletName).then(res=>{
				  			localStorage.setItem('HAS_REMARK_MNEM','true')
				  			_this.$router.push('/main')
				  			_this.isPaying = false
				  		}).catch(err=>{
				  			_this.importError = true
				  			_this.isPaying = false
				  			Toast({
				  				message:'输入助记词不正确',
				  			})
				  		})
				  	})
				    .catch(err=>{
				    	_this.isPaying = false
				        Toast({
				          message:err,
				        })
				    })	
		  		}).catch(err=>{
		  			_this.isPaying = false
			        Toast({
			          message:err,
			        })
			    })	
	  		}else{
	  			_this.PopupAPI.importMnemonic(_this.form.contInput.trim(), _this.form.walletName).then(res=>{
	  					_this.isPaying = false
			  			localStorage.setItem('HAS_REMARK_MNEM','true')
			  			_this.$router.push('/main')
			  		}).catch(err=>{
			  			_this.importError = true
			  			_this.isPaying = false
			  			Toast({
			  				message:'输入助记词不正确',
			  			})
			  		})
	  		}
	  		
	  		
  		}else if(_this.tabActiveNm == '私钥'){
			if(!_this.form.contInput){
				Toast({
	  				message:'请输入私钥文本内容',
	  			})
	  			return
			}
			if(!_this.form.walletName){
				Toast({
	  				message:'请输入新钱包名称',
	  			})
	  			return
			}
			for(let i = 0;i<_this.walletArr.length;i++){
	  			if(_this.walletArr[i].walletName == _this.form.walletName){
	  				Toast({
				        message:'该钱包名称已存在，请重新输入',
				      })
	  				return
	  			}
	  		}
	  		_this.isPaying = true
			_this.PopupAPI.importAccount(_this.form.contInput.trim(), _this.form.walletName).then(res=>{
				Toast({
			        message: "导入私钥成功",
			        position: 'top',
			        iconClass: 'mintui mintui-success'
			    });
			    setTimeout(function(){
			    	_this.isPaying = false
			    	_this.$router.push('/main')
			    },1000)
			}).catch(err=>{
				_this.isPaying = false
				Toast({
	  				message:'输入私钥不正确',
	  			})
			})
  		}else{
			if(!_this.form.contInput){
				Toast({
	  				message:'请输入keystore文本内容',
	  			})
	  			return
			}
			if(!_this.form.walletName){
				Toast({
	  				message:'请输入新钱包名称',
	  			})
	  			return
			}
			if(!_this.form.psd){
				Toast({
	  				message:'请输入keystore密码',
	  			})
	  			return
			}
			for(let i = 0;i<_this.walletArr.length;i++){
	  			if(_this.walletArr[i].walletName == _this.form.walletName){
	  				Toast({
				        message:'该钱包名称已存在，请重新输入',
				      })
	  				return
	  			}
	  		}
	  		_this.isPaying = true
			_this.PopupAPI.importJsonWallet(_this.form.contInput, _this.form.psd, _this.form.walletName).then(res=>{
				Toast({
			        message: "导入keystore成功",
			        position: 'top',
			        iconClass: 'mintui mintui-success'
			    });
			    setTimeout(function(){
			    	_this.isPaying = false
			    	_this.$router.push('/main')
			    },1000)
			}).catch(err=>{
				_this.isPaying = false
				Toast({
	  				message:'输入keystore内容或keystore密码不正确',
	  			})
			})
  		}
  	}
  }
};
</script>
<style lang="stylus">
.importWallet
	width:100%
	height:100%
	padding-top: 49px
	.iw-tab
		width: fit-content;
		height: 36px;
		border-radius: 11px;
		margin-bottom:20px
		padding:0 2px
		span
			width:90px
			height:32px
			line-height:32px
			&.active
				background: #006FFF;
				border-radius: 11px;
				color: #fff;
	.iw-body
		padding-top:24px
		height: 491px;
		textarea
			background: #f7f7f7;
			border: 1px solid #EDEDED;
			border-radius: 4px;
			height: 130px;
			padding-top: 15px;
			padding-left: 16px;
			margin-bottom:15px
		.input-psd
			margin-bottom:28px
		.threeBlueBtn
			margin-top:55px
</style>
