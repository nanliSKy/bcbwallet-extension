<template>
  <div class="signAuth pos-r bgfff">
  	<div class="back pos-a flex flex-ai-c cur-p" @click="back">
  		<img src="../../../assets/images/open/back.png">
  		<span class="color999">返回</span>
  	</div>
  	<div class="signAuth-cont m-auto">
      	<div class="c-signa">
          <h2>签名（允许BCB钱包代表您自动签名交易）</h2>
          <div>
            <div v-for="(item,index) in optionArr" :key="index" @click="signChoose(item)" class="cur-p">
              <p :class="{'active':selOption.status == item.status}">{{ item.label }}</p>
              <img src="../../../assets/images/main/dui.png" class="pos-a duigou" v-if="selOption.status == item.status">
            </div>
            <!-- <div class="flex flex-ai-c flex-jc-b" @click.stop="selectClick">
              <span>{{selOption.label}}</span>
              <span></span>
            </div>
            <div class="select-pop" :class="{'active':popShow}" v-click-outside="onClickoutside1">
              <span v-for="(item,index) in optionArr" :key="index" @click="signChoose(item)" class="cur-p">{{item.label}}</span>
            </div> -->
          </div>
        </div>
    </div>
    <!-- <div class="threeBlueBtn colorfff tac cur-p fs16 m-auto" @click="confirm">确定</div> -->
  </div>
</template>

<script>
import { Toast } from "mint-ui";
import { directive as clickOutside } from 'v-click-outside-x';
export default {
  name: "signAuth",
  directives: { clickOutside },
  data(){
  	return {
  		selOption:{
            label:'不自动签名',status:0
        },
        optionArr:[
            {label:'不自动签名',status:0},
            {label:'30分钟内自动签名',status:0.5},
            {label:'1小时内自动签名',status:1},
            {label:'一天内自动签名',status:24},
        ],
        popShow:false,
        initDuration:0
  	}
  },
  created(){
    let _this = this
  	this.PopupAPI.getSetting().then(res=>{
      console.log(res,'获取节点选择')
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

  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	onClickoutside1(){
        this.popShow = false
    },
    signChoose(item){
        this.selOption = item
        this.popShow = false
        this.PopupAPI.setSetting({
          autoConfirm: {
            fromTime: Date.now(),
            duration: this.selOption.status*60*60*1000 // 单位秒
          }
        }).then()
    },
    selectClick(){
        this.popShow = !this.popShow
    },
}
};
</script>
<style lang="stylus">
@import './../../../assets/css/var.styl';
.signAuth{
    width:100%
    height:100%
    padding-top:90px
    .signAuth-cont{
        width:314px;
        .c-signa{
          h2{
            font-size: 16px;
            color: #545A6D;
            font-weight:bold;
            line-height:22px;
            margin-bottom:11px;
          }
          >div{
            >div{
              background: #F7F8FA;
              border: 1px solid #0195FF;
              border-radius: 6px;
              width:314px;
              height:52px;
              position:relative;
              margin-bottom:6px;
              >p{
                line-height: 52px;
                padding-left: 25px;
                color: #7C8297;
                &.active{
                  color: #444444;
                  font-weight:bold
                }
              }
              .duigou{
                bottom:-1px
                right:0
              }
            }
          }
        }
    }
}     
</style>
