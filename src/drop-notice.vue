<template>
  <div :class="classObj" class="drop-notice">
    <i class="icon drop-icon">&#xe624;</i>
    <p>拖放图片到此</p>
  </div>
</template>

<script>
export default {
  name: 'dropnotice',
  props:['isShow'],
  computed:{
    classObj(){
      return {
        hide:!this.isShow        
      }
    }
  }
}
</script>

<style lang='scss' scoped>
 .drop-notice {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 30px;
    text-align: center;
    transform: translateX(-50%) translateY(-50%);
    color: #ada4a4;

    .drop-icon {
        font-size: 60px;
    }
}
</style>
