<template>
  <div id="image-editor" :style="imageEditorSty">
    <div class="toolbar-wrapper" :style="toolWrapperSty">
      <Func :sty='funcSty' @toggleText="toggleText" @toggleClip="toggleClip" @toggleBlur="toggleBlur" @toggleMosaic="toggleMosaic" @toggleFigure="toggleFigure" @toggleFilter="toggleFilter" @open="open" @demo="demo" @undo="undo" @restore="restore" @download="download" @reset="reset" />
      <div class="toolbar enhance text-enhance" :style="enhanceSty" v-show="showText">
        <div class="menu">
          <List :btns="textFmList" v-model="textFmNow" :show="showTextFmSelect"></List>
          <label>
            颜色
            <input type="text" readonly="true" @click="toggleColorPicker" :style="colorInputSty" class="color-picker-input" />
            <div class="color-picker" v-show="textShowColorPicker">
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
            <div class="color-picker" v-show="textShowShadowColorPicker">
              <color-picker v-model="shadowColors" @change-color="onShadowColorChange"></color-picker>
            </div>
          </label>
        </div>
      </div>
      <div class="toolbar enhance clip-enhance" :style="enhanceSty" v-show="showClip">
        <div class="menu">
          <button class="main-btn" @click="downloadClip">裁剪并导出</button>
          <List :btns="clipList" v-model="clipNow" :show="showClipSelect"></List>
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
      <div class="toolbar enhance blur-enhance" :style="enhanceSty" v-show="showBlur">
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
      <div class="toolbar enhance mosaic-enhance" :style="enhanceSty" v-show="showMosaic">
        <div class="menu">
          <List :btns="mosaicList" @change="mosaicSelect" v-model="mosaicNow" :show="showMosaicSelect"></List>
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
      <div class="toolbar enhance figure-enhance" :style="enhanceSty" v-show="showFigure">
        <div class="menu">
          <List :btns="figureList" v-model="figureNow" :show="showFigureSelect"></List>
          <label>
            颜色
            <input type="text" readonly="true" @click="toggleFigureColorPicker" :style="colorFigureInputSty" class="color-picker-input" />
            <div class="color-picker" v-show="figureShowShadowColorPicker">
              <color-picker v-model="figureColors" @change-color="onFigureColorChange"></color-picker>
            </div>
          </label>
          <label>
            不透明度
            <input type="number" v-model="figureAlpha" step="0.1" min="0" max="1" />
          </label>
          <label>
            水平
            <input type="number" v-model="figureL" />
          </label>
          <label>
            垂直
            <input type="number" v-model="figureT" />
          </label>
          <label>
            宽度
            <input type="number" v-model="figureW" />
          </label>
          <label>
            高度
            <input type="number" v-model="figureH" />
          </label>
        </div>
      </div>
      <div class="toolbar enhance filter-enhance" :style="enhanceSty" v-show="showFilter">
        <div class="menu">
          <List :btns="filterList" v-model="filterNow" :show="showFilterSelect" @change="filterSelect"></List>
        </div>
      </div>
    </div>
    <div class="panel" :style="editSty">
      <canvas :width="canvasW" :height="canvasH" ref="canvas"></canvas>
      <div class="mask" :style="editSty" @drop.prevent="drop" @click="maskClick">
        <Dropnotice :isShow="!canPaint" />
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" @keypress="textKeyPress" draggable="false" v-model="textText" ref="text"></textarea>
        <Box :show="showClip" :width="clipW" :height="clipH" :left="clipL" :top="clipT" :borderW="clipBorderW" :canvasW="canvasW" :canvasH="canvasH" :canDrag="clipCanDrag" :canvas="$refs.canvas" @change="boxChange">
          <div :style="clipSty"></div>
        </Box>
        <Box :show="showMosaic" :width="mosaicW" :height="mosaicH" :left="mosaicL" :top="mosaicT" :borderW="mosaicBorderW" :canvasW="canvasW" :canvasH="canvasH" :canDrag="mosaicCanDrag" :canvas="$refs.canvas" @change="mosaicChange">
          <div :style="mosaicSty"></div>
        </Box>
        <Box :show="showFigure" :width="figureW" :height="figureH" :left="figureL" :top="figureT" :borderW="figureBorderW" :canvasW="canvasW" :canvasH="canvasH" :canDrag="figureCanDrag" :canvas="$refs.canvas" @change="figureChange">
          <div :style="figureSty"></div>
        </Box>
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
import Func from './components/func.vue'
import Dropnotice from './components/drop-notice.vue'
import List from './components/select.vue'
import Box from './components/box.vue'
import {
  Chrome
}
from 'vue-color'
import Ctx from './ctx.js'

