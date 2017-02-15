<template>
  <div id="image-editor" :style="imageEditorSty">
    <div class="toolbar-wrapper" :style="toolWrapperSty">
      <funcbar :sty='funcSty' @toggleText="toggleText" @toggleClip="toggleClip" @toggleBlur="toggleBlur" @toggleMosaic="toggleMosaic" @download="download" @reset="reset" />
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
            阴影模糊半径
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
          <button class="main-btn" @click="downloadClip">裁剪并导出</button>
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
      <div class="toolbar enhance blur-enhance" :style="enhanceSty" :class="blurEnhanceCla">
        <div class="menu">
          <label>
            模糊度
          </label>
        </div>
        <div class="menu">
          <label>
            <input type="range" class="blur-input" :style="blurRangeSty" v-model="blur" @input="blurInput" />
          </label>
        </div>
      </div>
      <div class="toolbar enhance mosaic-enhance" :style="enhanceSty" :class="mosaicEnhanceCla">
        <div class="menu">
          <list :btns="mosaicList" @change="mosaicSelect" v-model="mosaicNow" :show="showMosaicSelect"></list>
          <label>
            水平
            <input type="number" v-model="mosaicL" />
          </label>
          <label>
            垂直
            <input type="number" v-model="mosaicT" />
          </label>
          <label>
            宽度
            <input type="number" v-model="mosaicW" />
          </label>
          <label>
            高度
            <input type="number" v-model="mosaicH" />
          </label>
        </div>
      </div>
    </div>
    <div class="panel" :style="editSty">
      <canvas :width="canvasW" :height="canvasH" ref="canvas"></canvas>
      <div class="mask" :style="editSty" @drop.prevent="drop" @click="maskClick">
        <dropnotice :isShow="!canPaint" />
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" @keypress="textKeyPress" draggable="false" v-model="textText" ref="text"></textarea>
        <box :show="showClip" :width="clipW" :height="clipH" :left="clipL" :top="clipT" :borderW="clipBorderW" :canvasW="canvasW" :canvasH="canvasH" :canDrag="clipCanDrag" :canvas="$refs.canvas" @change="boxChange">
          <div :style="clipSty"></div>
        </box>
        <box :show="showMosaic" :width="mosaicW" :height="mosaicH" :left="mosaicL" :top="mosaicT" :borderW="mosaicBorderW" :canvasW="canvasW" :canvasH="canvasH" :canDrag="mosaicCanDrag" :canvas="$refs.canvas" @change="mosaicChange">
          <div :style="mosaicSty"></div>
        </box>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getElemOffset,
  getPointerToElem,
  copy
}
from './utils.js'
import funcbar from './components/func.vue'
import dropnotice from './components/drop-notice.vue'
import list from './components/select.vue'
import box from './components/box.vue'
import {
  Chrome
}
from 'vue-color'
import ctx from './ctx.js'

