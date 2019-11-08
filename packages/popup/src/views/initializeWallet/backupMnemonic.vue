<template>
  	<div class="backupMnemonic bgfff pos-r">
  		<div class="back pos-a flex flex-ai-c cur-p" @click="back" v-if="fromWalletDetailShow">
			<img src="../../assets/images/open/back.png">
			<span class="color999">返回</span>
		</div>
  		<div class="pos-a jump-over flex flex-ai-c cur-p" @click="jumpToMain" v-if="!fromWalletDetailShow">
  			<span class="color444 fs12">跳过</span>
  			<img src="../../assets/images/open/tiaoguo.png">
  		</div>
  		<div class="backupMnemonic-cont m-auto">
  			<h2 class="fs24 color000">备份助记词</h2>
  			<div class="fs14 txt-1 color444">已为您创建钱包，获得助记词即获得了钱包资产的掌控权，请在纸质文本上正确抄写并妥善保管</div>
  			<div class="flex flex-w-w wordAll">
  				<span v-for="(item,index) in ciArr" :key="index" class="tac color444">{{item}}</span>
  			</div>
  		</div>
  		<div class="threeBlueBtn colorfff tac cur-p m-auto fs16" @click="gotoNext">下一步</div>
  	</div>
</template>

<script>
export default {
  name: "backupMnemonic",
  data(){
  	return {
  		ciArr:[],
  		fromWalletDetailShow:false
  	}
  },
  created(){
  	let _this = this
    _this.PopupAPI.exportMnemonic().then(res=>{
      console.log(res)
      _this.initMenic = res.mnemonic
      _this.ciArr = res.mnemonic.split(' ')
    }).catch(err=>{
      Toast({
        message:err,
      })
    })
  	_this.fromWalletDetailShow = _this.$route.params.type == 1 ? true : false
  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	jumpToMain(){
  		this.$router.push('/main')
  	},
  	gotoNext(){
  		this.$router.push({name:'backupMnemonicWrite',params:{type:this.$route.params.type,mnemonic:this.initMenic}})
  	}
  }
};
</script>
<style lang="stylus">
@import './../../assets/css/var.styl';
.backupMnemonic
	width:100%
	height:100%
	padding-top:90px
	.backupMnemonic-cont
		width:314px
		margin-bottom:59px
		h2
			margin-bottom:22px
			line-height:33px
		.txt-1
			line-height:20px
			margin-bottom:36px	
		.wordAll
			>span
				width:68px
				height:32px
				line-height:32px
				border-radius: 4px
				background: $colorf7f7f7
				border: 1px solid $colorEDEDED
				margin-right:14px
				margin-bottom:16px
				&:nth-child(4)
				&:nth-child(8)
				&:nth-child(12)
					margin-right:0
</style>
