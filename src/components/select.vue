<template>
  <label class="select">
    <a @click="toggleSelect"> {{now.name}}<i class="icon">&#xe608;</i></a>
    <div v-show="show">
      <a v-for="btn in btns" @click.stop="clickBtn" :data-id="btn.idx">{{btn.name}}</a>
    </div>
  </label>
</template>
<script>
export default {
  name: 'list',
  props: ['btns', 'value'],
  data() {
    return {
      now: this.btns[this.value],
      show: false
    }
  },

  watch: {
    value(v) {
      this.now = this.btns[v]
    }
  },

  methods: {
    toggleSelect() {
      this.show = !this.show
    },

    clickBtn(e) {
      this.$emit('input', Number(e.target.dataset.id))
      this.$emit('change')
      this.show = !this.show
      this.now = this.btns[e.target.dataset.id]
    }
  }
}
</script>
