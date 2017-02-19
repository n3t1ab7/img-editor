<template>
  <div class="box" ref="box" :style="sty" :class="cla" @mousedown="boxMouseDown">
    <span class="point" @mousedown="pointMouseDown('LT')"></span>
    <span class="point" @mousedown="pointMouseDown('RT')"></span>
    <span class="point" @mousedown="pointMouseDown('LB')"></span>
    <span class="point" @mousedown="pointMouseDown('RB')"></span>
    <slot></slot>
  </div>
</template>
<script>
import {
  getElemOffset,
  getPointerToElem,
}
from '../libs/utils.js'

export default {
  name: 'Box',
  props: ['show', 'width', 'height', 'left', 'top', 'borderW', 'canvasW', 'canvasH', 'canDrag', 'canvas'],
  data() {
    return {
      boxW: this.width,
      boxH: this.height,
      boxL: this.top,
      boxT: this.left,
      boxToPointer: null,
      boxCanDrag: this.canDrag,
      boxPointCanDrag: false,
      boxLTPointCanDrag: false,
      boxRTPointCanDrag: false,
      boxLBPointCanDrag: false,
      boxRBPointCanDrag: false,
      boxStopL: null,
      boxStopT: null,
      boxStopR: null,
      boxStopB: null,
      boxStopW: null,
      boxStopH: null,
    }
  },

  computed: {
    sty() {
      return {
        width: this.boxW + 'px',
        height: this.boxH + 'px',
        left: this.boxL + 'px',
        top: this.boxT + 'px',
        borderWidth: this.borderW + 'px'
      }
    },
    cla() {
      return {
        hide: !this.show
      }
    }
  },

  watch: {
    left() {
      this.boxL = this.left
    },
    top() {
      this.boxT = this.top
    },
    width() {
      this.boxW = this.width
    },
    height() {
      this.boxH = this.height
    }
  },

  methods: {
    boxMouseDown(e) {
      this.boxToPointer = getPointerToElem(e, this.$refs.box)
      if (e.target.className !== 'point') {
        this.boxCanDrag = true
      }
    },

    pointMouseDown(name) {
      let offset = getElemOffset(this.canvas, this.$refs.box)
      this.boxPointCanDrag = true
      this.boxStopW = this.boxW
      this.boxStopH = this.boxH
      switch (name) {
        case 'LT':
          this.boxLTPointCanDrag = true
          this.boxR = offset.right
          this.boxB = offset.bottom
          this.boxStopL = offset.left
          this.boxStopT = offset.top
          break;
        case 'RT':
          this.boxRTPointCanDrag = true
          this.boxL = offset.left
          this.boxB = offset.bottom
          this.boxStopR = offset.right
          this.boxStopT = offset.top
          break;
        case 'LB':
          this.boxLBPointCanDrag = true
          this.boxR = offset.right
          this.boxT = offset.top
          this.boxStopL = offset.left
          this.boxStopB = offset.bottom
          break;
        case 'RB':
          this.boxRBPointCanDrag = true
          this.boxL = offset.left
          this.boxT = offset.top
          this.boxStopR = offset.right
          this.boxStopB = offset.bottom
          break;
      }
    }
  },

  mounted() {
    let d = document
    let offset, left, top
    d.addEventListener('mousemove', (e) => {
      if (this.boxCanDrag) {
        offset = getPointerToElem(e, this.canvas)
        left = offset.left - this.boxToPointer.left
        top = offset.top - this.boxToPointer.top
        if (left >= 0 && left <= this.canvasW - parseFloat(this.sty.width)) {
          this.boxL = left
        }
        if (top >= 0 && top <= this.canvasH - parseFloat(this.sty.height)) {
          this.boxT = top
        }
        this.$emit('change', {
          width: this.boxW,
          height: this.boxH,
          left: this.boxL,
          top: this.boxT
        })
      }
      if (this.boxPointCanDrag) {
        offset = getPointerToElem(e, this.canvas)
        if (this.boxLTPointCanDrag) {
          if (offset.left >= 0) {
            this.boxL = offset.left
            this.boxW = this.boxStopL - offset.left + this.boxStopW
          }
          if (offset.top >= 0) {
            this.boxT = offset.top
            this.boxH = this.boxStopT - offset.top + this.boxStopH
          }
        }
        if (this.boxRTPointCanDrag) {
          if (offset.right >= 0) {
            this.boxR = offset.right
            this.boxW = this.boxStopR - offset.right + this.boxStopW
          }
          if (offset.top >= 0) {
            this.boxT = offset.top
            this.boxH = this.boxStopT - offset.top + this.boxStopH
          }
        }
        if (this.boxLBPointCanDrag) {
          if (offset.left >= 0) {
            this.boxL = offset.left
            this.boxW = this.boxStopL - offset.left + this.boxStopW
          }
          if (offset.bottom >= 0) {
            this.boxB = offset.bottom
            this.boxH = this.boxStopB - offset.bottom + this.boxStopH
          }
        }
        if (this.boxRBPointCanDrag) {
          if (offset.right >= 0) {
            this.boxR = offset.right
            this.boxW = this.boxStopR - offset.right + this.boxStopW
          }
          if (offset.bottom >= 0) {
            this.boxB = offset.bottom
            this.boxH = this.boxStopB - offset.bottom + this.boxStopH
          }
        }
        this.$emit('change', {
          width: this.boxW,
          height: this.boxH,
          left: this.boxL,
          top: this.boxT
        })
      }
    })

    d.addEventListener('mouseup', () => {
      this.boxCanDrag = false
      this.boxPointCanDrag = false
      this.boxLTPointCanDrag = false
      this.boxLBPointCanDrag = false
      this.boxRTPointCanDrag = false
      this.boxRBPointCanDrag = false
    })
  }
}
</script>
