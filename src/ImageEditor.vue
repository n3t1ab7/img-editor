<template>
	<div id="image-editor" :style="outerStyObj">

		<div class="toolbar" style="height:50px">
			<div class="func">
				<button @click="inputText" data-notice="输入文本"><i class="icon">&#xe633;</i></button>
        <button data-notice="裁剪"><i class="icon">&#xe600;</i></button>
			</div> 
			<button class="main-btn download" @click="download">导出</button>
			<button class="main-btn reset" @click="reset">重置</button>
		</div>


		<div class="panel" :style="panelStyObj">
			<canvas :width="canvasWidth" :height="canvasHeight"></canvas>
			<div class="mask" :style="maskStyObj" @drop="drop" @dragover="dragover" @click="maskClick">
        <div :class="{hide:canPaint}" class="drop-notice">
          <i class="icon drop-icon">&#xe624;</i>
          <p>拖放图片到此</p>
        </div>
        <textarea :class="{hide:!showTextArea,onborder:isTextOnBorder}" :style="textAreaStyObj" class="textarea" :readonly="!contenteditable" @mousedown="textAreaMouseDown" @dblclick="textAreaDouble" v-model="textAreaText" @input="textAreaInput" @keypress="textAreaKeyPress" draggable="false"></textarea>
			</div>
		</div>  

	</div>
</template>


<script>
export default {
  name: 'image-editor',

  props: ['width', 'height'],

  data() {
    return {
      // init style by props 
      outerStyObj: {
        width: this.width,
        height: this.height
      },

      panelStyObj: {
        width: this.width,
        height: parseInt(this.height) - 50 + 'px'
      },

      maskStyObj: {
        width: this.width,
        height: parseInt(this.height) - 50 + 'px'
      },

      canvasHeight: parseInt(this.height) - 50,
      canvasWidth: parseInt(this.width),
       
      // init action style
      textAreaStyObj: {
        left: '10px',
        top: '10px',
        color: '#fff',
        width: '0px',
        height: '0px',
        fontSize: '0px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        cursor:'auto'
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
      isTextOnBorder:false
    }
  },

  methods: {
    // upload image
    dragover(ev) {
      ev.preventDefault()
    },

    drop(ev) {
      ev.preventDefault()
      let file = ev.dataTransfer.files[0]
      let imgUrl = URL.createObjectURL(file)
      let img = new Image()
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
      this.textAreaStyObj.cursor = 'pointer'
      let w = (this.textAreaText.length*this.textAreaSingleH*1.5)
      if(w<100) w =100
      this.textAreaStyObj.width = w+'px'
      this.textAreaStyObj.height = this.textAreaSingleH+10+'px'
      this.textAreaStyObj.fontSize = this.textAreaSingleH+'px'
      this.textAreaStyObj.textAlign = 'center'
    },

    // action area
    textAreaMouseDown(ev) {
      this.canDragTextArea = true
      this.textPos = {
        left: this.textArea.getBoundingClientRect().left,
        top: this.textArea.getBoundingClientRect().top,
      }
      this.textAreaLeft = ev.clientX - this.textPos.left
      this.textAreaTop = ev.clientY - this.textPos.top
    },

    textAreaDouble(){
      this.textAreaText = ''
      this.textAreaStyObj.cursor = 'auto'
      this.textAreaStyObj.textAlign = "left"
      this.textAreaStyObj.lineHeight = "normal"
      this.contenteditable = true
    },

    textAreaKeyPress(ev){
      if(ev.key == 'Enter') ev.preventDefault()
    },

    textAreaInput(){
      let w  = ((this.textAreaText).length*this.textAreaSingleH*1.2)
      if(w<100) w = 100
      this.textAreaStyObj.width = w+'px'
    },

    resetTextArea(){
      this.showTextArea = false
      this.textAreaText = ""
      this.textAreaStyObj.cursor = "auto"
    },
    
    // paint
    maskClick(ev) {
      if (ev.target.className !== 'mask') return false
      // textArea
      if (this.showTextArea && this.contenteditable) {
        let ctx = this.ctx,
            left = parseInt(this.textAreaStyObj.left),
            top = parseInt(this.textAreaStyObj.top) + parseInt(this.textAreaStyObj.fontSize)
        ctx.fillStyle = this.textAreaStyObj.color
        ctx.font = this.textAreaStyObj.fontSize + ' ' + this.textAreaStyObj.fontFamily
        ctx.fillText(this.textAreaText,left,top )
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
    let d= document;

    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach((name) =>d.addEventListener(name, (ev) => ev.preventDefault()))

    d.addEventListener('mousemove', (ev) => {
      let left,top
      let onABorder
      let onAnotherBorder
      if (this.canDragTextArea) {
        left = ev.clientX - this.canvasPos.left - this.textAreaLeft
        top = ev.clientY - this.canvasPos.top - this.textAreaTop
        if(left>0&&left<this.canvasWidth-parseInt(this.textAreaStyObj.width)){
           this.textAreaStyObj.left = left+'px'
           onABorder = false
        }else{
           onABorder = true
        }
        if(top>0&&top<this.canvasHeight-parseInt(this.textAreaStyObj.height)) {
           this.textAreaStyObj.top =  top+'px'
           onAnotherBorder = false
        }else{
           onAnotherBorder = true
        }
        if(onABorder||onAnotherBorder) {
          this.isTextOnBorder = true
        }else{
          this.isTextOnBorder = false
        }
      }
    })

    d.addEventListener('mouseup',()=>{
      this.canDragTextArea = false
    })

    this.textArea = this.$el.getElementsByClassName('textarea')[0]
    this.canvas = this.$el.getElementsByTagName('canvas')[0]

    this.canvasPos = {
      left: this.canvas.getBoundingClientRect().left,
      top: this.canvas.getBoundingClientRect().top
    }

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
    border-bottom:1px solid #ccc;
		.func {
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
				background:transparent;
				border-radius:1px;
        border: 2px dashed #fff;
        resize:none;
        outline:none;
        user-select:none;
        &.onborder {
          border-color: red;
        }
			}
		}
	}
}
</style>