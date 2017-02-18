<template>
  <div id="app">
    <ImageEditor :width="700" :height="500"></ImageEditor>
  </div>
</template>
<script>
import ImageEditor from './image-editor.vue'
export default {
  name: 'App',
  components: {
    'ImageEditor': ImageEditor
  }
}
</script>
