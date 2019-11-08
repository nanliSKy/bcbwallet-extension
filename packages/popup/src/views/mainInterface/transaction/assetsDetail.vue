<template>
  	<div class="assetsDetail pos-r">
  		<div class="back pos-a flex flex-ai-c cur-p" @click="back">
  			<img src="../../../assets/images/open/back.png">
  			<span class="color999">返回</span>
  		</div>
  		<div class="coinAll m-auto" style="overflow-y: auto">
  			<div v-for="(item,index) in coinArr" :key="index" class="coin-single flex flex-jc-b cur-p pos-r flex flex-ai-c" :class="{'selWallet':selCoinObj.symbol == item.symbol}" @click="selCoin(item,index)">
  				<div class="coin-left flex flex-ai-c">
  					<!-- <img src="../../../assets/images/main/BCB.png" v-if="index == 0">
	  				<img src="../../../assets/images/main/USDX.png" v-if="index == 1">
	  				<img src="../../../assets/images/main/DC.png" v-if="index == 2"> -->
	  				<img :src="item.coinIcon">
	  				<span class="bold">{{item.symbol}}</span>
  				</div>
  				<div class="tar coin-right">
  					<div class="bold">{{item.balance}}</div>
  					<div class="color999 fs12">≈ {{selLegalCurrency == 'CNY' ? '￥' :'$'}} {{item.legalValue}}</div>
  				</div>
  				<img src="../../../assets/images/main/topDui.png" class="pos-a duigou" v-if="selCoinObj.symbol == item.symbol">
  			</div>
  		</div>
  		<div class="threeBlueBtn flex flex-ai-c flex-jc-c bold m-auto cur-p colorfff" @click="gotoAddCoin">添加</div>
  	</div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import { Toast } from "mint-ui";
export default {
  name: "assetsDetail",
  data(){
  	return {
      BCBID:process.env.VUE_APP_BCBID,
      CHAINID:process.env.VUE_APP_CHAINID,
      BASE_URL: process.env.VUE_APP_LOCAL_BASE_URL,
      myAddress:'',
  		coinArr:[],
  		selCoinObj:{symbol:'',balance:'0',legalValue:'0'},
      initCoinArr:[],
      initComeing:false,
      selLegalCurrency:'CNY',
      selChainId:''
  	}
  },
  created(){
    this.selChainId =  sessionStorage.getItem('selChainId')
    this.selLegalCurrency = localStorage.getItem('selLegalCurrency') || 'CNY'
    this.myAddress = this.$store.state.account.address
    let initArr = localStorage.getItem('initCoinArr')
    this.initComeing = initArr ? true : false
    this.initCoinArr = initArr ? JSON.parse(initArr) : []
    this.selCoinObj = localStorage.getItem('selCoin') ? JSON.parse(localStorage.getItem('selCoin')) : {symbol:'',balance:'0',legalValue:'0'}
    this.initData()
  },
  mounted(){
    
  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	selCoin(item,index){
  		this.selCoinObj = item
      localStorage.setItem('selCoin',JSON.stringify(item))
  	},
  	gotoAddCoin(){
  		this.$router.push('/addCoin')
  	},
    getAddrBalance(){
      let _this = this,addApi = '';
      if(_this.selChainId == _this.CHAINID){
        addApi = ''
      }else{
        addApi = '/'+_this.selChainId
      }
      
      let promise = _this.$http.get(_this.BASE_URL+addApi+_this.$url.addrBalance+'/'+_this.BCBID+'/'+_this.myAddress+'/'+_this.selLegalCurrency+'?appid=100')
      .then(d =>{
        if(d.data.code == 0){
          _this.coinArr = []
          let result = d.data.result
          let initCoinArr = _this.initCoinArr,len = initCoinArr.length
          if(len){
            _this.initCoinArr.forEach((item,index) =>{
              if(item.switch){
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
              } 
            })
          }
          if(!_this.initComeing){
            localStorage.setItem('selCoin',JSON.stringify(_this.coinArr[0]))
            _this.selCoinObj == _this.coinArr[0]
          }else{
            let selCoin = localStorage.getItem('selCoin')
            if(selCoin){
              let hasCoin = false
              for(let i = 0;i<_this.coinArr.length;i++){
                if(_this.coinArr[i].symbol.indexOf(_this.selCoinObj.symbol)>-1){
                  _this.selCoinObj = _this.coinArr[i]
                  hasCoin = false
                  break;
                }else{
                  hasCoin = true
                }
              }
              if(_this.selCoinObj.symbol ==''|| hasCoin){
                _this.selCoinObj = _this.coinArr[0]
              }
              localStorage.setItem('selCoin',JSON.stringify(_this.selCoinObj))
              
            }else{
              _this.selCoinIndex = '0'
            }
          }
        }else{
          _this.getAddrBalance()
        }
      }).catch(error => {
        _this.getAddrBalance()
        Toast({
          message: error
        });
      })
      return promise
    },
    initData(){
      this.getAddrBalance()
    }
  }

};
</script>
<style type="text/css" lang="stylus">
@import './../../../assets/css/var.styl';
.assetsDetail
	padding-top:51px
	.coinAll
		width:330px
		height:430px
		margin-bottom:30px
		.coin-single
			background: #FFFFFF;
			box-shadow: 0 0 6px 0 #E6EDF2;
			border-radius: 6px;
			height:68px
			margin-bottom:18px
			padding:0 13px
			&.selWallet
				border: 1px solid $color0195FF;
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
