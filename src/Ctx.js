let type = function(obj) {
  return (Object.prototype.toString.call(obj).slice(8, -1))
}

let copy = function(data) {
  var temp = new ImageData(data.width, data.height)
  temp.data.set(data.data)
  return temp
}

import StackBlur from 'stackblur-canvas'

export default class Ctx {
  constructor(canvas) {
    this.elem = canvas
    this.ctx = canvas.getContext('2d')
    this.w = canvas.width
    this.h = canvas.height
    this.first = true
    this.initData = null
    this.nowData = null
    this.imgUrl = null
    this.nowImgUrl = null
    this.bluring = false
  }

  put(img, x = 0, y = 0) {
    if (type(img) === 'HTMLImageElement') {
      this.ctx.drawImage(img, x, y)
    }
    if (type(img) === 'ImageData') {
      this.ctx.putImageData(img, x, y)
    }
    if (this.first) {
      this.nowData = this.initData = this.get()
      this.nowImgUrl = this.initImgUrl = this.URL(0, 0, this.w, this.h)
      this.first = false
    } else if (!this.bluring) {
      this.nowData = this.get()
      this.nowImgUrl = this.URL(0, 0, this.w, this.h)
    }
  }

  get(w, h, x, y) {
    if (w === undefined) w = this.w
    if (h === undefined) h = this.h
    if (x === undefined) x = 0
    if (y === undefined) y = 0
    return this.ctx.getImageData(x, y, w, h)
  }

  URL(x, y, w, h) {
    let canvas = document.createElement('canvas'),
      ctx, result
    canvas.width = w
    canvas.height = h
    ctx = canvas.getContext('2d')
    ctx.putImageData(this.nowData, -x, -y)
    result = canvas.toDataURL()
    return result
  }

  afterPaint() {
    this.nowData = this.get()
    this.nowImgUrl = this.URL(0, 0, this.w, this.h)
  }

  text(txt, x, y, Fzcolor, fz, fm, alpha, shadowBlur, shadowColor, shadowX, shadowY) {
    this.ctx.globalAlpha = alpha
    this.ctx.fillStyle = Fzcolor
    this.ctx.font = fz + 'px ' + fm
    this.ctx.shadowBlur = shadowBlur
    this.ctx.shadowColor = shadowColor
    this.ctx.shadowOffsetX = shadowX
    this.ctx.shadowOffsetY = shadowY
    this.ctx.fillText(txt, x, y)
    this.afterPaint()
  }

  textW(txt, fz, fm, min) {
    let result
    this.ctx.font = fz + 'px ' + fm
    result = this.ctx.measureText(txt).width
    return result > min ? result : min
  }

  tempBlur(r) {
    r = Math.floor(r)
    this.bluring = true
    let startData = copy(this.nowData),
      now
    if (r === 0) {
      this.put(startData)
    } else {
      now = StackBlur.imageDataRGBA(startData, 0, 0, this.w, this.h, r)
      this.put(now)
    }
  }

  saveBlur() {
    this.nowData = this.get()
    this.nowImgUrl = this.URL(0, 0, this.w, this.h)
  }

  resetBlur() {
    this.put(this.nowData)
  }

  download(x, y, w, h) {
    this.saveBlur()
    let a, url
    a = document.createElement('a')
    if (x === undefined) x = 0
    if (y === undefined) y = 0
    if (w === undefined) w = this.w
    if (h === undefined) h = this.h
    url = this.URL(x, y, w, h)
    a.href = url
    a.download = String(+(new Date))
    a.click()
  }

  reset() {
    this.put(this.initData)
    this.nowData = this.initData
    this.nowImgUrl = this.initImgUrl
  }
}
