let type = function(obj) {
  return (Object.prototype.toString.call(obj).slice(8, -1))
}

let getColorByCoord = function(imgData, { x, y }) {
  let n, r, g, b, a
  n = (y * imgData.width + x) * 4
  r = imgData.data[n]
  g = imgData.data[n + 1]
  b = imgData.data[n + 2]
  a = imgData.data[n + 3]
  return { r: r, g: g, b: b, a: a }
}

let setColorByCoord = function(imgData, { r, g, b, a }, { x, y }) {
  let n = (y * imgData.width + x) * 4
  imgData.data[n] = r
  imgData.data[n + 1] = g
  imgData.data[n + 2] = b
  imgData.data[n + 3] = a
}

let getCoord = function(imgData, i) {
  let n = i / 4
  return {
    x: n % imgData.width,
    y: Math.floor(n / imgData.width)
  }
}


import StackBlur from 'stackblur-canvas'

export default class Ctx {
  constructor(canvas) {
    this.elem = canvas
    this.ctx = canvas.getContext('2d')
    this.w = canvas.width
    this.h = canvas.height
  }

  put(x = 0, y = 0, img) {
    if (type(img) === 'HTMLImageElement') {
      this.ctx.drawImage(img, x, y)
    }
    if (type(img) === 'ImageData') {
      this.ctx.putImageData(img, x, y)
    }
  }

  get(x = 0, y = 0, w = this.w, h = this.h) {
    return this.ctx.getImageData(x, y, w, h)
  }

  url(x = 0, y = 0, w = this.w, h = this.h) {
    let canvas = document.createElement('canvas'),
      ctx
    if (x == 0 && y == 0 && w == this.w && h == this.h) {
      return this.elem.toDataURL()
    } else {
      canvas.width = w
      canvas.height = h
      ctx = canvas.getContext('2d')
      ctx.putImageData(this.get(), -x, -y)
      return canvas.toDataURL()
    }
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
  }

  textW(txt, fz, fm, min) {
    let result
    this.ctx.font = fz + 'px ' + fm
    result = this.ctx.measureText(txt).width
    return result > min ? result : min
  }

  blur(x = 0, y = 0, w = this.w, h = this.h, r = 2) {
    StackBlur.canvasRGBA(this.elem, x, y, w, h, r)
  }

  mosaic(x = 0, y = 0, w = this.w, h = this.h, strength = 5) {
    let imgData = this.get(x, y, w, h)
    let d = imgData.data
    let width = imgData.width
    let i = 0
    let mx, my, c, coord, X, Y
    while (i < d.length) {
      coord = getCoord(imgData, i)
      X = coord.x
      Y = coord.y
      mx = X - (X % strength)
      my = Y - (Y % strength)
      c = getColorByCoord(imgData, { x: mx, y: my })
      setColorByCoord(imgData, c, { x: X, y: Y })
      i += 4
    }
    this.put(x, y, imgData)
  }

  download(x = 0, y = 0, w = this.w, h = this.h) {
    let a, url
    a = document.createElement('a')
    url = this.url(x, y, w, h)
    a.href = url
    a.download = String(+(new Date))
    a.click()
  }
}
