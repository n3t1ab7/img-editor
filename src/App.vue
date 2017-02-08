<template>
  <div id="app">
    <image-editor width="900px" height="675px"></image-editor>
  </div>
</template>
<script>
import imageeditor from './imageeditor.vue'
export default {
  name: 'app',
  components: {
    'image-editor': imageeditor
  }
}
</script>
