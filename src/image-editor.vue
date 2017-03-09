<template>
  <div id="image-editor" :style="imageEditorSty">
    <a id="download-link" class="hide"></a>
    <div class="toolbar-wrapper" :style="toolWrapperSty">
      <div class="toolbar funcbar" :style="funcSty">
        <div class="menu">
          <a @click="toggleText"><i class="icon icon-text"></i>文本</a>
          <a @click="toggleClip"><i class="icon icon-clip"></i>裁剪</a>
          <a @click="toggleBlur"><i class="icon icon-blur"></i>模糊</a>
          <a @click="toggleMosaic"><i class="icon icon-mosaic"></i>马赛克</a>
          <a @click="toggleFigure"><i class="icon icon-figure"></i>图形</a>
          <a @click="toggleFilter"><i class="icon icon-filter"></i>滤镜</a>
        </div>
        <a class="main-btn download" @click="download">导出</a>
        <a class="main-btn reset" @click="reset">重置</a>
        <a class="main-btn restore" @click="stage('restore')"><i class="icon icon-restore"></i></a>
        <a class="main-btn undo" @click="stage('undo')"><i class="icon icon-undo"></i></a>
        <a class="main-btn demo" @click="demo">使用示例图片</a>
        <label class="main-btn open">打开
          <input type="file" style="visibility:hidden;display:block;width:1;height:0" @change="open">
        </label>
      </div>
      <div class="toolbar enhance text-enhance" :style="enhanceSty" v-show="showText">
        <div class="menu">
          <List :btns="textFmList" v-model="textFmNow"></List>
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
          <a class="main-btn" @click="downloadClip">裁剪并导出</a>
          <List :btns="clipList" v-model="clipNow"></List>
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
          <List :btns="mosaicList" @change="mosaicSelect" v-model="mosaicNow"></List>
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
          <List :btns="figureList" v-model="figureNow"></List>
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
          <List :btns="filterList" v-model="filterNow" @change="filterSelect"></List>
        </div>
      </div>
    </div>
    <div class="panel" :style="editSty">
      <canvas :width="canvasW" :height="canvasH" ref="canvas"></canvas>
      <div class="mask" :style="editSty" @drop.prevent="drop" @click="maskClick">
        <div v-show="!canPaint" class="drop-notice">
          <i class="icon icon-drop"></i>
          <p>拖放图片到此</p>
        </div>
        <textarea :class="textCla" class="textarea" :style="textSty" :readonly="!textContenteditable" @mousedown="textMouseDown" @dblclick="textDouble" @input="textInput" draggable="false" ref="text" v-model="textText"></textarea>
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
  maxLenOfStrings,
  copy
}
from './libs/utils.js'
import Ctx from './libs/Ctx.js'
import TimeMachine from './libs/TimeMachine.js'

import List from './components/select.vue'
import Box from './components/box.vue'
import {
  Chrome
}
from 'vue-color'

import demoImg from './assert/img.png'
import fmList from './configs/fm-list.json'
import figureList from './configs/figure-list.json'
import clipList from './configs/clip-list.json'
import mosaicList from './configs/mosaic-list.json'
import filterList from './configs/filter-list.json'

let DATA = {
  timeMachine: null,
  ctx: null,
  mosaicCtx: null,
  beforeBlur: null,
  beforeFilter: null
}

