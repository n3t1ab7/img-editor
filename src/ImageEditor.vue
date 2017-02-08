<template>
  <div id="image-editor" :style="imageEditorSty">
    <div class="toolbar-wrapper" :style="toolWrapperSty">
      <funcbar :sty='funcSty' @toggleText="toggleText" @download="download" @reset="reset" />
      <div class="toolbar enhance text-enhance" :style="enhanceSty" :class="textEnhanceCla">
        <div class="menu">
          <label>
            颜色
            <input type="text" readonly="true" @click="toggleColorPicker" :style="colorInputSty" class="color-picker-input" />
            <div class="color-picker" :class="colorPickerCla">
              <color-picker v-model="textColors" @change-color="onColorChange"></color-picker>
            </div>
          </label>
          <label>
            字号
            <input type="number" class="font-size-input" v-model="textFz" min="5" />
          </label>
          <label>
            不透明度
            <input type="number" v-model="textAlpha" class="alpha-input" step="0.1" min="0" max="1" />
          </label>
        </div>
      </div>
    </div>
    <div class="panel" :style="editSty">
      <canvas :width="canvasW" :height="canvasH"></canvas>
      <div class="mask" :style="editSty" @drop="drop" @dragover="dragover" @click="maskClick">
        <dropnotice :isShow="!canPaint" />
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" @keypress="textKeyPress" draggable="false" v-model="textText"></textarea>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getElemOffset,
  getPointerToElem,
  computeTextW
} from './utils.js'
import funcbar from './func.vue'
import dropnotice from './drop-notice.vue'
import {
  Chrome
} from 'vue-color'
export default {
  name: 'image-editor',

  props: ['width', 'height'],
  components: {
    'color-picker': Chrome,
    funcbar: funcbar,
    dropnotice: dropnotice
  },
  data() {
    return {
      // init main style 
      toolWrapperH: 80,
      toolWrapperMargin: 10,

      canvasH: parseFloat(this.height) - 80,
      canvasW: parseFloat(this.width),

      // action state
      canPaint: false,
      showText: false,

      // textArea style
      textL: 10,
      textT: 10,
      textW: 0,
      textFz: 22,
      textFm: 'sans-serif',
      textColors: {
        hex: "#fff"
      },
      textAlpha: 1,

      // textAretype="number" a state
      textContenteditable: false,
      textCannDrag: false,
      textInitText: '双击编辑',
      textText: '',
      textLAlignRatio: 1.1,
      textCAlignRatio: 1.5,
      textCurrentAlignRatio: 1,
      textHeightPadding: 10,
      textMinW: 100,
      textIsBeyond: false,
      textToPointer: null,

      // text-enhance state 
      textShowColorPicker: false,
    }
  },

  // something bad
  watch: {
    textFz(val, old) {
      let beyond
      this.textW = computeTextW(this.textText, val, this.textCurrentAlignRatio, this.textMinW)
      beyond = getElemOffset(this.canvas, this.text).left + this.textW - this.canvasW
      if (beyond > 0) {
        this.textFz = old
        this.textIsBeyond = true
      } else {
        this.textIsBeyond = false
      }
    }
  },

  computed: {
    // style 
    imageEditorSty() {
      return {
        width: this.width,
        height: this.height
      }
    },

    toolWrapperSty() {
      return {
        height: this.toolWrapperH - this.toolWrapperMargin + 'px',
        marginBottom: this.toolWrapperMargin + 'px'
      }
    },

    funcSty() {
      return {
        height: '30px',
        marginBottom: this.toolWrapperMargin + 'px'
      }
    },

    enhanceSty() {
      return {
        height: '30px'
      }
    },

    editSty() {
      return {
        width: this.width,
        height: parseFloat(this.height) - this.toolWrapperH + 'px'
      }
    },

    textSty() {
      return {
        left: this.textL + 'px',
        top: this.textT + 'px',
        color: this.textColors.hex,
        width: this.textW + 'px',
        height: parseFloat(this.textFz) + this.textHeightPadding + 'px',
        fontSize: this.textFz + 'px',
        fontFamily: this.textFm,
        opacity: this.textAlpha
      }
    },

    colorInputSty() {
      return {
        background: this.textColors.hex
      }
    },

    // class
    colorPickerCla() {
      return {
        hide: !this.textShowColorPicker
      }
    },

    textCla() {
      return {
        hide: !this.showText,
        abled: this.textContenteditable,
        disabled: !this.textContenteditable,
        beyond: this.textIsBeyond
      }
    },

    textEnhanceCla() {
      return {
        hide: !this.showText
      }
    }
  },

  methods: {
    // upload image
    dragover(e) {
      e.preventDefault()
    },

    drop(e) {
      let file, imgUrl, img
      e.preventDefault()
      file = e.dataTransfer.files[0]
      imgUrl = URL.createObjectURL(file)
      img = new Image()
      img.onload = (function() {
        this.canPaint = true
        this.ctx.drawImage(img, 0, 0)
        this.ctxData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH);
      }).bind(this)
      img.src = imgUrl
    },

    // trigger action
    toggleText() {
      if (!this.canPaint) return false
      this.showText = !this.showText
      if (!this.showText) {
        this.resetText()
      } else {
        this.textText = this.textInitText
        this.textCurrentAlignRatio = this.textCAlignRatio
        this.textW = computeTextW(this.textText, this.textFz, this.textCurrentAlignRatio, this.textMinW)
      }
    },

    // action area
    textMouseDown(e) {
      this.textCannDrag = true
      this.textToPointer = getPointerToElem(e, this.text)
    },

    textDouble() {
      this.textContenteditable = true
      this.textText = ''
      this.textCurrentAlignRatio = this.textLAlignRatio
      this.textW = computeTextW(this.textText, this.textFz, this.textCurrentAlignRatio, this.textMinW)
    },

    textKeyPress(e) {
      if (e.key == 'Enter') e.preventDefault()
    },

    textInput() {
      let beyond, countWillRemove
      this.textCurrentAlignRatio = this.textLAlignRatio
      this.textW = computeTextW(this.textText, this.textFz, this.textCurrentAlignRatio, this.textMinW)
      beyond = getElemOffset(this.canvas, this.text).left + this.textW - this.canvasW
      if (beyond > 0) {
        countWillRemove = Math.floor((beyond / (parseFloat(this.textFz) * this.textCurrentAlignRatio)))
        this.textText = this.textText.slice(0, this.textText.length - countWillRemove - 1)
        this.textW = this.textW - parseFloat(this.textFz) * this.textCurrentAlignRatio * (countWillRemove + 1)
        this.textIsBeyond = true
      } else {
        this.textIsBeyond = false
      }
    },

    resetText() {
      this.showText = false
      this.textContenteditable = false
      this.textIsBeyond = false
      this.textText = ""
      this.textCurrentAlignRatio = 1
      this.textL = 10
      this.textT = 10
      this.textColors.hex = '#fff'
      this.textFz = 22
      this.textFm = 'sans-serif'
      this.textShowColorPicker = false
      this.textAlpha = 1
    },

    toggleColorPicker() {
      this.textShowColorPicker = !this.textShowColorPicker
    },

    onColorChange(val) {
      this.textColors.hex = val.hex
    },

    // paint
    maskClick(e) {
      let ctx, left, top
      if (e.target.className !== 'mask') return false
        // textArea
      if (this.showText && this.textContenteditable) {
        left = this.textL
        top = this.textT + parseFloat(this.textFz)
        ctx = this.ctx
        ctx.globalAlpha = this.textAlpha
        ctx.fillStyle = this.textColors.hex
        ctx.font = this.textFz + 'px ' + this.textFm
        ctx.fillText(this.textText, left, top)
        this.resetText()
      }
    },

    // user operation
    reset() {
      if (!this.canPaint) return false
      this.resetText()
      this.ctx.putImageData(this.ctxData, 0, 0)
    },

    download() {
      if (!this.canPaint) return false
    }
  },

  mounted() {
    let d = document
    let offset, left, top, beyond

      ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => d.addEventListener(name, (e) => e.preventDefault()))

    d.addEventListener('mousemove', (e) => {
      if (this.textCannDrag) {
        offset = getPointerToElem(e, this.canvas)
        left = offset.left - this.textToPointer.left
        top = offset.top - this.textToPointer.top
        if (left >= 0 && left <= this.canvasW - parseFloat(this.textSty.width)) {
          this.textL = left
        }
        if (top >= 0 && top <= this.canvasH - parseFloat(this.textSty.height)) {
          this.textT = top
        }
        beyond = getElemOffset(this.canvas, this.text).left + this.textW - this.canvasW
        if (beyond <= 0) {
          this.textIsBeyond = false
        }
      }
    })

    d.addEventListener('mouseup', () => {
      this.textCannDrag = false
    })

    this.text = this.$el.getElementsByClassName('textarea')[0]
    this.canvas = this.$el.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d')
  }
}
</script>
<style lang="scss">
@font-face {
  font-family: 'icon';
  src: url('./assert/iconfont.ttf');
}

