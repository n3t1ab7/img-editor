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
            水平
            <input type="number" class="clip-input" v-model="clipL" />
          </label>
          <label>
            垂直
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
      <canvas :width="canvasW" :height="canvasH" ref="canvas"></canvas>
      <div class="mask" :style="editSty" @drop="drop" @dragover="dragover" @click="maskClick">
        <dropnotice :isShow="!canPaint" />
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" @keypress="textKeyPress" draggable="false" v-model="textText" ref="text"></textarea>
        <div class="clipbox" :style="clipSty" :class="clipCla" @mousedown="clipMouseDown" ref="clip">
          <span class="clip-point" @mousedown="pointMouseDown('LT')"></span>
          <span class="clip-point" @mousedown="pointMouseDown('RT')"></span>
          <span class="clip-point" @mousedown="pointMouseDown('LB')"></span>
          <span class="clip-point" @mousedown="pointMouseDown('RB')"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getElemOffset,
  getPointerToElem,
  ctxDataToImgUrl,
  computeTextW
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
      toolWrapperMargin: 10,
      toolBarH: 40,
      enhanceBarH: 30,
      toolBarMargin: 10,

      naturalW: this.width,
      naturalH: this.height,

      // text style
      textL: 10,
      textT: 10,
      textW: 0,
      textFz: 22,
      textFm: 'sans-serif',
      textBorder: 2,
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
      clipBorderW: 1,
      clipW: 200,
      clipH: 200,
      clipL: 10,
      clipT: 10,
      clipR: null,
      clipB: null,

      // action state
      canPaint: false,
      showText: false,
      showClip: false,

      // text-enhance state 
      textShowColorPicker: false,
      textShowShadowColorPicker: false,

      //text state
      textContenteditable: false,
      textCanDrag: false,
      textInitText: '双击编辑',
      textText: '',
      textMinW: 100,
      textToPointer: null,
      textCanInput: true,

      // clip state
      clipToPointer: null,
      clipCanDrag: false,
      clipPointCanDrag: false,
      clipLTPointCanDrag: false,
      clipRTPointCanDrag: false,
      clipLBPointCanDrag: false,
      clipRBPointCanDrag: false,
      clipStopL: null,
      clipStopT: null,
      clipStopR: null,
      clipStopB: null,
      clipStopW: null,
      clipStopH: null,

      // data
      nowImgUrl: '',
      initCtxData: null,
      nowCtxData: null,
      ctx: null
    }
  },

  watch: {
    textFz(val, old) {
      let beyondW, beyondH
      this.setCtxText()
      this.textW = computeTextW(this.ctx, this.textText, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyondW = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.canvasW
        beyondH = getElemOffset(this.$refs.canvas, this.$refs.text).top + parseFloat(this.textSty.height) - this.canvasH
        if (beyondW > 0 || beyondH > 0) {
          this.textFz = old
        }
      })
    }
  },

  computed: {
    // style 
    // style outer
    imageEditorSty() {
      return {
        width: this.naturalW + 'px',
        height: (this.naturalH + this.toolWrapperMargin + this.toolBarH + this.enhanceBarH + this.toolBarMargin) + 'px'
      }
    },

    toolWrapperSty() {
      return {
        height: this.toolBarH + this.enhanceBarH + this.toolBarMargin + 'px',
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
        height: this.enhanceBarH + 'px'
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
        height: this.textFz * 1.4285 + 'px',
        borderW: this.textBorder + 'px',
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
        top: (this.clipLTPointCanDrag || this.clipRTPointCanDrag) ? 'auto' : this.clipT + 'px',
        left: (this.clipLTPointCanDrag || this.clipLBPointCanDrag) ? 'auto' : this.clipL + 'px',
        right: ((this.clipRTPointCanDrag || this.clipRBPointCanDrag) || (this.clipR === null)) ? 'auto' : this.clipR + 'px',
        bottom: ((this.clipLBPointCanDrag || this.clipRBPointCanDrag) || (this.clipB === null)) ? 'auto' : this.clipB + 'px',
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
        this.setCtxText()
        this.textW = computeTextW(this.ctx, this.textText, this.textMinW) + (this.textBorder * 2)
      }
    },

    textMouseDown(e) {
      this.textCanDrag = true
      this.textToPointer = getPointerToElem(e, this.$refs.text)
    },

    textDouble() {
      this.textContenteditable = true
      this.textText = ''
      this.textW = computeTextW(this.ctx, this.textText, this.textMinW) + (this.textBorder * 2)
    },

    textKeyPress(e) {
      if (e.key == 'Enter') e.preventDefault()
    },

    textWBeyondHandler() {
      let beyond, countWillRemove
      beyond = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.canvasW
      if (beyond > 0) {
        countWillRemove = Math.floor((beyond / (this.textW / this.textText.length)))
        this.textText = this.textText.slice(0, this.textText.length - countWillRemove - 1)
        this.textW = computeTextW(this.ctx, this.textText, this.textMinW) + (this.textBorder * 2)
      }
    },

    textInput() {
      this.textW = computeTextW(this.ctx, this.textText, this.textMinW) + (this.textBorder * 2)
      this.textWBeyondHandler()
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

    setCtxText() {
      let ctx = this.ctx
      ctx.globalAlpha = this.textAlpha
      ctx.fillStyle = this.textColors.hex
      ctx.font = this.textFz + 'px ' + this.textFm
      ctx.shadowBlur = this.shadowBlur
      ctx.shadowColor = this.shadowColors.hex
      ctx.shadowOffsetX = this.shadowX
      ctx.shadowOffsetY = this.shadowY
    },

    resetText() {
      this.showText = false
      this.textContenteditable = false
      this.textText = ""
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
      this.clipToPointer = getPointerToElem(e, this.$refs.clip)
      if (e.target.className !== 'clip-point') {
        this.clipCanDrag = true
      }
    },

    downloadClip() {
      this.outPut(this.clipL, this.clipT, this.clipW, this.clipH)
    },

    pointMouseDown(name) {
      let offset = getElemOffset(this.$refs.canvas, this.$refs.clip)
      this.clipPointCanDrag = true
      this.clipStopW = this.clipW
      this.clipStopH = this.clipH
      switch (name) {
        case 'LT':
          this.clipLTPointCanDrag = true
          this.clipR = offset.right
          this.clipB = offset.bottom
          this.clipStopL = offset.left
          this.clipStopT = offset.top
          break;
        case 'RT':
          this.clipRTPointCanDrag = true
          this.clipL = offset.left
          this.clipB = offset.bottom
          this.clipStopR = offset.right
          this.clipStopT = offset.top
          break;
        case 'LB':
          this.clipLBPointCanDrag = true
          this.clipR = offset.right
          this.clipT = offset.top
          this.clipStopL = offset.left
          this.clipStopB = offset.bottom
          break;
        case 'RB':
          this.clipRBPointCanDrag = true
          this.clipL = offset.left
          this.clipT = offset.top
          this.clipStopR = offset.right
          this.clipStopB = offset.bottom
          break;
      }
    },

    resetClip() {
      this.showClip = false
      this.clipL = 10
      this.clipT = 10
      this.clipW = 200
      this.clipH = 200
      this.clipR = null
      this.clipB = null
      this.clipStopL = null
      this.clipStopT = null
      this.clipStopW = null
      this.clipStopH = null
    },

    // mask
    maskClick(e) {
      if (e.target.className !== 'mask') return false
      this.paint()
    },

    // reset and download
    reset() {
      if (!this.canPaint) return false
      if (this.showText) {
        this.resetText()
      }
      if (this.showClip) {
        this.resetClip()
      }
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
      if (this.showText && this.textContenteditable) {
        this.paintText()
        this.nowCtxData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH)
        this.nowImgUrl = ctxDataToImgUrl(this.nowCtxData, 0, 0, this.canvasW, this.canvasH)
      }
    },

    paintText() {
      let ctx, left, top, data
      this.setCtxText()
      left = this.textL + this.textBorder
      top = this.textT + this.textBorder + this.textFz
      ctx = this.ctx
      ctx.fillText(this.textText, left, top)
      this.resetText()
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

    this.ctx = this.$refs.canvas.getContext('2d');

    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => d.addEventListener(name, (e) => e.preventDefault()))

    d.addEventListener('mousemove', (e) => {
      if (this.textCanDrag) {
        offset = getPointerToElem(e, this.$refs.canvas)
        left = offset.left - this.textToPointer.left
        top = offset.top - this.textToPointer.top
        if (left >= 0 && left <= this.canvasW - parseFloat(this.textSty.width)) {
          this.textL = left
        }
        if (top >= 0 && top <= this.canvasH - parseFloat(this.textSty.height)) {
          this.textT = top
        }
        beyond = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.canvasW
        if (beyond <= 0) {
          this.textIsBeyond = false
        }
      }
      if (this.clipCanDrag) {
        offset = getPointerToElem(e, this.$refs.canvas)
        left = offset.left - this.clipToPointer.left
        top = offset.top - this.clipToPointer.top
        if (left >= 0 && left <= this.canvasW - parseFloat(this.clipSty.width)) {
          this.clipL = left
        }
        if (top >= 0 && top <= this.canvasH - parseFloat(this.clipSty.height)) {
          this.clipT = top
        }
      }
      if (this.clipPointCanDrag) {
        offset = getPointerToElem(e, this.$refs.canvas)
        if (this.clipLTPointCanDrag) {
          if (offset.left >= 0) {
            this.clipL = offset.left
            this.clipW = this.clipStopL - offset.left + this.clipStopW
          }
          if (offset.top >= 0) {
            this.clipT = offset.top
            this.clipH = this.clipStopT - offset.top + this.clipStopH
          }
        }
        if (this.clipRTPointCanDrag) {
          if (offset.right >= 0) {
            this.clipR = offset.right
            this.clipW = this.clipStopR - offset.right + this.clipStopW
          }
          if (offset.top >= 0) {
            this.clipT = offset.top
            this.clipH = this.clipStopT - offset.top + this.clipStopH
          }
        }
        if (this.clipLBPointCanDrag) {
          if (offset.left >= 0) {
            this.clipL = offset.left
            this.clipW = this.clipStopL - offset.left + this.clipStopW
          }
          if (offset.bottom >= 0) {
            this.clipB = offset.bottom
            this.clipH = this.clipStopB - offset.bottom + this.clipStopH
          }
        }
        if (this.clipRBPointCanDrag) {
          if (offset.right >= 0) {
            this.clipR = offset.right
            this.clipW = this.clipStopR - offset.right + this.clipStopW
          }
          if (offset.bottom >= 0) {
            this.clipB = offset.bottom
            this.clipH = this.clipStopB - offset.bottom + this.clipStopH
          }
        }
      }
    })

    d.addEventListener('mouseup', () => {
      this.textCanDrag = false
      this.clipCanDrag = false
      this.clipPointCanDrag = false
      this.clipLTPointCanDrag = false
      this.clipLBPointCanDrag = false
      this.clipRTPointCanDrag = false
      this.clipRBPointCanDrag = false
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
  transition: opacity 300ms;
  &:hover {
    opacity: 0.8;
  }
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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
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
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      border: 1px solid #eaeaea;
      background: #f5f7f9;
      border-radius: 9px;
      box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
      * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
      }
      .icon {
        font-size: 12px;
      }
      button {
        margin-left: 10px;
        font-size: 12px;
      }
      .main-btn {
        margin-top: 6px;
        &:nth-of-type(1) {
          margin-right: 7px;
        }
      }
      .menu {
        line-height: 38px;
        margin-left: 7px;
        button {
          margin-top: 0;
          background: transparent;
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
      border-radius: 2px;
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
        border-radius: 2px;
        border: 2px dashed #fff;
        resize: none;
        outline: none;
        user-select: none;
        &.disabled {
          text-align: center;
          cursor: pointer;
        }
        &.abled {
          text-align: left;
          cursor: text;
        }
      }
      .clipbox {
        position: absolute;
        cursor: pointer;
        border-style: dashed;
        border-color: #fff;
        border-radius: 2px;
        .clip-point {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 100%;
          background: #20a0ff;
          cursor: move;
          &:first-of-type {
            left: 0;
            top: 0;
            transform: translateX(-50%) translateY(-50%);
            cursor: move;
          }
          &:nth-of-type(2) {
            right: 0;
            top: 0;
            transform: translateX(50%) translateY(-50%);
          }
          &:nth-of-type(3) {
            bottom: 0;
            left: 0;
            transform: translateX(-50%) translateY(50%);
          }
          &:nth-of-type(4) {
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
