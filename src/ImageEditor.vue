<template>
  <div id="image-editor" :style="imageEditorSty">
    <div class="toolbar-wrapper" :style="toolWrapperSty">
      <funcbar :sty='funcSty' @toggleText="toggleText" @toggleClip="toggleClip" @download="download" @reset="reset" />
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
        <div class="clipbox" :style="clipSty" :class="clipCla"></div>
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
      toolWrapperH: 70,
      toolWrapperMargin: 10,
      toolBarH: 30,
      toolBarMargin: 10,

      naturalW: this.width,
      naturalH: this.height,

      // text style
      textL: 10,
      textT: 10,
      textW: 0,
      textFz: 22,
      textFm: 'sans-serif',
      textColors: {
        hex: "#fff"
      },
      textAlpha: 1,

      // clip style
      clipW: 200,
      clipH: 200,
      clipL: 10,
      clipT: 10,

      // action state
      canPaint: false,
      showText: false,
      showClip: false,

      //text state
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

      // data
      imgUrl: null,
      ctxData: null
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
    // style outer
    imageEditorSty() {
      return {
        width: this.naturalW + 'px',
        height: (this.naturalH + this.toolWrapperH + this.toolBarMargin) + 'px'
      }
    },

    toolWrapperSty() {
      return {
        height: this.toolWrapperH + 'px',
        marginBottom: this.toolWrapperMargin + 'px'
      }
    },

    funcSty() {
      return {
        height: this.toolBarH + 'px',
        marginBottom: this.toolBarMargin + 'px'
      }
    },

    enhanceSty() {
      return {
        height: this.toolBarH + 'px'
      }
    },

    editSty() {
      return {
        width: this.naturalW + 'px',
        height: this.naturalH + 'px',
        backgroundColor: this.showClip ? 'rgba(0,0,0,0.5)' : 'transparent'
      }
    },

    canvasH() {
      return this.naturalH
    },

    canvasW() {
      return this.naturalW
    },

    // style text
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

    // style clip
    clipSty() {
      return {
        height: this.clipH + 'px',
        width: this.clipW + 'px',
        top: this.clipT + 'px',
        left: this.clipL + 'px',
        backgroundImage: 'url(' + this.imgUrl + ')',
        backgroundPosition: (-this.clipL) + 'px ' + (-this.clipT) + 'px'
      }
    },

    // class
    // class text
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
    },

    clipCla() {
      return {
        hide: !this.showClip
      }
    }
  },

  methods: {
    // upload image
    dragover(e) {
      e.preventDefault()
    },

    drop(e) {
      let file, imgUrl, img, imgForComputeWH
      e.preventDefault()
      if (this.canPaint) return false
      file = e.dataTransfer.files[0]
      this.imgUrl = URL.createObjectURL(file)
      img = new Image()
      imgForComputeWH = new Image()
      img.onload = () => {
        this.canPaint = true
        this.ctx.drawImage(img, 0, 0)
        this.ctxData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH);
      }
      imgForComputeWH.onload = () => {
        this.naturalW = imgForComputeWH.width
        this.naturalH = imgForComputeWH.height
        img.src = this.imgUrl
      }
      imgForComputeWH.src = this.imgUrl
    },

    // text
    toggleText() {
      if (!this.canPaint) return false
      if (this.showClip) {
        this.resetClip()
      }
      if (this.showText) {
        this.resetText()
      } else {
        this.showText = true
        this.textText = this.textInitText
        this.textCurrentAlignRatio = this.textCAlignRatio
        this.textW = computeTextW(this.textText, this.textFz, this.textCurrentAlignRatio, this.textMinW)
      }
    },

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

    // clip
    toggleClip() {
      if (!this.canPaint) return false
      if (this.showText) {
        this.resetText()
      }
      if (this.showClip) {
        this.resetClip()
      } else {
        this.showClip = true
      }
    },

    resetClip() {
      this.showClip = false
      this.clipl = 10
      this.clipT = 10
      this.clipW = 200
      this.clipH = 200
    },

    // paint
    maskClick(e) {
      if (e.target.className !== 'mask') return false
      this.paint()
    },

    // reset and download
    reset() {
      if (!this.canPaint) return false
      this.resetText()
      this.resetClip()
      this.ctx.putImageData(this.ctxData, 0, 0)
    },

    download() {
      if (!this.canPaint) return false
    },

    paint() {
      // textArea
      let ctx, left, top
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
    }
  },

  mounted() {
    let d = document
    let offset, left, top, beyond

    this.text = this.$el.getElementsByClassName('textarea')[0]
    this.canvas = this.$el.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d');

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

.hide {
  display: none;
}

body {
  margin: 0;
  padding: 0;
}

button {
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  margin-left: 5px;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);
  &:hover {
    opacity: 0.6;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }
}

input {
  outline: none;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 2px;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);
  width: 30px;
  text-align: center;
  &:hover {
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }
}

#image-editor {
  font-family: "SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  user-select: none;
  position: relative;
  margin: 20px auto;
  width: 400px;
  height: 300px;
  .toolbar-wrapper {
    font-size: 11px;
    .toolbar {
      .menu {
        float: left;
        height: 100%;
      }
      .main-btn {
        background: #20a0ff;
        color: #fff;
        border-radius: 2px;
        padding: 5px 17px;
      }
    }
    .toolbar.funcbar {
      * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
      }
      button {
        margin-left: 10px;
      }
      .menu {
        button {
          &:hover {
            box-shadow: none;
          }
          &:first-of-type {
            margin-left: 0;
          }
        }
      }
      .main-btn {
        background: #20a0ff;
        color: #fff;
        border-radius: 2px;
        padding: 5px 17px;
      }
      .download,
      .reset {
        float: right;
      }
    }
    .toolbar.enhance {
      background: #f5f6fa;
      border-radius: 6px;
      color: #747272;
      label {
        margin-left: 7px;
      }
    }
    .toolbar.text-enhance {
      .menu {
        line-height: 33px;
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
      .drop-notice {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 30px;
        text-align: center;
        transform: translateX(-50%) translateY(-50%);
        color: #ada4a4;
        .drop-icon {
          font-size: 60px;
        }
      }
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
      .clipbox {
        position: absolute;
        cursor: pointer;
        border: 2px dashed #fff;
      }
    }
  }
}
</style>
