<template>
	<div id="image-editor" :style="outerStyObj">
    
    <div class="toolbar-wrapper" style="height:50px;margin-bottom:20px;">
      <div class="toolbar" style="height:20px;margin-bottom:10px">
        <div class="menu">
          <button @click="inputText"><i class="icon">&#xe633;</i></button>
         <button><i class="icon">&#xe600;</i></button>
       </div> 
       <button class="main-btn download" @click="download">导出</button>
       <button class="main-btn reset" @click="reset">重置</button>
     </div>
      <div class="toolbar enhance text-enhance" style="height:30px" :class="textEnhanceClassObj">
        <div class="menu">
        </div> 
      </div>
    </div>

		<div class="panel" :style="panelStyObj">
			<canvas :width="canvasWidth" :height="canvasHeight"></canvas>
			<div class="mask" :style="maskStyObj" @drop="drop" @dragover="dragover" @click="maskClick">
        <div :class="dropNoticeClassObj" class="drop-notice">
          <i class="icon drop-icon">&#xe624;</i>
          <p>拖放图片到此</p>
        </div>
        <textarea :class="textAreaClassObj" class="textarea" :style="textAreaStyObj" :readonly="!contenteditable" @mousedown="textAreaMouseDown" @dblclick="textAreaDouble" @input="textAreaInput" @keypress="textAreaKeyPress" draggable="false" v-model="textAreaText"></textarea>
			</div>
		</div>  

	</div>
</template>


