<template>
  <div id="app">
    <image-editor width="640px" height="476px"></image-editor>
  </div>
</template>

<script>
import ImageEditor from './ImageEditor.vue'
export default {
  name: 'app',
  components:{
    ImageEditor:ImageEditor
  }
}
</script>

<style>
</style>
