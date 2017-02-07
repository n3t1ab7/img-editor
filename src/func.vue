<template>
	<div class="toolbar" :style="styleObj">
    <div class="menu">
      <button @click="toggleTextInput"><i class="icon">&#xe633;</i></button>
   	</div> 
   <button class="main-btn download" @click="download">导出</button>
   <button class="main-btn reset" @click="reset">重置</button>
  </div>
</template>

<script>
export default {
  name: 'func',
  props:['sty'],
  data(){
  	return {
  		styleObj:{
  			height:this.sty.height+'px',
  			marginBottom:this.sty.marginBottom+'px'
  		}
  	}
  },
  methods:{
  	toggleTextInput(){
  		this.$emit('toggleTextArea')
  	},
  	download(){
  		this.$emit('download')
  	},
  	reset(){
  		this.$emit('reset')
  	}
  }
}
</script>

<style lang='scss' scoped>
.toolbar {
  .menu {
    button {
      background: #fff;
    }
  }
  .download {
    float: right;
  }
  .reset {
    float: right;
  }
  .download, .reset {
    margin-left: 10px;
  }
}
</style>
