<template>
  <label class="select">
    <button @click="toggleSelect"> {{now}}</button>
    <div :class="cla">
      <button v-for="btn in btns" @click.stop="clickBtn" :name="btn">{{btn}}</button>
    </div>
  </label>
</template>
<script>
export default {
  name: 'list',
  props: ['btns'],
  data() {
    return {
      show: false,
      now: this.btns[0]
    }
  },

  computed: {
    cla() {
      return {
        hide: !this.show
      }
    }
  },

  methods: {
    toggleSelect() {
      this.show = !this.show
    },

    clickBtn(e) {
      this.$emit('change', e.target.name)
    }
  }
}
</script>
