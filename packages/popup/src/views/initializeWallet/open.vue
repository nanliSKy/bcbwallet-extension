<template>
  <div class="open">
    <div class="new-open pos-r" v-if="!ifHasLogin">
    	<img src="../../assets/images/open/open_icon.png" class="db m-auto" >
    	<h2 class="fs22 m-auto tac bold">BCB Wallet</h2>
    	<div class="open-next m-auto flex flex-ai-c flex-jc-c pos-a cur-p" @click="goToNewWallet">
    		<span class="fs18 colorfff">开启</span>
    		<img src="../../assets/images/open/open_next.png">
    	</div>
    </div>
    <div class="go-login bgfff" v-if="ifHasLogin">
    	<img src="../../assets/images/open/open_icon.png" class="db m-auto hasLogin_img">
    	<h2 class="color444 fs20 m-auto tac color000">BCB Wallet</h2>
    	<div class="input-psd flex flex-ai-c m-auto">
    		<input type="password" name="" placeholder="输入密码" v-model="psd" @keyup.enter="goToLogin">
    	</div>
    	<div class="login m-auto colorfff tac cur-p threeBlueBtn" @click="goToLogin">登录</div>
    	<div class="flex flex-jc-b color999 btn-all m-auto">
    		<span class="cur-p" @click="selActive = true">新建钱包</span>
    		<span class="cur-p" @click="importActive = true">导入钱包</span>
    	</div>
    </div>
    <mt-popup
	  v-model="selActive"
	  position="bottom" style="height: initial;">
	    <div>
	    	<div class="pop-head bold tac fs16 color000">新建钱包将会覆盖原有钱包！请确认是否已备份原有钱包助记词，否则导致资产损失将不可找回！</div>
	    	<div class="pop-body m-auto">
				<div class="p-body-1 flex flex-ai-c" @click="agree">
					<span class="no-agree" v-if="!isActive"></span>
					<span class="active flex" v-if="isActive">
						<span></span>
					</span>
					<span>已知悉新建钱包风险并同意新建钱包</span>
				</div>
				<div class="tac cur-p fs16 btn-create" :class="{'know-active':isActive}" @click="gotoCreate">新建</div>
				<div class="re-think flex flex-ai-c flex-jc-c cur-p">
					<span></span>
					<span @click="reThink">我再想想</span>
					<span></span>
				</div>
	    	</div>
	    </div>
	</mt-popup>
	<mt-popup
	  v-model="importActive"
	  position="bottom" style="height: initial;">
	    <div>
	    	<div class="pop-head bold tac fs16 color000">导入钱包将会覆盖原有钱包！请确认是否已备份原有钱包助记词，否则导致资产损失将不可找回！</div>
	    	<div class="pop-body m-auto">
				<div class="p-body-1 flex flex-ai-c" @click="agree">
					<span class="no-agree" v-if="!isActive"></span>
					<span class="active flex" v-if="isActive">
						<span></span>
					</span>
					<span>已知悉新建钱包风险并同意新建钱包</span>
				</div>
				<div class="tac cur-p fs16 btn-create" :class="{'know-active':isActive}" @click="gotoImport">导入</div>
				<div class="re-think flex flex-ai-c flex-jc-c cur-p">
					<span></span>
					<span @click="reThink">我再想想</span>
					<span></span>
				</div>
	    	</div>
	    </div>
	</mt-popup>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
export default {
  name: "open",
  // components: {
  //   'mt-checklist':Checklist
  // },
  data(){
  	return {
  		ifHasLogin:false,
  		checkValue:[],
  		options:[0],
  		selActive:false,
  		importActive:false,
  		isActive:false,
  		psd:'',
  	}
  },
  created(){
  	let _this = this
  	let state = _this.$store.state.appState
  	if(state == 0){
  		_this.PopupAPI.requestState().then(res=>{
  			if(res==1){
		        _this.ifHasLogin = true
		  	}
		  	if(res>1){
		        _this.$router.push('/main')
		  	}
  		})
  	}else{
	  	if(state==1){
	        _this.ifHasLogin = true
	  	}
	  	if(state>1){
	        _this.$router.push('/main')
	  	}
  	}
  	
  },
  methods:{
  	goToNewWallet(){
  		this.$router.push('/terms')
  	},
  	goToLogin(){
  		let _this = this
  		if(!_this.psd){
  			Toast({
	          message: "请输入密码",
	        });
	        return
  		}
  		_this.PopupAPI.unlockWallet(this.psd).then(res=>{
  			this.$router.push('/main')
  		}).catch(err=>{
  			Toast({
	          message: err,
	        });
  		})
  	},
  	gotoCreate(){
  		if(!this.isActive){
  			Toast({
	          message: "请勾选风险选项",
	          position: 'top'
	        });
  			return
  		}
  		this.$router.push('/createWallet/fromOpen')
  	},
  	gotoImport(){
  		if(!this.isActive){
  			Toast({
	          message: "请勾选风险选项",
	          position: 'top'
	        });
  			return
  		}
		this.$router.push('/importWallet/fromTerms')
  	},
  	agree(){
  		this.isActive = !this.isActive
  	},
  	reThink(){
  		this.selActive = false
  		this.importActive = false
  	}
  }
};
</script>
<style lang="stylus">
@import './../../assets/css/var.styl';
.open
	width:100%
	height:100%
	.new-open,.go-login
		width:100%
		height:100%
		>img
			padding-top:108px
			&.hasLogin_img
				padding-top:57px	
		.open-next
			background:$color0195FF
			box-shadow:0 4px 6px 0 $colorC8D4DA
			border-radius:30px
			width:230px
			height:60px
			left:0
			right:0
			bottom:50px
			>span
				margin-right:18px
		&.new-open
			background:url(../../assets/images/open/open_bg.png) no-repeat
			background-size:cover		
		&.go-login
			.input-psd
				margin-top:77px
			.login
				margin-top:80px;
			.btn-all
				width:300px
				margin-top: 77px;
	.pop-head
		width:290px
		margin: 30px auto 25px;
		line-height:22px
	.pop-body
		.p-body-1
			margin-bottom: 31px;
			.no-agree
				border: 1px solid #8D8E8F;
				border-radius: 4px;
				width: 18px;
				height: 18px;
				margin-right: 12px;
				margin-left: 3px;
			.active
				background: #656C7D;
				border-radius: 4px;
				width: 18px;
				height: 18px;
				margin-right: 12px;
				margin-left: 3px;
				span
					width: 11px;
					height: 7px;
					border: 2px solid #fff;
					border-top: none;
					border-right: none;
					transform: rotate(-45deg);
					margin-left: 3px;
					margin-top: 3px;	
						
		.btn-create
			border: 1px solid #999999;
			border-radius: 11px;
			color: #8D8E8F;
			width:300px;
			height:48px;
			line-height:48px
			margin-bottom:32px
			&.know-active
				border: 1px solid #0195FF;
				color: #0195FF;	
		.re-think
			margin-bottom:34px
			>span
				&:first-child
				&:last-child
					width: 106px;
					height: 1px;
					background: #ccc;
				&:nth-child(2)
					margin:0 15px
		    
			
</style>
