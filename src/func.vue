<template>
  <div class="toolbar funcbar" :style="style">
    <div class="menu">
      <button @click="toggleText"><i class="icon">&#xe633;</i></button>
      <button @click="toggleClip"><i class="icon">&#xe600;</i></button>
    </div>
    <button class="main-btn download" @click="download">导出</button>
    <button class="main-btn reset" @click="reset">重置</button>
  </div>
</template>
<script>
export default {
  name: 'func',
  props: ['sty'],
  data() {
    return {
      style: {
        height: this.sty.height,
        marginBottom: this.sty.marginBottom
      }
    }
  },
  methods: {
    toggleText() {
      this.$emit('toggleText')
    },
    toggleClip() {
      this.$emit('toggleClip')
    },
    download() {
      this.$emit('download')
    },
    reset() {
      this.$emit('reset')
    }
  }
}
</script>
