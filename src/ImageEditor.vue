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
            <input type="number" v-model="textFz" min="5" />
          </label>
          <label>
            不透明度
            <input type="number" v-model="textAlpha" step="0.1" min="0" max="1" />
          </label>
          <label>
            阴影水平偏移
            <input type="number" v-model="shadowX" />
          </label>
          <label>
            阴影垂直偏移
            <input type="number" v-model="shadowY" />
          </label>
          <label>
            模糊半径
            <input type="number" v-model="shadowBlur" />
          </label>
          <label>
            阴影颜色
            <input type="text" readonly="true" @click="toggleShadowColorPicker" :style="shadowColorInputSty" class="color-picker-input" />
            <div class="color-picker" :class="shadowColorPickerCla">
              <color-picker v-model="shadowColors" @change-color="onShadowColorChange"></color-picker>
            </div>
          </label>
        </div>
      </div>
      <div class="toolbar enhance clip-enhance" :style="enhanceSty" :class="clipEnhanceCla">
        <div class="menu">
          <button class="main-btn" @click="downloadClip">导出裁剪</button>
          <label>
            X
            <input type="number" class="clip-input" v-model="clipL" />
          </label>
          <label>
            Y
            <input type="number" class="clip-input" v-model="clipT" />
          </label>
          <label>
            宽度
            <input type="number" class="clip-input" v-model="clipW" />
          </label>
          <label>
            高度
            <input type="number" class="clip-input" v-model="clipH" />
          </label>
        </div>
      </div>
    </div>
    <div class="panel" :style="editSty">
      <canvas :width="canvasW" :height="canvasH"></canvas>
      <div class="mask" :style="editSty" @drop="drop" @dragover="dragover" @click="maskClick">
        <dropnotice :isShow="!canPaint" />
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" @keypress="textKeyPress" draggable="false" v-model="textText"></textarea>
        <div class="clipbox" :style="clipSty" :class="clipCla" @mousedown="clipMouseDown">
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
          <span class="clip-point"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getElemOffset,
  getPointerToElem,
  computeTextW,
  ctxDataToImgUrl
}
from './utils.js'
import funcbar from './components/func.vue'
import dropnotice from './components/drop-notice.vue'
import {
  Chrome
}
from 'vue-color'

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
        hex: "#ffffff"
      },
      shadowColors: {
        hex: '#000000'
      },
      textAlpha: 1,
      shadowBlur: 0,
      shadowX: 0,
      shadowY: 0,


      // clip style
      clipW: 200,
      clipH: 200,
      clipL: 10,
      clipT: 10,
      clipBorderW: 1,

      // action state
      canPaint: false,
      showText: false,
      showClip: false,

      //text state
      textContenteditable: false,
      textCanDrag: false,
      textInitText: '双击编辑',
      textText: '',
      textLAlignRatio: 1.04,
      textCAlignRatio: 1.5,
      textCurrentAlignRatio: 1,
      textHeightPadding: 10,
      textMinW: 100,
      textIsBeyond: false,
      textToPointer: null,

      // text-enhance state 
      textShowColorPicker: false,
      textShowShadowColorPicker: false,

      // clip state
      clipToPointer: null,
      clipIsBeyond: false,
      clipCanDrag: false,

      // data
      nowImgUrl: '',
      initCtxData: null,
      nowCtxData: null
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
      }
      else {
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
        backgroundColor: this.showClip ? 'rgba(0,0,0,0.6)' : 'transparent'
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
        opacity: this.textAlpha,
        textShadow: ((!this.shadowX) && (!this.shadowY)) ? 'none' : this.shadowX + 'px ' + this.shadowY + 'px ' + this.shadowBlur + 'px ' + this.shadowColors.hex
      }
    },

    colorInputSty() {
      return {
        background: this.textColors.hex
      }
    },

    shadowColorInputSty() {
      return {
        background: this.shadowColors.hex
      }
    },

    // style clip
    clipSty() {
      return {
        borderWidth: this.clipBorderW + 'px',
        height: this.clipH + 'px',
        width: this.clipW + 'px',
        top: this.clipT + 'px',
        left: this.clipL + 'px',
        backgroundImage: 'url(' + this.nowImgUrl + ')',
        backgroundPosition: (-this.clipL - this.clipBorderW) + 'px ' + (-this.clipT - this.clipBorderW) + 'px'
      }
    },

    // class
    // class text
    colorPickerCla() {
      return {
        hide: !this.textShowColorPicker
      }
    },

    shadowColorPickerCla() {
      return {
        hide: !this.textShowShadowColorPicker
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
    },

    clipEnhanceCla() {
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
      if (this.canPaint) return false
      let file, img, imgForComputeWH
      e.preventDefault()
      file = e.dataTransfer.files[0]
      this.nowImgUrl = URL.createObjectURL(file)
      img = new Image()
      img.onload = () => {
        this.naturalW = img.width
        this.naturalH = img.height
        this.$nextTick(function() {
          this.ctx.drawImage(img, 0, 0)
          this.canPaint = true
          this.nowCtxData = this.initCtxData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH)
        })
      }
      img.src = this.nowImgUrl
    },

    // text
    toggleText() {
      if (!this.canPaint) return false
      if (this.showClip) {
        this.resetClip()
      }
      if (this.showText) {
        this.resetText()
      }
      else {
        this.showText = true
        this.textText = this.textInitText
        this.textCurrentAlignRatio = this.textCAlignRatio
        this.textW = computeTextW(this.textText, this.textFz, this.textCurrentAlignRatio, this.textMinW)
      }
    },

    textMouseDown(e) {
      this.textCanDrag = true
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
      }
      else {
        this.textIsBeyond = false
      }
    },

    toggleColorPicker() {
      this.textShowColorPicker = !this.textShowColorPicker
    },

    toggleShadowColorPicker() {
      this.textShowShadowColorPicker = !this.textShowShadowColorPicker
    },

    onColorChange(val) {
      this.textColors.hex = val.hex
    },

    onShadowColorChange(val) {
      this.shadowColors.hex = val.hex
    },

    resetText() {
      this.showText = false
      this.textContenteditable = false
      this.textIsBeyond = false
      this.textText = ""
      this.textCurrentAlignRatio = 1
      this.textL = 10
      this.textT = 10
      this.textColors.hex = '#ffffff'
      this.shadowColors.hex = '#000000'
      this.textFz = 22
      this.textFm = 'sans-serif'
      this.textShowColorPicker = false
      this.shadowY = 0
      this.shadowX = 0
      this.shadowBlur = 0
      this.textAlpha = 1

    },


    // clip
    toggleClip() {
      if (!this.canPaint) return false
      if (this.showText) {
        this.resetText()
      }
      if (this.showClip) {
        this.resetClip()
      }
      else {
        this.showClip = true
      }
    },

    clipMouseDown(e) {
      this.clipToPointer = getPointerToElem(e, this.clip)
      if (e.target.className !== 'clip-point') {
        this.clipCanDrag = true
      }
    },

    downloadClip() {
      this.outPut(this.clipL, this.clipT, this.clipW, this.clipH)
    },

    resetClip() {
      this.showClip = false
      this.clipL = 10
      this.clipT = 10
      this.clipW = 200
      this.clipH = 200
    },

    // mask
    maskClick(e) {
      if (e.target.className !== 'mask') return false
      this.paint()
    },

    // reset and download
    reset() {
      if (!this.canPaint) return false
      this.resetText()
      this.resetClip()
      this.ctx.putImageData(this.initCtxData, 0, 0)
      this.nowImgUrl = ctxDataToImgUrl(this.initCtxData, 0, 0, this.canvasW, this.canvasH)
    },

    download() {
      if (!this.canPaint) return false
      this.outPut(0, 0, this.canvasW, this.canvasH)
    },

    // paint
    paint() {
      // textArea
      let ctx, left, top, data
      if (this.showText && this.textContenteditable) {
        left = this.textL
        top = this.textT + parseFloat(this.textFz)
        ctx = this.ctx
        ctx.globalAlpha = this.textAlpha
        ctx.fillStyle = this.textColors.hex
        ctx.font = this.textFz + 'px ' + this.textFm
        ctx.shadowBlur = this.shadowBlur
        ctx.shadowColor = this.shadowColors.hex
        ctx.shadowOffsetX = this.shadowX
        ctx.shadowOffsetY = this.shadowY
        ctx.fillText(this.textText, left, top)
        this.resetText()
        this.nowCtxData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH)
        this.nowImgUrl = ctxDataToImgUrl(this.nowCtxData, 0, 0, this.canvasW, this.canvasH)
      }
    },

    // output
    outPut(x, y, w, h) {
      let a, url
      a = document.createElement('a')
      url = ctxDataToImgUrl(this.nowCtxData, x, y, w, h)
      a.href = url
      a.download = String(+(new Date))
      a.click()
    }
  },

  mounted() {
    let d = document
    let offset, left, top, beyond

    this.text = this.$el.getElementsByClassName('textarea')[0]
    this.clip = this.$el.getElementsByClassName('clipbox')[0]
    this.canvas = this.$el.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d');

    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => d.addEventListener(name, (e) => e.preventDefault()))

    d.addEventListener('mousemove', (e) => {
      offset = getPointerToElem(e, this.canvas)
      if (this.textCanDrag) {
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
      if (this.clipCanDrag) {
        left = offset.left - this.clipToPointer.left
        top = offset.top - this.clipToPointer.top
        if (left >= 0 && left <= this.canvasW - parseFloat(this.clipSty.width)) {
          this.clipL = left
        }
        if (top >= 0 && top <= this.canvasH - parseFloat(this.clipSty.height)) {
          this.clipT = top
        }
        beyond = getElemOffset(this.canvas, this.clip).left + this.clipW - this.canvasW
        if (beyond <= 0) {
          this.clipIsBeyond = false
        }
      }
    })

    d.addEventListener('mouseup', () => {
      this.textCanDrag = false
      this.clipCanDrag = false
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
  position: relative;
  display: inline-block;
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  margin-left: 5px;
}

input {
  outline: none;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 2px;
  width: 30px;
  text-align: center;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
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
        border-radius: 4px;
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
        line-height: 27px;
        button {
          &:first-of-type {
            margin-left: 0;
          }
        }
      }
      .main-btn {
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
      box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
      label {
        margin-left: 7px;
        position: relative;
      }
    }
    .toolbar.text-enhance {
      line-height: 33px;
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
        left: 0;
      }
    }
    .toolbar.clip-enhance {
      line-height: 32px;
      input.clip-input {
        width: 50px;
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
        border-style: dashed;
        border-color: #fff;
        .clip-point {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 100%;
          background: #20a0ff;
          &:first-of-type {
            left: 0;
            top: 0;
            transform: translateX(-50%) translateY(-50%);
          }
          &:nth-of-type(2) {
            left: 50%;
            top: 0;
            transform: translateX(-50%) translateY(-50%);
          }
          &:nth-of-type(3) {
            right: 0;
            top: 0;
            transform: translateX(50%) translateY(-50%);
          }
          &:nth-of-type(4) {
            left: 0;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
          }
          &:nth-of-type(5) {
            top: 50%;
            right: 0;
            transform: translateX(50%) translateY(-50%);
          }
          &:nth-of-type(6) {
            bottom: 0;
            left: 0;
            transform: translateX(-50%) translateY(50%);
          }
          &:nth-of-type(7) {
            left: 50%;
            bottom: 0;
            transform: translateX(-50%) translateY(50%);
          }
          &:nth-of-type(8) {
            right: 0;
            bottom: 0;
            transform: translateX(50%) translateY(50%);
          }
        }
      }
    }
  }
}
</style>
