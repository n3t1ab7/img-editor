<template>
	<div id="image-editor" :style="outerStyObj">

		<div id="toolbar" style="height:50px">
			<div id="func">
				<button @click="inputText"><i class="icon drop-icon">&#xe633;</i></button>
        <button><i class="icon drop-icon">&#xe600;</i></button>
			</div> 
			<button id="download" class="main-btn" @click="download">导出</button>
			<button id="reset" class="main-btn" @click="reset">重置</button>
		</div>


		<div id="panel" :style="panelStyObj">
			<canvas :width="canvasWidth" :height="canvasHeight"></canvas>
			<div id="mask" :style="maskStyObj" @drop="drop" @dragover="dragover" @click="maskClick">
				<i class="icon drop-icon" :class="{hide:canPaint}">&#xe624;</i>
        <textarea :class="{hide:!showTextArea}" :style="textAreaStyObj" class="textarea" :readonly="!contenteditable" @mousedown="textAreaMouseDown" @mouseup="textAreaMouseUp" @dblclick="textAreaDouble" v-model="textAreaText" @input="textAreaInput" @keypress="textAreaKeyPress"></textarea>
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

      // action state
      canPaint: false,
      showTextArea: false,

      // action area state
      contenteditable: false,
      canDragTextArea: false,
      textAreaText: '',
      textAreaSingleH: 16,

       // init action style
      textAreaStyObj: {
        left: '10px',
        top: '10px',
        color: '#fff',
        width: '0px',
        height: '0px',
        fontSize: '0px',
        fontFamily: 'sans-serif',
        textAlign: 'center'
      }
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
      this.textAreaText = '双击编辑'
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

    textAreaMouseUp(ev) {
      this.canDragTextArea = false
    },
    
    textAreaDouble(){
      this.textAreaText = " "
      this.textAreaStyObj.textAlign = "left"
      this.textAreaStyObj.lineHeight = "normal"
      this.contenteditable = true
    },

    textAreaKeyPress(ev){
      if(ev.key == 'Enter') {
        ev.preventDefault()
      }
    },

    textAreaInput(){
      let w  = ((this.textAreaText).length*this.textAreaSingleH*1.2)
      if(w<100) w = 100
      this.textAreaStyObj.width = w+'px'
    },

    maskClick(ev) {
       if (ev.target.id !== 'mask') return false
       // textArea
      if (this.showTextArea && this.contenteditable) {
        let ctx = this.ctx
        ctx.fillStyle = this.textAreaStyObj.color
        ctx.font = this.textAreaStyObj.fontSize + ' ' + this.textAreaStyObj.fontFamily
        ctx.fillText(this.textAreaText, parseInt(this.textAreaStyObj.left), parseInt(this.textAreaStyObj.top) + parseInt(this.textAreaStyObj.fontSize))
        this.showTextArea = false
        this.textAreaText = ""
      }
    },

    // user operation
    reset() {
      if (!this.canPaint) return false
      this.ctx.putImageData(this.ctxData, 0, 0)
    },

    download() {
      if (!this.canPaint) return false
    }
  },

  mounted() {
    ['dragleave', 'drop', 'dragenter', 'dragover'].forEach(function(name) {
      document.addEventListener(name, function(ev) {
        ev.preventDefault();
      })
    })
    document.addEventListener('mousemove', (ev) => {
      if (this.canDragTextArea) {
        let left = ev.clientX - this.canvasPos.left - this.textAreaLeft,
          top = ev.clientY - this.canvasPos.top - this.textAreaTop
        this.textAreaStyObj.left = left + 'px'
        this.textAreaStyObj.top = top + 'px'
      }
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
	#toolbar {
		#func {
			float: left;
			height: 100%;
      button{
        margin-right:5px;
        &:hover {
          color:#555;    
        }
      }
		}
    #pre {
      float: right;
    }
    #next {
      float: right;
    }
		#download {
			float: right;
		}
		#reset {
			float: right;
		}
		#download,#reset,#next {
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
	#panel {
		position: relative;
		canvas,#mask {
			position: absolute;
			top:0;
			left:0;
		}
		#mask {
			z-index: 50;
			.drop-icon {				
				position: absolute;
				top:50%;
				left:50%;
				font-size: 100px;
				transform:translateX(-50%) translateY(-50%);
				color:#ada4a4;
			}
			.textarea{
				position: absolute;
				background:transparent;
				border-radius:2px;
        border: 1.5px solid #fff;
        resize:none;
			}
		}
	}
}
</style>