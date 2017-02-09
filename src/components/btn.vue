<template>
  <button @click="triggerClick" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <slot></slot>
    <div class="tip" :class="btnCla">{{tip}}</div>
  </button>
</template>
<script>
export default {
  name: 'btn',
  props: ['tip'],
  data() {
    return {
      showTip: false
    }
  },
  computed: {
    btnCla() {
      return {
        hide: !this.showTip
      }
    }
  },
  methods: {
    triggerClick() {
      this.$emit('click')
    },
    mouseEnter() {
      // this.showTip = true
    },
    mouseLeave() {
      // this.showTip = false
    }
  }
}
</script>
