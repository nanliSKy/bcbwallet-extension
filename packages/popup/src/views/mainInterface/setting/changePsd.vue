<template>
  <div class="changePsd pos-r">
  	<div class="back pos-a flex flex-ai-c cur-p" @click="back">
		<img src="../../../assets/images/open/back.png">
		<span class="color999">返回</span>
	</div>
	<div class="changePsd-cont m-auto">
    	<h2 class="fs24 color000">修改密码</h2>
    	<div class="input-psd flex flex-ai-c m-auto">
    		<input type="password" name="" placeholder="输入原密码" v-model="form.oldPsd">
    	</div>
    	<div class="pos-r">
    		<div class="input-psd flex flex-ai-c m-auto">
	    		<input type="password" name="" placeholder="输入新密码" @focus="psdFocus" v-model="form.newPsd">
	    	</div>
	    	<div class="pos-a flex flex-ai-c fs12 rightTip">
	    		<img src="../../../assets/images/open/right.png">
	    		<span>长度8位以上，大写字母、小写字母、数字至少两项</span>
	    	</div>
    	</div>
    	<div class="pos-r">
    		<div class="input-psd flex flex-ai-c m-auto">
	    		<input type="password" name="" placeholder="重复输入新密码" @focus="psdFocus" v-model="form.rePsd">
	    	</div>
	    	<div class="pos-a flex flex-ai-c wrongTip fs12" v-show="isError">
	    		<img src="../../../assets/images/open/wrong.png">
	    		<span>两次新密码输入不一致</span>
	    	</div>
    	</div>
    	
    </div>
    <div class="threeBlueBtn colorfff tac cur-p fs16 m-auto" @click="confirm">确定</div>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
export default {
  name: "changePsd",
  data(){
  	return {
  		isError:false,
  		type:'',
  		form:{
  			oldPsd:'',
  			newPsd:'',
  			rePsd:''
  		}
  	}
  },
  mounted(){
  	this.type = this.$route.params.type
  },
  methods:{
  	back(){
  		this.$router.back();
  	},
  	psdFocus(){
  		this.isError = false
  	},
  	confirm(){
  		let _this = this
  		if(!(_this.form.newPsd && _this.form.rePsd && _this.form.oldPsd)){
  			Toast({
		        message: "输入框不能为空"
		    });
		    return
  		}
  		if(_this.form.newPsd.length<8){
  			Toast({
		        message: "密码长度8位以上"
		    });
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
        return
      }  
  		if(_this.form.newPsd != _this.form.rePsd){
  			this.isError = true
  			Toast({
		        message: "两次新密码输入不一致"
		    });
  			return
  		}
      _this.PopupAPI.changePassword(_this.form.oldPsd,_this.form.newPsd).then(res=>{
        Toast({
          message: "修改密码成功,请重新登录",
          position: 'top',
          iconClass: 'mintui mintui-success'
        });
        _this.form.oldPsd = ''
        _this.form.rePsd = ''
        _this.form.newPsd = ''
        _this.$router.push('/open/fromMain')
      }).catch(err=>{
        Toast({
          message: err
        });
      })
  		
  	}
  }
};
</script>
<style lang="stylus">
@import './../../../assets/css/var.styl';
.changePsd
	width:100%
	height:100%
	padding-top:90px
	.changePsd-cont
		width:300px
		h2
			line-height:33px
			margin-bottom:35px
		>div
			margin-bottom:28px	
	.threeBlueBtn
		margin-bottom: 38px;
		margin-top: 59px;	
</style>
