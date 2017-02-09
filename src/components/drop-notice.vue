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
