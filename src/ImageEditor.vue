<template>
	<div id="image-editor" :style="outerStyObj">

		<div class="toolbar" style="height:40px">
			<div class="menu">
				<button @click="inputText"><i class="icon">&#xe633;</i></button>
        <button><i class="icon">&#xe600;</i></button>
			</div> 
			<button class="main-btn download" @click="download">导出</button>
			<button class="main-btn reset" @click="reset">重置</button>
		</div>
    <div class="toolbar text-enhance" style="height:40px">
      <div class="menu"> 

      </div> 
    </div>


		<div class="panel" :style="panelStyObj">
			<canvas :width="canvasWidth" :height="canvasHeight"></canvas>
			<div class="mask" :style="maskStyObj" @drop="drop" @dragover="dragover" @click="maskClick">
        <div :class="dropNoticeClassObj" class="drop-notice">
          <i class="icon drop-icon">&#xe624;</i>
          <p>拖放图片到此</p>
        </div>
        <textarea :class="textAreaClassObj" class="textarea" :style="textAreaStyObj" :readonly="!contenteditable" @mousedown="textAreaMouseDown" @dblclick="textAreaDouble" v-model="textAreaText" @input="textAreaInput" @keypress="textAreaKeyPress" draggable="false"></textarea>
			</div>
		</div>  

	</div>
</template>


<script>
import {
  getElemOffset,
  getPointerToElem
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

      // init action style
      textAreaStyObj: {
        left: '10px',
        top: '10px',
        color: '#fff',
        width: '0px',
        height: '0px',
        fontSize: '0px',
        fontFamily: 'sans-serif'
      },

      // action state
      canPaint: false,
      showTextArea: false,

      // textArea state
      contenteditable: false,
      canDragTextArea: false,
      initTextAreaText: '双击编辑',
      textAreaText: '',
      textAreaSingleH: 22,
      textAreaLeftAlignRatio: 1.1,
      textAreaCenterAlignRatio: 1.5,
      textAreaHeightPadding: 10,
      minTextAreaWidth: 100,
      isTextAreaBeyond:false
    }
  },

  computed: {
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
      let w
      if (!this.canPaint) return false
      this.showTextArea = true
      this.textAreaText = this.initTextAreaText
      w = (this.textAreaText.length * this.textAreaSingleH * this.textAreaCenterAlignRatio)
      if (w < this.minTextAreaWidth) w = this.minTextAreaWidth
      this.textAreaStyObj.width = w + 'px'
      this.textAreaStyObj.height = this.textAreaSingleH + this.textAreaHeightPadding + 'px'
      this.textAreaStyObj.fontSize = this.textAreaSingleH + 'px'
    },

    // action area
    textAreaMouseDown(ev) {
      let pointerToTextArea
      this.canDragTextArea = true
      pointerToTextArea = getPointerToElem(ev, this.textArea)
      this.textAreaLeft = pointerToTextArea.left
      this.textAreaTop = pointerToTextArea.top
    },

    textAreaDouble() {
      this.contenteditable = true
      this.textAreaText = ''
    },

    textAreaKeyPress(ev) {
      if (ev.key == 'Enter') ev.preventDefault()
    },

    textAreaInput() {
      let w,beyond,countWillRemove
      w = ((this.textAreaText).length * this.textAreaSingleH * this.textAreaLeftAlignRatio)
      if (w < this.minTextAreaWidth) w = this.minTextAreaWidth
      this.textAreaStyObj.width = w + 'px'
      beyond = getElemOffset(this.canvas,this.textArea).left+parseFloat(this.textAreaStyObj.width)-this.canvasWidth
      if(beyond>0){
        countWillRemove = Math.floor(( beyond/(this.textAreaSingleH*this.textAreaLeftAlignRatio)))
        this.textAreaText = this.textAreaText.slice(0,this.textAreaText.length-countWillRemove-1)
        this.textAreaStyObj.width = parseFloat(this.textAreaStyObj.width) - this.textAreaSingleH*this.textAreaLeftAlignRatio+'px'
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
    },

    // paint
    maskClick(ev) {
      let ctx,left,top
      if (ev.target.className !== 'mask') return false
        // textArea
      if (this.showTextArea && this.contenteditable) {
        ctx = this.ctx,
        left = parseFloat(this.textAreaStyObj.left),
        top = parseFloat(this.textAreaStyObj.top) + parseFloat(this.textAreaStyObj.fontSize)
        ctx.fillStyle = this.textAreaStyObj.color
        ctx.font = this.textAreaStyObj.fontSize + ' ' + this.textAreaStyObj.fontFamily
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
        left = offset.left - this.textAreaLeft
        top = offset.top - this.textAreaTop
        /*
        if (left > 0 && left < this.canvasWidth - parseFloat(this.textAreaStyObj.width)) {
          this.textAreaStyObj.left = left + 'px'
        }
        if (top > 0 && top < this.canvasHeight - parseFloat(this.textAreaStyObj.height)) { 
          this.textAreaStyObj.top = top + 'px'
        }*/
        this.textAreaStyObj.left = left + 'px'
        this.textAreaStyObj.top = top + 'px'
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
.icon{
  font-family:"icon" !important;
  font-size:16px;font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
#image-editor {
  font-family: "SF Pro SC","SF Pro Text","SF Pro Icons","PingFang SC","Microsoft YaHei","Helvetica Neue","Helvetica","Arial",sans-serif;
  user-select:none;
	button {
		border:none;
		background: none;
		cursor: pointer;
		outline:none;
	}
	.hide {
		display:none;
	}
	margin:20px auto;
	* {
		box-sizing: border-box;
		margin:0;
		padding:0;
	}
	.toolbar {
		.menu {
			float: left;
			height: 100%;
      button{
        margin-right:5px;
        &:hover {
          color:#555;    
        }
      }
		}
		.download {
			float: right;
		}
		.reset {
			float: right;
		}
		.download,.reset {
			margin-left:10px;
		}
		.main-btn {
			background: #20a0ff;
			color:#fff;
			border-radius:4px;
      padding:5px 15px;
      &:hover {
        background:#4db3ff;
      }
		}
	}
	.panel {
		position: relative;
		canvas,.mask {
			position: absolute;
			top:0;
			left:0;
		}
		.mask {
			z-index: 50;
			.drop-notice {				
				position: absolute;
				top:50%;
				left:50%;
        font-size: 30px;
        text-align:center;
				transform:translateX(-50%) translateY(-50%);
				color:#ada4a4;
        .drop-icon {
          font-size: 60px;
        }
			}
			.textarea{
				position: absolute;
        overflow:hidden;
				background:transparent;
				border-radius:1px;
        border: 2px dashed #fff;
        resize:none;
        outline:none;
        user-select:none;
        &.beyond {
          border-color:red;
        }
        &.disabled {
          text-align: center;
          cursor: pointer;
        }
        &.abled {
          text-align:left;
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