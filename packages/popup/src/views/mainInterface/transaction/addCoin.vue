<template>
  	<div class="assetsDetail pos-r">
  		<div class="back pos-a flex flex-ai-c cur-p" @click="back">
  			<img src="../../../assets/images/open/back.png">
  			<span class="color999">返回</span>
  		</div>
  		<div class="coinAll m-auto" style="max-height:500px;oveflow-y:auto">
  			<div v-for="(item,index) in coinArr" :key="index" class="coin-single flex flex-jc-b cur-p pos-r flex flex-ai-c" @click="selCoin(item,index)">
  				<div class="coin-left flex flex-ai-c">
  					<img :src="item.coinIcon" >
	  				<span class="bold">{{item.symbol}}</span>
  				</div>
  				<div class="tar coin-right">
  					<mt-switch v-model="item.switch" @change="switchChange(item,index)"></mt-switch>
  				</div>
  			</div>
  		</div>
  	</div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Vue from "vue";
import { Toast,Switch } from "mint-ui";
Vue.component(Switch.name, Switch);
export default {
  name: "assetsDetail",
  data(){
  	return {
      BASE_URL: process.env.VUE_APP_LOCAL_BASE_URL,
      BCBID:process.env.VUE_APP_BCBID,
      CHAINID:process.env.VUE_APP_CHAINID,
      selChainId:'',
  		coinArr:[],
  		selCoinIndex:'0',
      initComeing:false,
      initCoinArr:[]
  	}
  },
  created(){
    this.selChainId =  sessionStorage.getItem('selChainId')
    let initArr = localStorage.getItem('initCoinArr')
    this.initComeing = initArr ? true : false
    this.coinArr = initArr ? JSON.parse(initArr) : []
    // this.getAssets()
  },
  mounted(){
    
  },
  methods:{
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
        _this.getAssets()
        Toast({
          message: error,
        });
      })
      return assetsPromise
    },
    switchChange(item,index){
      // let num = 0
      // this.coinArr.forEach((item,index) =>{
      //   if(item.switch){num++}
      // })
      localStorage.setItem('initCoinArr',JSON.stringify(this.coinArr))
    },
  	back(){
  		this.$router.back();
  	},
  	selCoin(item,index){
  		this.selCoinIndex = index
  	},
  }

};
</script>
<style type="text/css" lang="stylus">
@import './../../../assets/css/var.styl';
.assetsDetail
	padding-top:51px
	.coinAll
		width:330px
		margin-bottom:30px
		.coin-single
			background: #FFFFFF;
			box-shadow: 0 0 6px 0 #E6EDF2;
			border-radius: 6px;
			height:68px
			margin-bottom:18px
			padding:0 13px
			.coin-left
				>img
					width:33px
					height:33px
					margin-right:12px
			.coin-right
				>div
					&:first-child
						line-height:20px
					&:last-child
						line-height:17px
			.duigou
				top:-1px
				right:0
</style>
