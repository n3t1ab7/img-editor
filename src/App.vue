<template>
  <div id="app">
    <image-editor :width="800" :height="500"></image-editor>
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