export default {
  name: 'image-editor',

  props: ['width', 'height'],
  components: {
    'color-picker': Chrome,
    funcbar,
    dropnotice,
    box,
    list
  },
  data() {
    return {
      // init main style 
      toolWrapperMargin: 10,
      toolBarH: 40,
      enhanceBarH: 30,
      toolBarMargin: 10,
      canvasW: this.width,
      canvasH: this.height,
      maskOpacity: 0.5,

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

      // mosaic style 
      mosaicBorderW: 1,
      mosaicW: 200,
      mosaicH: 200,
      mosaicL: 10,
      mosaicT: 10,

      // action state
      canPaint: false,
      showText: false,
      showClip: false,
      showBlur: false,
      showMosaic: false,

      //text state
      textContenteditable: false,
      textCanDrag: false,
      textInitText: '双击编辑',
      textText: '',
      textMinW: 100,
      textToPointer: null,
      textShowColorPicker: false,
      textShowShadowColorPicker: false,

      // clip state
      clipCanDrag: false,

      // blur state
      blur: 0,
      blurRangeW: 100,
      blurMax: 10,

      // mosaic state
      mosaicCanDrag: false,
      mosaicList: [{
        name: '轻度',
        value: 5,
        idx: 0
      }, {
        name: '重度',
        value: 10,
        idx: 1
      }],
      mosaicNow: 0,
      showMosaicSelect: false,

      // data
      initData: null,
      ctx: null,
      mosaicCtx: null,
      url: null,
      mosaicUrl: null,
      beforeBlur: null
    }
  },

  watch: {
    textFz(val, old) {
      let beyondW, beyondH
      this.textW = this.ctx.textW(
        this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
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
        width: this.canvasW + 'px',
        height: (this.canvasH + this.toolWrapperMargin + this.toolBarH + this.enhanceBarH + this.toolBarMargin) + 'px'
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
        width: this.canvasW + 'px',
        height: this.canvasH + 'px',
        backgroundColor: (this.showClip) ? 'rgba(0,0,0,' + this.maskOpacity + ')' : 'transparent'
      }
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
        width: this.clipW - this.clipBorderW * 2 + 'px',
        height: this.clipH - this.clipBorderW * 2 + 'px',
        backgroundImage: this.url === null ? 'none' : 'url(' + this.url + ')',
        backgroundPosition: (-this.clipL - this.clipBorderW) + 'px ' + (-this.clipT - this.clipBorderW) + 'px'
      }
    },

    blurRangeSty() {
      return {
        width: this.blurRangeW + 'px'
      }
    },

    mosaicSty() {
      return {
        width: this.mosaicW - this.mosaicBorderW * 2 + 'px',
        height: this.mosaicH - this.mosaicBorderW * 2 + 'px',
        backgroundImage: this.mosaicUrl === null ? 'none' : 'url(' + this.mosaicUrl + ')',
        backgroundPosition: (-this.mosaicL - this.mosaicBorderW) + 'px ' + (-this.mosaicT - this.mosaicBorderW) + 'px'
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
        disabled: !this.textContenteditable
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
    },

    blurEnhanceCla() {
      return {
        hide: !this.showBlur
      }
    },

    mosaicEnhanceCla() {
      return {
        hide: !this.showMosaic
      }
    },
    // state
    blurRation() {
      return this.blurRangeW / this.blurMax
    }
  },

  methods: {
    // upload image
    drop(e) {
      if (this.canPaint) return false
      let file, img
      file = e.dataTransfer.files[0]
      this.url = URL.createObjectURL(file)
      img = new Image()
      img.onload = () => {
        this.canvasW = img.width
        this.canvasH = img.height
        this.$nextTick(function() {
          this.canPaint = true
          this.ctx = new ctx(this.$refs.canvas);
          this.ctx.put(img)
          this.initData = this.ctx.get()
        })
      }
      img.src = this.url
    },

    // text
    toggleText() {
      if (!this.canPaint) return false
      if (this.showMosaic) {
        this.paintMosaic()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      this.resetFunc()
      this.showText = true
      this.textText = this.textInitText
      this.textW = this.ctx.textW(this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
    },

    textMouseDown(e) {
      this.textCanDrag = true
      this.textToPointer = getPointerToElem(e, this.$refs.text)
    },

    textDouble() {
      this.textContenteditable = true
      this.textText = ''
      this.textW = this.ctx.textW(this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
    },

    textKeyPress(e) {
      if (e.key == 'Enter') e.preventDefault()
    },

    textInput() {
      let beyond, countWillRemove
      this.textW = this.textW = this.ctx.textW(this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyond = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.canvasW
        if (beyond > 0) {
          countWillRemove = Math.floor((beyond / (this.textW / this.textText.length)))
          this.textText = this.textText.slice(0, this.textText.length - countWillRemove - 1)
          this.textW = this.ctx.textW(this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
        }
      })
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

    paintText() {
      if (this.textContenteditable) {
        let left = this.textL + this.textBorder
        let top = this.textT + this.textBorder + this.textFz
        this.ctx.text(this.textText, left, top, this.textColors.hex, this.textFz, this.textFm, this.textAlpha, this.shadowBlur, this.shadowColors.hex, this.shadowX, this.shadowY)
        this.url = this.ctx.url()
      }
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
      this.url = this.ctx.url()
      if (this.showMosaic) {
        this.paintMosaic()
      }
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      this.resetFunc()
      this.showClip = true
    },

    boxChange(status) {
      this.clipW = status.width
      this.clipH = status.height
      this.clipL = status.left
      this.clipT = status.top
    },

    downloadClip() {
      this.ctx.download(this.clipL, this.clipT, this.clipW, this.clipH)
    },

    resetClip() {
      this.showClip = false
      this.clipL = 10
      this.clipT = 10
      this.clipW = 200
      this.clipH = 200
    },

    // blur
    toggleBlur() {
      if (!this.canPaint) return false
      if (this.showMosaic) {
        this.paintMosaic()
      }
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      this.resetFunc()
      this.showBlur = true
      this.beforeBlur = this.ctx.get()
    },

    blurInput(e) {
      let r = Math.floor(e.target.value / this.blurRation)
      let coped = copy(this.beforeBlur)
      this.ctx.put(coped)
      this.ctx.blur(r)
    },

    paintBlur() {
      this.url = this.ctx.url()
    },

    resetBlur() {
      this.showBlur = false
      this.blur = 0
    },

    // mosaic
    toggleMosaic() {
      if (!this.canPaint) return false
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      this.resetFunc()
      this.showMosaic = true
      this.setMosaic(this.mosaicList[this.mosaicNow].value)
    },

    mosaicChange(status) {
      this.mosaicW = status.width
      this.mosaicH = status.height
      this.mosaicL = status.left
      this.mosaicT = status.top
    },

    setMosaic(value) {
      let canvas = document.createElement('canvas')
      canvas.width = this.canvasW
      canvas.height = this.canvasH
      this.mosaicCtx = new ctx(canvas)
      this.mosaicCtx.put(this.ctx.get())
      this.mosaicCtx.mosaic(value)
      this.mosaicUrl = this.mosaicCtx.url()
    },

    mosaicSelect() {
      this.setMosaic(this.mosaicList[this.mosaicNow].value)
    },

    paintMosaic() {
      this.ctx.mosaic(this.mosaicList[this.mosaicNow].value, this.mosaicL, this.mosaicT, this.mosaicW, this.mosaicH)
      this.url = this.ctx.url()
    },

    resetMosaic() {
      this.showMosaic = false
      this.mosaicL = 10
      this.mosaicT = 10
      this.mosaicW = 200
      this.mosaicH = 200
      this.mosaicNow = 0
      this.showMosaicSelect = false
    },

    // mask
    maskClick(e) {
      if (e.target.className !== 'mask') return false
      if (this.showText) {
        this.paintText()
        this.resetText()
      }
      if (this.showMosaic) {
        this.paintMosaic()
        this.resetMosaic()
      }
    },

    // reset and download
    resetFunc() {
      if (this.showText) {
        this.resetText()
      }
      if (this.showClip) {
        this.resetClip()
      }
      if (this.showBlur) {
        this.resetBlur()
      }
      if (this.showMosaic) {
        this.resetMosaic()
      }
    },

    reset() {
      if (!this.canPaint) return false
      this.resetFunc()
      this.ctx.put(this.initData)
      this.mosaicCtx = null
      this.url = null
      this.mosaicUrl = null
      this.beforeBlur = null
    },

    download() {
      if (!this.canPaint) return false
      if (showMosaic) {
        this.paintMosaic()
      }
      this.ctx.download()
    }
  },

  mounted() {
    let d = document
    let offset, left, top

      ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => document.body.addEventListener(name, (e) => e.preventDefault()))

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
      }
    })

    d.addEventListener('mouseup', () => {
      this.textCanDrag = false
    })
  }
}
</script>
<style lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 10px;
  width: 10px;
  border-radius: 100%;
  background: #20a0ff;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type=range] {
  -webkit-appearance: none;
  height: 0;
  background: #20a0ff;
}

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