.icon {
  font-family: "icon" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}

.main-btn {
  &:hover {
    background: #4db3ff;
  }
}

button {
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
}

input {
  outline: none;
}

.hide {
  display: none;
}

.toolbar {
  .menu {
    float: left;
    height: 100%;
    button {
      margin-right: 5px;
      &:hover {
        color: #555;
      }
    }
  }
}

#image-editor {
  font-family: "SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  user-select: none;
  position: relative;
  margin: 20px auto;
  .toolbar-wrapper {
    font-size: 11px;
    .toolbar.enhance {
      background: #f5f6fa;
      border-radius: 6px;
      color: #747272;
      label {
        margin-right: 6px;
      }
    }
    .toolbar.text-enhance {
      .menu {
        line-height: 33px;
      }
      input {
        text-align: center;
      }
      .font-size-input,
      .alpha-input {
        width: 30px;
      }
      .color-picker-input {
        width: 12px;
        height: 12px;
        border-radius: 100%;
        border: 1px solid #ccc;
        text-align: center;
      }
      .color-picker {
        position: absolute;
        z-index: 100;
      }
    }
  }
  .panel {
    position: relative;
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }
    canvas,
    .mask {
      position: absolute;
      top: 0;
      left: 0;
    }
    .mask {
      z-index: 50;
      .textarea {
        position: absolute;
        overflow: hidden;
        background: transparent;
        border-radius: 1px;
        border: 2px dashed #fff;
        resize: none;
        outline: none;
        user-select: none;
        &.beyond {
          border-color: red;
        }
        &.disabled {
          text-align: center;
          cursor: pointer;
        }
        &.abled {
          text-align: left;
          cursor: auto;
        }
        &.onborder {
          border-color: red;
        }
      }
    }
  }
}
</style>
