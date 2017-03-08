<template>
  <div id="app">
    <ImageEditor :minWidth="800" :maxWidth="1000"></ImageEditor>
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