.select {
  position: relative;
  display: inline-block;
  height: 30px;
  width: 100px;
  text-align: center;
  * {
    margin: 0;
    padding: 0;
  }
  button {
    display: block;
    background: #f5f6fa;
    color: #747272;
    width: 100%;
    height: 30px;
    &:hover {
      opacity: 1
    }
    .icon {
      position: absolute;
    }
  }
  div {
    position: absolute;
    z-index: 100;
    top: 30px;
    left: 0;
    width: 100px;
    button {
      &:last-of-type {
        border-radius: 0 0 6px 6px;
      }
    }
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
        font-size: 13px;
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
      line-height: 30px;
      input.clip-input {
        width: 50px;
      }
    }
    .toolbar.blur-enhance {
      .menu:first-of-type {
        line-height: 30px;
      }
      .menu:nth-of-type(2) {
        line-height: 27px;
        input.blur-input {
          box-shadow: none;
        }
      }
    }
    .toolbar.blur-enhance {
      .menu {
        line-height: 30px;
      }
    }
    .toolbar.mosaic-enhance {
      .menu {
        line-height: 30px;
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
          cursor: -webkit-grab;
        }
        &.abled {
          text-align: left;
          cursor: text;
        }
      }
      .box {
        position: absolute;
        cursor: pointer;
        cursor: -webkit-grab;
        border-style: dashed;
        border-color: #fff;
        border-radius: 2px;
        .point {
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
