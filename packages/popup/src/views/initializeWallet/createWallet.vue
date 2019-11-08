<template>
  <div class="createWallet bgfff pos-r">
    <!-- <div class="lan-set pos-a flex flex-ai-c" v-if="type=='fromTerms'">
    	<img src="../../assets/images/open/lan_cn.png" v-if="$i18n.locale=='zh-CN'">
    	<img src="../../assets/images/open/lan_en.png" v-if="$i18n.locale=='en-US'">
    	<div class="flex flex-ai-c cur-p">
    		<span class="fs12 color000">中文</span>
    		<span></span>
    	</div>
    </div> -->
    <div class="back pos-a flex flex-ai-c cur-p" @click="back" v-if="type=='fromMain' || (type!=='fromMain'&&ifHasLogin == true)">
		<img src="../../assets/images/open/back.png">
		<span class="color999">返回</span>
	</div>
    <div class="createWallet-cont m-auto">
    	<h2 class="fs24 color000">创建钱包</h2>
    	<div class="input-psd flex flex-ai-c m-auto">
    		<input type="text" name="" placeholder="输入钱包名称" v-model="formAll.walletName" @keyup.enter="enterNameEv">
    	</div>
    	<div class="pos-r" v-if="type!=='fromMain'">
    		<div class="input-psd flex flex-ai-c m-auto">
	    		<input type="password" name="" placeholder="输入密码" v-model="formAll.psd"  @keyup.enter="agree">
	    	</div>
	    	<div class="pos-a flex flex-ai-c fs12 rightTip">
	    		<img src="../../assets/images/open/right.png">
	    		<span>长度8位以上，大写字母、小写字母、数字至少两项</span>
	    	</div>
    	</div>
    	<div class="pos-r" v-if="type!=='fromMain'">
    		<div class="input-psd flex flex-ai-c m-auto">
	    		<input type="password" name="" placeholder="重复密码"  v-model="formAll.rePsd" @focus="psdFocus" @keyup.enter="agree">
	    	</div>
	    	<div class="pos-a flex flex-ai-c wrongTip fs12" v-show="isError">
	    		<img src="../../assets/images/open/wrong.png">
	    		<span>两次密码输入不一致</span>
	    	</div>
    	</div>
    	
    </div>
    <div class="createWallet-foot m-auto">
    	<div class="threeBlueBtn colorfff tac cur-p fs16" @click="create" v-if="type=='fromMain'">创建</div>
    	<div class="threeBlueBtn colorfff tac cur-p fs16 flex flex-ai-c flex-jc-c" @click="agree" v-if="type!=='fromMain'">
        <mt-spinner type="snake" v-if="isPaying" style="margin-right:10px"></mt-spinner>
        <span v-if="isPaying">创建中</span>
        <span  v-if="!isPaying">我同意</span>
      </div>
    	<div class="flex flex-jc-b flex-ai-c import-wallet" @click="importWallet" v-if="type!=='fromMain'">
    		<span></span>
    		<span class="fs14 cur-p">导入钱包</span>
    		<span></span>
    	</div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast,Spinner } from "mint-ui";
Vue.component(Spinner.name, Spinner);
export default {
  name: "createWallet",
  data(){
  	return {
  		chainId:process.env.VUE_APP_CHAINID,
      // chainId:'bcbtest',
  		isError:false,
  		type:'',
  		formAll:{
  			walletName:'',
  			psd:'',
  			rePsd:''
  		},
      walletIndex:0,
      wallet_local:{
        "encMnemonicWords":"",
        "nextIndex":0,
        "walletInfo":[],
        'path':''
      },
      WALLET_HAS_CREATED:false,
      ifHasLogin:false,
      walletArr: [],
      isPaying:false
      // WALLET_PATH_INDEX:0
  	}
  },
  created(){
    let _this = this
    _this.type = this.$route.params.type
    let state = _this.$store.state.appState
    if(state == 0){
      _this.PopupAPI.requestState().then(res=>{
        if(res>0){
          _this.ifHasLogin = true
        }
      })
    }else{
      if(state>0){
        _this.ifHasLogin = true
      }
    }
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
  methods:{
  	back(){
  		this.$router.back();
  	},
  	psdFocus(){
  		this.isError = false
  	},
  	checkInput(){
  		let _this = this
  		if(!_this.formAll.walletName){
  			Toast({
  				message:'请输入钱包名称',
  			})
  			return false
  		}
  		if(_this.formAll.psd.length<8){
  			Toast({
  				message:'密码长度8位以上',
  			})
  			return false
  		}
      let arr = [new RegExp('[0-9]'),new RegExp('[a-z]'), new RegExp('[A-Z]')];
      let result = arr.reduce((total, _v) => {
        if(_v.test(_this.formAll.psd)) {
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
  		if(_this.formAll.psd !== _this.formAll.rePsd){
  			Toast({
  				message:'两次密码输入不一致',
  			})
  			_this.isError = true
  			return false
  		}
  		return true
  	},
    enterNameEv(){
      this.type=='fromMain' ? this.create():this.agree()
    },
  	agree(){
  		let _this = this
  		if(!_this.checkInput()){
  			return
  		}
      if(_this.isPaying == true){
        Toast({
              message:'正在创建钱包中，请稍等',
            })
        return
      }
      _this.isPaying = true
      _this.PopupAPI.setPassword(_this.formAll.psd).then(res=>{
        _this.PopupAPI.setNetwork(_this.chainId).then(res=>{
          _this.PopupAPI.addAccount(_this.formAll.walletName).then(res=>{
            _this.isPaying = false
            localStorage.setItem('HAS_REMARK_MNEM','false')
            _this.$router.push({name:'backupMnemonic',params:{type:0}})
          })
          .catch(err=>{
            Toast({
              message:err,
            })
            _this.isPaying = false
          })
        })
        .catch(err=>{
          Toast({
            message:err,
          })
          _this.isPaying = false
        })
      })
      .catch(err=>{
        Toast({
          message:err,
        })
        _this.isPaying = false
      })
      
  	},
  	create(){
      let _this = this
      if(!_this.formAll.walletName){
        Toast({
          message:'请输入钱包名称',
        })
        return false
      }
      for(let i = 0;i<_this.walletArr.length;i++){
        if(_this.walletArr[i].walletName == _this.formAll.walletName){
          Toast({
              message:'该钱包名称已存在，请重新输入',
            })
          return
        }
      }
      _this.PopupAPI.addAccount(_this.formAll.walletName).then(res=>{
        Toast({
          message: "创建成功",
          position: 'top',
          iconClass: 'mintui mintui-success'
        });
        _this.formAll.walletName = ''
        setTimeout(function(){
          _this.$router.push('/main')
        },1000)
      })
      
  	},
  	importWallet(){
  		this.$router.push('/importWallet/fromTerms')
  	}
  }
};
</script>
<style lang="stylus">
@import './../../assets/css/var.styl';
.createWallet
	width:100%
	height:100%
	padding-top:90px
	.createWallet-cont
		width:300px
		h2
			line-height:33px
			margin-bottom:35px
		>div
			margin-bottom:28px
	.createWallet-foot
		width:300px
		overflow:hidden
		.threeBlueBtn
			margin-bottom: 38px;
			margin-top: 59px;
		.import-wallet
			>span
				&:first-child
				&:last-child
					width: 106px;
					height: 1px;
					background: #F1F6F8;
				&:nth-child(2)
					line-height: 20px;
					color:$color0195FF			
</style>
