<template>
  	<div class="backupMnemonic bgfff pos-r">
  		<div class="back pos-a flex flex-ai-c cur-p" @click="back">
  			<img src="../../assets/images/open/back.png">
  			<span class="color999">返回</span>
  		</div>
  		<div class="pos-a jump-over flex flex-ai-c cur-p" @click="jumpToMain" v-if="!fromWalletDetailShow">
  			<span class="color444 fs12">跳过</span>
  			<img src="../../assets/images/open/tiaoguo.png">
  		</div>
  		<div class="backupMnemonic-cont m-auto">
  			<h2 class="fs24 color000">备份助记词</h2>
  			<div class="fs14 txt-1 color444">请将您抄下的12个单词按顺序依次点击选择</div>
  			<div class="pos-r">
  				<div class="selWord">
	  				<div class="flex flex-w-w">
	  					<span class="colorfff tac cur-p" v-for="(item,index) in selCiArr" :key="index" @click="deleteItem(item)">{{item}}</span>
	  				</div>
	  			</div>
	  			<div class="pos-a flex flex-ai-c wrongTip fs12" v-show="isError">
		    		<img src="../../assets/images/open/wrong.png">
		    		<span>助记词错误</span>
		    	</div>
  			</div>
  			
  			<div class="flex flex-w-w wordAll">
  				<span v-for="(item,index) in ciArr" :key="index" class="tac color444 cur-p" @click="selItem(item,index,$event)" :class="{wordActive:item.active}">{{item.name}}</span>
  			</div>
  		</div>
  		<div class="threeBlueBtn colorfff tac cur-p m-auto fs16" @click="gotoNext">下一步</div>
  	</div>
</template>

<script>
import { Toast } from "mint-ui";
export default {
  name: "backupMnemonicWrite",
  data(){
  	return {
  		ciArr:[],
  		selCiArr:[],
  		isError:false,
  		fromWalletDetailShow:false,
  		isTrue:false
  	}
  },
  created(){
  	let _this = this
    _this.fromWalletDetailShow = this.$route.params.type == 1 ? true : false
    _this.PopupAPI.exportMnemonic().then(res=>{
      let initMenic = res.mnemonic.split(' ')
      function randomsort(a, b) {
        return Math.random()>.5 ? -1 : 1;
        //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
      }
      let ciArr = initMenic.sort(randomsort);
      ciArr.forEach((item,index) =>{
        let params = {}
        params.name = item
        params.active = false
        this.ciArr.push(params)
      })
    })
  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	jumpToMain(){
  		this.$router.push('/main')
  	},
  	gotoNext(){
      if(!this.isTrue){
        Toast({
          message:'请选择正确助记词排序',
        })
        return
      }
  		localStorage.setItem('HAS_REMARK_MNEM','true')
  		this.$router.push('/main')
  	},
  	selItem(item,index,event){
  		if(event.target.classList.contains('wordActive')==true){
  			return
  		}
  		// if(this.selCiArr.indexOf(item.name)>-1){return}
  		this.selCiArr.push(item.name)
  		this.ciArr[index].active = true
  		if(this.selCiArr.length == 12){
  			function equar(a, b) {
			    // 判断数组的长度
			    if (a.length !== b.length) {
			        return false
			    } else {
			        // 循环遍历数组的值进行比较
			        for (let i = 0; i < a.length; i++) {
			            if (a[i] !== b[i]) {
			                return false
			            }
			        }
			        return true;
			    }
			  }
  			let initMenic = this.$route.params.mnemonic.split(' ')
			  let t = equar(initMenic, this.selCiArr);
  			if(!t){
  				this.isError = true
  				this.isTrue = false
  			}else{
  				this.isTrue = true
  			}
  			
  		}else{
  			this.isError = false
  			this.isTrue = false
  		}
  	},
  	deleteItem(item){
  		this.selCiArr.splice(this.selCiArr.indexOf(item),1)
      if(this.selCiArr.length != 12){
        this.isTrue = false
      }
  		this.ciArr.forEach((sitem,sindex) =>{
  			if(sitem.name == item){
  				sitem.active = false
  			}
  		})
  		this.isError = false
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
		margin-bottom:22px
		h2
			margin-bottom:22px
			line-height:33px
		.txt-1
			line-height:20px
			margin-bottom:15px
		.selWord
			background:$colorf7f7f7
			border: 1px solid #F87777
			border-radius: 4px
			height:122px
			overflow:auto
			margin-bottom:41px
			padding:8px	
			>div
				>span
					background: #67696B;
					border-radius: 4px;
					width:68px
					height:32px
					line-height:32px
					margin-right:5px
					margin-bottom:10px
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
			.wordActive
				background:$color0195FF
				color:$mainBodyBgcolorWhite
</style>