export default {
  name: 'ImageEditor',

  props: ['minWidth', 'maxWidth'],
  components: {
    'color-picker': Chrome,
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
      minCanvasW: this.minWidth,
      minCanvasH: 500,
      canvasW: this.minWidth,
      canvasH: 500,
      maskOpacity: 0.5,
      maxCanvasW: this.maxWidth,

      // text style
      textL: 10,
      textT: 10,
      textW: 0,
      textFz: 28,
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
      textTextGroup: [],
      textText: '双击编辑',
      textMinW: 130,
      textToPointer: null,
      textShowColorPicker: false,
      textShowShadowColorPicker: false,
      textFmList: fmList,
      textFmNow: 0,
      textLine: 1,

      // clip state
      clipCanDrag: false,
      clipList: clipList,
      clipNow: 0,

      // blur state
      blur: 0,
      blurRangeW: 100,
      blurMax: 10,

      // mosaic state
      mosaicCanDrag: false,
      mosaicList: mosaicList,
      mosaicNow: 0,

      // figure state
      figureCanDrag: false,
      figureShowShadowColorPicker: false,
      figureList: figureList,
      figureNow: 0,

      // filter state
      filterList: filterList,
      filterNow: 0,

      // data url
      url: null,
      mosaicUrl: null,
    }
  },

  watch: {
    textFz(val, old) {
      this.backToOld(val, old, 'fz')
    },

    textFmNow(val, old) {
      this.backToOld(val, old, 'fm')
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
        height: this.textTextGroup.length > 0 ? (Number(this.textFz) * this.textTextGroup.length + this.textBorder * 2) + 'px' : (Number(this.textFz) + this.textBorder * 2) + 'px',
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
    init(url) {
      let img = new Image()
      img.crossOrigin = "Anonymous";
      let natureW, natureH, scale = 1
      img.onload = () => {
        natureW = img.width
        natureH = img.height
        if (natureW > this.maxCanvasW) scale = natureW / this.maxCanvasW
        this.canvasW = natureW / scale
        this.canvasH = natureH / scale
        this.$nextTick(function() {
          DATA.ctx = new Ctx(this.$refs.canvas);
          DATA.ctx.ctx.save()
          DATA.ctx.ctx.scale(1 / scale, 1 / scale);
          DATA.ctx.put(img)
          DATA.ctx.ctx.restore()
          DATA.timeMachine = new TimeMachine(DATA.ctx)
          DATA.timeMachine.add()
          this.reset()
          this.canPaint = true
        })
      }
      img.src = url
    },

    drop(e) {
      let url = URL.createObjectURL(e.dataTransfer.files[0])
      this.init(url)
    },

    open(e) {
      let url = URL.createObjectURL(e.target.files[0])
      this.init(url)
    },

    demo() {
      this.init(demoImg)
    },

    // text
    toggleText() {
      if (!this.canPaint) return false
      if (this.showMosaic) this.paintMosaic()
      if (this.showBlur) this.paintBlur()
      if (this.showFilter) this.paintFilter()
      if (this.showFigure) this.paintFigure()
      this.resetFunc()
      this.showText = true
      this.textW = DATA.ctx.textW(maxLenOfStrings(this.textTextGroup), this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
    },

    textMouseDown(e) {
      this.textCanDrag = true
      this.textToPointer = getPointerToElem(e, this.$refs.text)
    },

    textDouble() {
      this.textContenteditable = true
      this.textTextGroup = []
      this.textText = ''
      this.textW = DATA.ctx.textW(maxLenOfStrings(this.textTextGroup), this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
    },

    textInput() {
      let beyond, maxString
      this.textTextGroup = this.textText.split('\n')
      maxString = maxLenOfStrings(this.textTextGroup)
      this.textW = DATA.ctx.textW(maxString, this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
    },

    backToOld(val, old, type) {
      let beyondW, beyondH
      this.textW = DATA.ctx.textW(maxLenOfStrings(this.textTextGroup), this.textFz, this.textFmList[this.textFmNow].value, this.textMinW) + (this.textBorder * 2)
      this.$nextTick(function() {
        beyondW = getElemOffset(this.$refs.canvas, this.$refs.text).left + this.textW - this.canvasW
        beyondH = getElemOffset(this.$refs.canvas, this.$refs.text).top + parseFloat(this.textSty.height) - this.canvasH
        if (beyondW > 0 || beyondH > 0) {
          if (type == 'fz') {
            this.textFz = old
          }
          if (type == 'fm') {
            this.textFmNow = old
          }
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
        let l = this.textL + this.textBorder
        let t = this.textT + this.textBorder + Number(this.textFz)
        let color = this.textColors.hex
        let fz = Number(this.textFz)
        let fm = this.textFmList[this.textFmNow].value
        let alpha = this.textAlpha
        let shadowBlur = this.shadowBlur
        let shadowColor = this.shadowColors.hex
        let shadowX = this.shadowX
        let shadowY = this.shadowY
        let i
        for (i = 0; i < this.textTextGroup.length; i++) {
          DATA.ctx.text(this.textTextGroup[i], l, t + i * Number(this.textFz), color, fz, fm, alpha, shadowBlur, shadowColor, shadowX, shadowY)
        }
        this.url = DATA.ctx.url()
        DATA.timeMachine.add()
      }
    },

    resetText() {
      this.showText = false
      this.textContenteditable = false
      this.textTextGroup = []
      this.textText = '双击编辑'
      this.textL = 10
      this.textT = 10
      this.textColors.hex = '#ffffff'
      this.shadowColors.hex = '#000000'
      this.textFz = 28
      this.textFmNow = 0
      this.textShowColorPicker = false
      this.shadowY = 0
      this.shadowX = 0
      this.shadowBlur = 0
      this.textAlpha = 1
      this.textLine = 1
    },

    // clip
    toggleClip() {
      if (!this.canPaint) return false
      this.url = DATA.ctx.url()
      if (this.showMosaic) this.paintMosaic()
      if (this.showText && this.textContenteditable) this.paintText()
      if (this.showBlur) this.paintBlur()
      if (this.showFigure) this.paintFigure()
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
      if (this.clipNow == 0) DATA.ctx.downloadRect(this.clipL, this.clipT, this.clipW, this.clipH)
      if (this.clipNow == 1) DATA.ctx.downloadArc(this.clipW, this.clipH, this.clipL, this.clipT)
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
      if (this.showMosaic) this.paintMosaic()
      if (this.showText && this.textContenteditable) this.paintText()
      if (this.showFigure) this.paintFigure()
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
      DATA.timeMachine.add()
    },

    resetBlur() {
      this.showBlur = false
      this.blur = 0
    },

    // mosaic
    toggleMosaic() {
      if (!this.canPaint) return false
      if (this.showText && this.textContenteditable) this.paintText()
      if (this.showBlur) this.paintBlur()
      if (this.showFigure) this.paintFigure()
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
      DATA.ctx.mosaic(this.mosaicList[this.mosaicNow].value, this.mosaicL, this.mosaicT, this.mosaicW, this.mosaicH)
      DATA.timeMachine.add()
      this.url = DATA.ctx.url()
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
      if (this.showText && this.textContenteditable) this.paintText()
      if (this.showBlur) this.paintBlur()
      if (this.showMosaic) this.paintMosaic()
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
      let color = this.figureColors.hex
      let alpha = this.figureAlpha
      if (this.figureNow == 0) {
        DATA.ctx.rect(this.figureL, this.figureT, this.figureW, this.figureH, color, alpha)
      } else {
        DATA.ctx.arc(this.figureL + this.figureW / 2, this.figureT + this.figureH / 2, this.figureW / 2, this.figureH / 2, color, alpha)
      }
      DATA.timeMachine.add()
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
      if (this.showText && this.textContenteditable) this.paintText()
      if (this.showBlur) this.paintBlur()
      if (this.showFigure) this.paintFigure()
      if (this.showMosaic) this.paintMosaic()
      this.resetFunc()
      this.showFilter = true
      DATA.beforeFilter = DATA.ctx.get()
    },

    paintFilter() {
      this.url = DATA.ctx.url()
      DATA.timeMachine.add()
    },

    resetFilter() {
      this.showFilter = false
      this.filterNow = 0
    },

    filterSelect() {
      let coped
      this.$nextTick(function() {
        coped = copy(DATA.beforeFilter)
        if (this.filterNow == 0) {
          DATA.ctx.put(DATA.beforeFilter)
        } else {
          DATA.ctx.put(coped)
          DATA.ctx[this.filterList[this.filterNow].name]()
        }
      })
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
      if (this.showText) this.resetText()
      if (this.showClip) this.resetClip()
      if (this.showBlur) this.resetBlur()
      if (this.showMosaic) this.resetMosaic()
      if (this.showFigure) this.resetFigure()
      if (this.showFilter) this.resetFilter()
    },

    stage(name) {
      if (!this.canPaint) return false
      if (this.showBlur) DATA.ctx.put(DATA.beforeBlur)
      if (this.showFilter) DATA.ctx.put(DATA.beforeFilter)
      if (this.showText || this.showClip || this.showBlur || this.showMosaic || this.showFigure || this.showFilter) {
        this.resetFunc()
        return
      }
      if (name == 'undo') {
        DATA.ctx.put(DATA.timeMachine.undo())
      } else {
        DATA.ctx.put(DATA.timeMachine.restore())
      }
    },

    reset() {
      if (!this.canPaint) return false
      this.resetFunc()
      this.url = null
      this.mosaicUrl = null
      DATA.ctx.put(DATA.timeMachine.init())
      DATA.timeMachine.reset()
      DATA.mosaicCtx = null
      DATA.beforeBlur = null
      DATA.beforeFilter = null
    },

    download() {
      if (!this.canPaint) return false
      if (this.showMosaic) this.paintMosaic()
      if (this.showFigure) this.paintFigure()
      DATA.ctx.downloadRect()
    }
  },

  mounted() {
    let d = document
    let offset, left, top, moveT, moveL;

    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => document.body.addEventListener(name, (e) => e.preventDefault()))

    d.addEventListener('mousemove', (e) => {
      if (this.textCanDrag) {
        offset = getPointerToElem(e, this.$refs.canvas)
        left = offset.left - this.textToPointer.left
        top = offset.top - this.textToPointer.top
        moveL = this.canvasW - parseFloat(this.textSty.width)
        moveT = this.canvasH - parseFloat(this.textSty.height)
        if (left >= 0 && left <= moveL) {
          this.textL = left
        } else {
          if (left < 0) {
            this.textL = 0
          } else {
            this.textL = moveL
          }
        }
        if (top >= 0 && top <= moveT) {
          this.textT = top
        } else {
          if (top < 0) {
            this.textT = 0
          } else {
            this.textT = moveT
          }
        }
      }
    })

    d.addEventListener('mouseup', () => {
      this.textCanDrag = false
    })
  }
}
</script>
