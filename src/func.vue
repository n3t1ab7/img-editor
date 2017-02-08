<template>
	<div class="toolbar" :style="style">
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
  		style:{
  			height:this.sty.height,
  			marginBottom:this.sty.marginBottom
  		}
  	}
  },
  methods:{
  	toggleTextInput(){
  		this.$emit('toggleText')
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
  * {
    box-sizing: border-box;
    padding: 0;
    margin:0;
  }
  .menu {
    button {
      background: #fff;
    }
  }
  .main-btn {
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    padding: 5px 15px;
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