<script>
import {
  getElemOffset,
  getPointerToElem,
  computeTextAreaW
} from './utils.js'
export default {
  name: 'image-editor',

  props: ['width', 'height'],
  
  data() {
    return {
      // init main style 
      outerStyObj: {
        width: this.width,
        height: this.height
      },

      panelStyObj: {
        width: this.width,
        height: parseFloat(this.height) - 80 + 'px'
      },

      maskStyObj: {
        width: this.width,
        height: parseFloat(this.height) - 80 + 'px'
      },

      canvasHeight: parseFloat(this.height) - 80,
      canvasWidth: parseFloat(this.width),

      // textArea style
      textAreaLeft : 10,
      textAreaTop:  10,
      textAreaW: 0,
      textAreaColor: '#fff',
      textAreaFz: 22,
      textAreaFm:'sans-serif',

      // action state
      canPaint: false,
      showTextArea: false,

      // textArea state
      contenteditable: false,
      canDragTextArea: false,
      initTextAreaText: '双击编辑',
      textAreaText: '',
      textAreaLeftAlignRatio: 1.1,
      textAreaCenterAlignRatio: 1.5,
      textAreaCurrentAlignRatio:1,
      textAreaHeightPadding: 10,
      minTextAreaWidth: 100,
      isTextAreaBeyond:false,
      pointerToTextArea:null,
    }
  },

  computed: {
    // style 
    textAreaStyObj(){
      return {
        left:this.textAreaLeft+'px',
        top:this.textAreaTop+'px',
        color:this.textAreaColor,
        width:this.textAreaW+'px',
        height:parseFloat(this.textAreaFz) + this.textAreaHeightPadding+'px',
        fontSize:this.textAreaFz+'px',
        fontFamily:this.textAreaFm
      }
    },
    // class
    dropNoticeClassObj() {
      return {
        hide: this.canPaint
      }
    },
   
    textAreaClassObj() {
      return {
        hide: !this.showTextArea,
        abled: this.contenteditable,
        disabled: !this.contenteditable,
        beyond: this.isTextAreaBeyond
      }
    },

    textEnhanceClassObj(){
      return {
        hide:!this.showTextArea
      }
    }
  },

  methods: {
    // upload image
    dragover(ev) {
      ev.preventDefault()
    },

    drop(ev) {
      let file,imgUrl,img
      ev.preventDefault()
      file = ev.dataTransfer.files[0]
      imgUrl = URL.createObjectURL(file)
      img = new Image()
      img.onload = (function() {
        this.canPaint = true
        this.ctx.drawImage(img, 0, 0)
        this.ctxData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
      }).bind(this)
      img.src = imgUrl
    },

    // trigger action
    inputText(ev) {
      if (!this.canPaint) return false
      this.showTextArea = true
      this.textAreaText = this.initTextAreaText
      this.textAreaCurrentAlignRatio = this.textAreaCenterAlignRatio
      this.textAreaW =computeTextAreaW(this.textAreaText,this.textAreaFz,this.textAreaCurrentAlignRatio,this.minTextAreaWidth)
    },

    // action area
    textAreaMouseDown(ev) {
      this.canDragTextArea = true
      this.pointerToTextArea = getPointerToElem(ev, this.textArea)
    },

    textAreaDouble() {
      this.contenteditable = true
      this.textAreaText = ''
      this.textAreaCurrentAlignRatio = this.textAreaLeftAlignRatio
      this.textAreaW =computeTextAreaW(this.textAreaText,this.textAreaFz,this.textAreaCurrentAlignRatio,this.minTextAreaWidth)
    },

    textAreaKeyPress(ev) {
      if (ev.key == 'Enter') ev.preventDefault()
    },

    textAreaInput() {
      let beyond,countWillRemove
      this.textAreaCurrentAlignRatio = this.textAreaLeftAlignRatio
      this.textAreaW = computeTextAreaW(this.textAreaText,this.textAreaFz,this.textAreaCurrentAlignRatio,this.minTextAreaWidth)
      beyond = getElemOffset(this.canvas,this.textArea).left+this.textAreaW-this.canvasWidth
      if(beyond>0){
        countWillRemove = Math.floor(( beyond/(parseFloat(this.textAreaFz)*this.textAreaCurrentAlignRatio)))
        this.textAreaText = this.textAreaText.slice(0,this.textAreaText.length-countWillRemove-1)
        this.textAreaW = this.textAreaW - parseFloat(this.textAreaFz)*this.textAreaCurrentAlignRatio*(countWillRemove+1)
        this.isTextAreaBeyond = true
      }else {
         this.isTextAreaBeyond = false
      }
    },

    resetTextArea() {
      this.showTextArea = false
      this.contenteditable = false
      this.isTextAreaBeyond = false
      this.textAreaText = ""
      this.textAreaCurrentAlignRatio = 1
      this.textAreaLeft = 10
      this.textAreaTop = 10
      this.textAreaColor = '#fff'
      this.textAreaFz = 22
      this.textAreaFm ='sans-serif'
    },

    // paint
    maskClick(ev) {
      let ctx,left,top
      if (ev.target.className !== 'mask') return false
        // textArea
      if (this.showTextArea && this.contenteditable) {
        ctx = this.ctx,
        left = this.textAreaLeft,
        top = this.textAreaTop + parseFloat(this.textAreaFz)
        ctx.fillStyle = this.textAreaColor
        ctx.font = this.textAreaFz + 'px ' + this.textAreaFm
        ctx.fillText(this.textAreaText, left, top)
        this.resetTextArea()
      }
    },

    // user operation
    reset() {
      if (!this.canPaint) return false
      this.resetTextArea()
      this.ctx.putImageData(this.ctxData, 0, 0)
    },

    download() {
      if (!this.canPaint) return false
    }
  },

  mounted() {
    let d = document
    let offset,left,top

    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) => d.addEventListener(name, (ev) => ev.preventDefault()))

    d.addEventListener('mousemove', (ev) => {
      if (this.canDragTextArea) {
        offset = getPointerToElem(ev, this.canvas)
        left = offset.left - this.pointerToTextArea.left
        top = offset.top - this.pointerToTextArea.top
        if (left >= 0 && left <=this.canvasWidth - parseFloat(this.textAreaStyObj.width)) {
          this.textAreaLeft = left
        }
        if (top >=0 && top <= this.canvasHeight - parseFloat(this.textAreaStyObj.height)) {
          this.textAreaTop = top
        }
      }
    })

    d.addEventListener('mouseup', () => {
      this.canDragTextArea = false
    })

    this.textArea = this.$el.getElementsByClassName('textarea')[0]
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
#image-editor {
  font-family: "SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  user-select: none;

  button {
    border: none;
    background: none;
    cursor: pointer;
    outline: none;
  }
  .hide {
    display: none;
  }
  margin: 20px auto;

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .toolbar-wrapper {
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
      .download {
        float: right;
      }
      .reset {
        float: right;
      }
      .download, .reset {
        margin-left: 10px;
      }
      .main-btn {
        background: #20a0ff;
        color: #fff;
        border-radius: 4px;
        padding: 5px 15px;

        &:hover {
          background: #4db3ff;
        }
      }
      &.enhance {
        background: #f5f5f5;
        font-size: 13px;
        border-radius: 4px;
      }
    }
    .toolbar.text-enhance {
      .font-size-input {
        display: block;
        line-height: 30px;

        input {
          text-align: center;
          width: 30px;
          height: 26px;
          font-size: 13px;
          border-radius: 2px;
          border: 1px solid #f5f7f9;
          outline: none;
          margin-left: 5px;
        }
      }
    }
  }
  .panel {
    position: relative;

    canvas, .mask {
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
    }
  }
}
</style>