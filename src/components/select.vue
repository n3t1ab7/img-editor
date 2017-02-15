<template>
  <label class="select">
    <button @click="toggleSelect"> {{now.name}}<i class="icon">&#xe608;</i></button>
    <div :class="cla">
      <button v-for="btn in btns" @click.stop="clickBtn" :data-id="btn.idx">{{btn.name}}</button>
    </div>
  </label>
</template>
<script>
export default {
  name: 'list',
  props: ['btns', 'value', 'show'],
  data() {
    return {
      now: this.btns[this.value],
      s: this.show
    }
  },

  watch: {
    value(v) {
      this.now = this.btns[v]
    }
  },
  computed: {
    cla() {
      return {
        hide: !this.s
      }
    }
  },

  methods: {
    toggleSelect() {
      this.s = !this.s
    },

    clickBtn(e) {
      this.$emit('input', Number(e.target.dataset.id))
      this.$emit('change')
      this.s = !this.s
      this.now = this.btns[e.target.dataset.id]
    }
  }
}
</script>
