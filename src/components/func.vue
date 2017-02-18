<template>
  <div class="toolbar funcbar" :style="style">
    <div class="menu">
      <button @click="toggleText"><i class="icon">&#xe633;</i>文本</button>
      <button @click="toggleClip"><i class="icon">&#xe600;</i>裁剪</button>
      <button @click="toggleBlur"><i class="icon">&#xe67d;</i>模糊</button>
      <button @click="toggleMosaic"><i class="icon">&#xe6b3;</i>马赛克</button>
      <button @click="toggleFigure"><i class="icon">&#xe605;</i>图形</button>
      <button @click="toggleFilter"><i class="icon">&#xe605;</i>滤镜</button>
    </div>
    <button class="main-btn download" @click="download">导出</button>
    <button class="main-btn reset" @click="reset">重置</button>
    <button class="main-btn restore" @click="restore">恢复</button>
    <button class="main-btn undo" @click="undo">撤销</button>
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
    toggleBlur() {
      this.$emit('toggleBlur')
    },
    toggleMosaic() {
      this.$emit('toggleMosaic')
    },
    toggleFigure() {
      this.$emit('toggleFigure')
    },
    toggleFilter() {
      this.$emit('toggleFilter')
    },
    undo() {
      this.$emit('undo')
    },
    restore() {
      this.$emit('restore')
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
