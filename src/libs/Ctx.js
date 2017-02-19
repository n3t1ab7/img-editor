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

let toasterGradient = function(width, height) {
  let texture = document.createElement('canvas')
  let ctx = texture.getContext('2d')
  texture.width = width
  texture.height = height
  let gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6)
  gradient.addColorStop(0, "#804e0f")
  gradient.addColorStop(1, "#3b003b")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  return ctx
}

let screen = function(background, foreground, width, height, transform) {
  let bottom = background.getImageData(0, 0, width, height)
  let top = foreground.getImageData(0, 0, width, height)
  let i, size
  for (i = 0, size = top.data.length; i < size; i += 4) {
    top.data[i + 0] = transform(bottom.data[i + 0], top.data[i + 0])
    top.data[i + 1] = transform(bottom.data[i + 1], top.data[i + 1])
    top.data[i + 2] = transform(bottom.data[i + 2], top.data[i + 2])
  }
  return top
}

import StackBlur from 'stackblur-canvas'
import ColorMatrix from './color-matrix.js'

export default class Ctx {
  constructor(canvas) {
    this.elem = canvas
    this.ctx = canvas.getContext('2d')
    this.w = canvas.width
    this.h = canvas.height
  }

  put(img, x = 0, y = 0) {
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
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    this.ctx.fillStyle = Fzcolor
    this.ctx.font = fz + 'px ' + fm
    this.ctx.shadowBlur = shadowBlur
    this.ctx.shadowColor = shadowColor
    this.ctx.shadowOffsetX = shadowX
    this.ctx.shadowOffsetY = shadowY
    this.ctx.fillText(txt, x, y)
    this.ctx.restore()
  }

  rect(x, y, w, h, color, alpha) {
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, w, h)
    this.ctx.restore()
  }

  arc(x, y, a, b, color, alpha) {
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    this.ctx.fillStyle = color
    this.arcPath(x, y, a, b)
    this.ctx.fill()
    this.ctx.restore()
  }

  arcPath(x, y, a, b) {
    let r = (a > b) ? a : b
    let ratioX = a / r
    let ratioY = b / r
    this.ctx.scale(ratioX, ratioY)
    this.ctx.beginPath()
    this.ctx.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false)
    this.ctx.closePath()
  }

  textW(txt, fz, fm, min) {
    let result
    this.ctx.font = fz + 'px ' + fm
    result = this.ctx.measureText(txt).width
    return result > min ? result : min
  }

  blur(r = 2, x = 0, y = 0, w = this.w, h = this.h) {
    StackBlur.canvasRGBA(this.elem, x, y, w, h, r)
  }

  mosaic(strength = 5, x = 0, y = 0, w = this.w, h = this.h) {
    let imgData = this.get(x, y, w, h)
    let d = imgData.data
    let width = imgData.width
    let i = 0
    let n
    let mx, my, c, coord, X, Y
    while (i < d.length) {
      n = i / 4
      X = n % imgData.width
      Y = Math.floor(n / imgData.width)
      mx = X - (X % strength)
      my = Y - (Y % strength)
      c = getColorByCoord(imgData, { x: mx, y: my })
      setColorByCoord(imgData, c, { x: X, y: Y })
      i += 4
    }
    this.put(imgData, x, y)
  }

  Blend() {
    let gradient = toasterGradient(this.w, this.h)
    let s = screen(this.ctx, gradient, this.w, this.h, function(bottomPixel, topPixel) {
      return 255 - (255 - topPixel) * (255 - bottomPixel) / 255;
    })
    let colorCorrected = ColorMatrix(s, { contrast: 30, brightness: -30 });
    this.put(colorCorrected);
  }

  downloadRect(x = 0, y = 0, w = this.w, h = this.h) {
    let a, url
    a = document.createElement('a')
    url = this.url(x, y, w, h)
    a.href = url
    a.download = String(+(new Date))
    a.click()
  }

  downloadArc(w = this.w, h = this.h, l = 0, t = 0) {
    let canvas = document.createElement('canvas')
    let ctx, x, y, a, b, r, ratioX, ratioY, img, url, link
    canvas.width = w
    canvas.height = h
    ctx = canvas.getContext('2d')
    x = w / 2
    y = h / 2
    a = w / 2
    b = h / 2
    r = (a > b) ? a : b
    ratioX = a / r
    ratioY = b / r
    ctx.scale(ratioX, ratioY)
    ctx.beginPath()
    ctx.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.clip()
    img = new Image()
    img.width = this.width
    img.height = this.height
    img.onload = function() {
      ctx.drawImage(img, -l, -t)
      url = canvas.toDataURL()
      link = document.createElement('a')
      link.href = url
      link.download = String(+(new Date))
      link.click()
    }
    img.src = this.url()
  }
}