let DATA = {
  initData: null,
  timeMachine: [],
  nowStage: -1,
  ctx: null,
  mosaicCtx: null,
  beforeBlur: null,
  beforeFilter: null
}

export default {
  name: 'ImageEditor',

  props: ['width', 'height'],
  components: {
    'color-picker': Chrome,
    Func,
    Dropnotice,
    Box,
    List
  },
  data() {
    return {
      // init main style 
      toolWrapperMargin: 10,
      toolBarH: 40,
      enhanceBarH: 30,
      toolBarMargin: 10,
      minCanvasW: this.width,
      minCanvasH: this.height,
      canvasW: this.width,
      canvasH: this.height,
      maskOpacity: 0.5,

      // text style
      textL: 10,
      textT: 10,
      textW: 0,
      textFz: 22,
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

      // figure style 
      figureBorderW: 1,
      figureW: 200,
      figureH: 200,
      figureL: 10,
      figureT: 10,
      figureAlpha: 0.5,
      figureColors: {
        hex: "#9E4949"
      },

      // action state
      canPaint: false,
      showText: false,
      showClip: false,
      showBlur: false,
      showMosaic: false,
      showFigure: false,
      showFilter: false,

      //text state
      textContenteditable: false,
      textCanDrag: false,
      textInitText: '双击编辑',
      textText: '',
      textMinW: 100,
      textToPointer: null,
      textShowColorPicker: false,
      textShowShadowColorPicker: false,
      textFmList: [{
        name: '系统默认衬线字体',
        value: 'serif',
        idx: 0
      }, {
        name: '系统默认无衬线字体',
        value: 'sans-serif',
        idx: 1
      }],
      textFmNow: 0,
      showTextFmSelect: false,

      // clip state
      clipCanDrag: false,
      clipList: [{
        name: '矩形',
        idx: 0
      }, {
        name: '圆形',
        idx: 1
      }],
      clipNow: 0,
      showClipSelect: false,

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

      // figure state
      figureCanDrag: false,
      figureShowShadowColorPicker: false,
      figureList: [{
        name: '矩形',
        idx: 0
      }, {
        name: '圆形',
        idx: 1
      }],
      figureNow: 0,
      showFigureSelect: false,

      // filter state
      filterList: [{
        name: '无',
        idx: 0
      }, {
        name: 'blend',
        idx: 1
      }],
      filterNow: 0,
      showFilterSelect: false,

      // data url
      url: null,
      mosaicUrl: null,
    }
  },

  watch: {
    textFz(val, old) {
      let beyondW, beyondH
      this.textW = DATA.ctx.textW(
        this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyondW = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.minCanvasW
        beyondH = getElemOffset(this.$refs.canvas, this.$refs.text).top + parseFloat(this.textSty.height) - this.minCanvasH
        if (beyondW > 0 || beyondH > 0) {
          this.textFz = old
        }
      })
    },
    textFmNow(val, old) {
      let beyondW, beyondH
      this.textW = DATA.ctx.textW(
        this.textText, this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyondW = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.minCanvasW
        beyondH = getElemOffset(this.$refs.canvas, this.$refs.text).top + parseFloat(this.textSty.height) - this.minCanvasH
        if (beyondW > 0 || beyondH > 0) {
          this.textFmNow = old
        }
      })
    }
  },

  computed: {
    // style 
    // style outer
    imageEditorSty() {
      return {
        width: this.canvasW < this.minCanvasW ? this.minCanvasW + 'px' : this.canvasW + 'px',
        height: ((this.canvasH < this.minCanvasH ? this.minCanvasH : this.canvasH) + this.toolWrapperMargin + this.toolBarH + this.enhanceBarH + this.toolBarMargin) + 'px'
      }
    },

    toolWrapperSty() {
      return {
        height: this.toolBarH + this.enhanceBarH + this.toolBarMargin + 'px',
        marginBottom: this.canvasH < this.minCanvasH ? (this.minCanvasH - this.canvasH + this.toolWrapperMargin) / 2 + 'px' : this.toolWrapperMargin + 'px'
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
        height: this.textFz + this.textBorder * 2 + 'px',
        borderW: this.textBorder + 'px',
        fontSize: this.textFz + 'px',
        lineHeight: this.textFz + 'px',
        fontFamily: this.textFmList[this.textFmNow].value,
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
        backgroundImage: this.url == null ? 'none' : 'url(' + this.url + ')',
        backgroundPosition: (-this.clipL - this.clipBorderW) + 'px ' + (-this.clipT - this.clipBorderW) + 'px',
        borderRadius: this.clipNow == 0 ? '0' : '50%'
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
        backgroundImage: this.mosaicUrl == null ? 'none' : 'url(' + this.mosaicUrl + ')',
        backgroundPosition: (-this.mosaicL - this.mosaicBorderW) + 'px ' + (-this.mosaicT - this.mosaicBorderW) + 'px'
      }
    },

    figureSty() {
      return {
        width: this.figureW - this.figureBorderW * 2 + 'px',
        height: this.figureH - this.figureBorderW * 2 + 'px',
        backgroundColor: this.figureColors.hex,
        opacity: this.figureAlpha,
        borderRadius: this.figureNow == 0 ? '0' : '50%'
      }
    },

    colorFigureInputSty() {
      return {
        background: this.figureColors.hex
      }
    },

    // class
    // class text
    textCla() {
      return {
        hide: !this.showText,
        abled: this.textContenteditable,
        disabled: !this.textContenteditable
      }
    },
    // state
    blurRation() {
      return this.blurRangeW / this.blurMax
    }
  },

  methods: {
    // upload image
    init(file) {
      this.url = URL.createObjectURL(file)
      let img = new Image()
      img.onload = () => {
        this.canvasW = img.width
        this.canvasH = img.height
        this.$nextTick(function() {
          this.reset()
          this.canPaint = true
          DATA.ctx = new Ctx(this.$refs.canvas);
          DATA.ctx.put(img)
          DATA.initData = DATA.ctx.get()
        })
      }
      img.src = this.url
    },

    drop(e) {
      this.init(e.dataTransfer.files[0])
    },

    open(e) {
      this.init(e.target.files[0])
    },

    demo() {

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
      if (this.showFilter) {
        this.paintFilter()
      }
      if (this.showFigure) {
        this.paintFigure()
      }
      this.resetFunc()
      this.showText = true
      this.textText = this.textInitText
      this.textW = DATA.ctx.textW(this.textText, this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
    },

    textMouseDown(e) {
      this.textCanDrag = true
      this.textToPointer = getPointerToElem(e, this.$refs.text)
    },

    textDouble() {
      this.textContenteditable = true
      this.textText = ''
      this.textW = DATA.ctx.textW(this.textText, this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
    },

    textKeyPress(e) {
      if (e.key == 'Enter') e.preventDefault()
    },

    textInput() {
      let beyond, countWillRemove
      this.textW = DATA.ctx.textW(this.textText, this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyond = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.minCanvasW
        if (beyond > 0) {
          countWillRemove = Math.floor((beyond / (this.textW / this.textText.length)))
          this.textText = this.textText.slice(0, this.textText.length - countWillRemove - 1)
          this.textW = DATA.ctx.textW(this.textText, this.textFz, this.textFm, this.textMinW) + (this.textBorder * 2)
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
        let text = this.textText
        let l = this.textL + this.textBorder
        let t = this.textT + this.textBorder + this.textFz
        let color = this.textColors.hex
        let fz = this.textFz
        let fm = this.textFmList[this.textFmNow].value
        let alpha = this.textAlpha
        let shadowBlur = this.shadowBlur
        let shadowColor = this.shadowColors.hex
        let shadowX = this.shadowX
        let shadowY = this.shadowY
        DATA.ctx.text(text, l, t, color, fz, fm, alpha, shadowBlur, shadowColor, shadowX, shadowY)
        this.url = DATA.ctx.url()
        this.autoStage()
        DATA.timeMachine.push({
          type: 'text',
          detail: {
            l,
            t,
            text,
            color,
            fz,
            fm,
            alpha,
            shadowBlur,
            shadowColor,
            shadowX,
            shadowY
          }
        })
        DATA.nowStage++
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
      this.textFmNow = 0
      this.textShowColorPicker = false
      this.shadowY = 0
      this.shadowX = 0
      this.shadowBlur = 0
      this.textAlpha = 1
    },

    // clip
    toggleClip() {
      if (!this.canPaint) return false
      this.url = DATA.ctx.url()
      if (this.showMosaic) {
        this.paintMosaic()
      }
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      if (this.showFigure) {
        this.paintFigure()
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
      if (this.clipNow == 0) {
        DATA.ctx.downloadRect(this.clipL, this.clipT, this.clipW, this.clipH)
      }
      if (this.clipNow == 1) {
        DATA.ctx.downloadArc(this.clipW, this.clipH, this.clipL, this.clipT)
      }
    },

    resetClip() {
      this.showClip = false
      this.clipL = 10
      this.clipT = 10
      this.clipW = 200
      this.clipH = 200
      this.clipNow = 0
      this.showClipSelect = false
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
      if (this.showFigure) {
        this.paintFigure()
      }
      this.resetFunc()
      this.showBlur = true
      DATA.beforeBlur = DATA.ctx.get()
    },

    blurInput(e) {
      let r = Math.floor(e.target.value / this.blurRation)
      let coped = copy(DATA.beforeBlur)
      DATA.ctx.put(coped)
      DATA.ctx.blur(r)
    },

    paintBlur() {
      this.url = DATA.ctx.url()
      this.autoStage()
      DATA.timeMachine.push({
        type: 'blur',
        detail: {
          r: Math.floor(this.blur / this.blurRation)
        }
      })
      DATA.nowStage++
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
      if (this.showFigure) {
        this.paintFigure()
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
      DATA.mosaicCtx = new Ctx(canvas)
      DATA.mosaicCtx.put(DATA.ctx.get())
      DATA.mosaicCtx.mosaic(value)
      this.mosaicUrl = DATA.mosaicCtx.url()
    },

    mosaicSelect() {
      this.setMosaic(this.mosaicList[this.mosaicNow].value)
    },

    paintMosaic() {
      let v = this.mosaicList[this.mosaicNow].value
      let l = this.mosaicL
      let t = this.mosaicT
      let w = this.mosaicW
      let h = this.mosaicH
      DATA.ctx.mosaic(v, l, t, w, h)
      this.url = DATA.ctx.url()
      this.autoStage()
      DATA.timeMachine.push({
        type: 'mosaic',
        detail: {
          l,
          t,
          w,
          h,
          v
        }
      })
      DATA.nowStage++
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

    toggleFigure() {
      if (!this.canPaint) return false
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      if (this.showMosaic) {
        this.paintMosaic()
      }
      this.resetFunc()
      this.showFigure = true
    },

    toggleFigureColorPicker() {
      this.figureShowShadowColorPicker = !this.figureShowShadowColorPicker
    },

    onFigureColorChange(val) {
      this.figureColors.hex = val.hex
    },

    figureChange(status) {
      this.figureW = status.width
      this.figureH = status.height
      this.figureL = status.left
      this.figureT = status.top
    },

    paintFigure() {
      this.autoStage()
      let color = this.figureColors.hex
      let alpha = this.figureAlpha
      if (this.figureNow == 0) {
        let l = this.figureL
        let t = this.figureT
        let w = this.figureW
        let h = this.figureH
        DATA.ctx.rect(l, t, w, h, color, alpha)
        DATA.timeMachine.push({
          type: 'rect',
          detail: {
            t,
            l,
            w,
            h,
            color,
            alpha
          }
        })
      } else {
        let x = this.figureL + this.figureW / 2
        let y = this.figureT + this.figureH / 2
        let a = this.figureW / 2
        let b = this.figureH / 2
        DATA.ctx.arc(x, y, a, b, color, alpha)
        DATA.timeMachine.push({
          type: 'arc',
          detail: {
            x,
            y,
            a,
            b,
            color,
            alpha,
          }
        })
      }
      DATA.nowStage++
    },

    resetFigure() {
      this.showFigure = false
      this.figureL = 10
      this.figureT = 10
      this.figureW = 200
      this.figureH = 200
      this.figureNow = 0
      this.showFigureSelect = false
      this.figureAlpha = 0.5
      this.figureColors.hex = '#9E4949'
    },

    // filter
    toggleFilter() {
      if (!this.canPaint) return false
      if (this.showText && this.textContenteditable) {
        this.paintText()
      }
      if (this.showBlur) {
        this.paintBlur()
      }
      if (this.showFigure) {
        this.paintFigure()
      }
      if (this.showMosaic) {
        this.paintMosaic()
      }
      this.resetFunc()
      this.showFilter = true
      DATA.beforeFilter = DATA.ctx.get()
    },

    paintFilter() {
      this.url = DATA.ctx.url()
      this.autoStage()
      let name = this.filterList[this.filterNow].name
      DATA.timeMachine.push({
        type: 'filter',
        detail: {
          name
        }
      })
      DATA.nowStage++
    },

    resetFilter() {
      this.showFilter = false
      this.filterNow = 0
    },

    filterSelect() {
      let coped
      coped = copy(DATA.beforeFilter)
      if (this.filterNow == 0) {
        DATA.ctx.put(DATA.beforeFilter)
      }
      if (this.filterNow == 1) {
        DATA.ctx.put(coped)
        DATA.ctx.blend()
      }
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
      if (this.showFigure) {
        this.paintFigure()
        this.resetFigure()
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
      if (this.showFigure) {
        this.resetFigure()
      }
      if (this.showFilter) {
        this.resetFilter()
      }
    },

    autoStage() {
      if ((DATA.timeMachine.length - DATA.nowStage) !== 1) {
        let popCount = DATA.timeMachine.length - 1 - DATA.nowStage
        let i
        for (i = 0; i < popCount; i++) {
          DATA.timeMachine.pop()
        }
      }
    },

    undo() {
      let i
      if (this.showBlur) {
        DATA.ctx.put(DATA.beforeBlur)
      }
      if (this.showFilter) {
        DATA.ctx.put(DATA.beforeFilter)
      }
      if (this.showText || this.showClip || this.showBlur || this.showMosaic || this.showFigure || this.showFilter) {
        this.resetFunc()
        return
      }
      if (DATA.nowStage == -1) {
        return
      } else {
        this.resetFunc()
        DATA.ctx.put(DATA.initData)
        DATA.nowStage--;
        for (i = 0; i <= DATA.nowStage; i++) {
          this.repaint(DATA.timeMachine[i])
        }
        this.url = DATA.ctx.url()
      }
    },

    restore() {
      if (DATA.nowStage + 1 == DATA.timeMachine.length) return
      DATA.nowStage++;
      this.repaint(DATA.timeMachine[DATA.nowStage])
      this.url = DATA.ctx.url()
    },

    repaint(stage) {
      let type = stage.type
      let detail = stage.detail
      if (type == 'text') {
        DATA.ctx.text(detail.text, detail.l, detail.t, detail.color, detail.fz, detail.fm, detail.alpha, detail.shadowBlur, detail.shadowColor, detail.shadowX, detail.shadowY)
      }
      if (type == 'blur') {
        DATA.ctx.blur(detail.r)
      }
      if (type == 'filter') {
        DATA.ctx[detail.name]()
      }
      if (type == 'mosaic') {
        DATA.ctx.mosaic(detail.v, detail.l, detail.t, detail.w, detail.h)
      }
      if (type == 'rect') {
        DATA.ctx.rect(detail.l, detail.t, detail.w, detail.h, detail.color, detail.alpha)
      }
      if (type == 'arc') {
        DATA.ctx.arc(detail.x, detail.y, detail.a, detail.b, detail.color, detail.alpha)
      }
    },

    reset() {
      if (!this.canPaint) return false
      this.resetFunc()
      DATA.ctx.put(DATA.initData)
      DATA.mosaicCtx = null
      this.url = null
      this.mosaicUrl = null
      DATA.beforeBlur = null
      DATA.beforeFilter = null
      DATA.timeMachine = []
      DATA.nowStage = -1
    },

    download() {
      if (!this.canPaint) return false
      if (this.showMosaic) {
        this.paintMosaic()
      }
      DATA.ctx.download()
    }
  },

  mounted() {
    let d = document
    let offset, left, top;

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
