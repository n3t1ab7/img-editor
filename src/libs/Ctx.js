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

  textW(txt, fz, fm) {
    let result
    this.ctx.font = fz + 'px ' + fm
    result = this.ctx.measureText(txt).width
    result = result + 2
    return result
  }

  textGroupW(group, fz, fm, min) {
    let len = group.length,
      i
    let max = min
    let now = null
    for (i = 0; i < len; i++) {
      now = this.textW(group[i], fz, fm, min)
      if (max === null) {
        max = now
      } else if (now > max) {
        max = now
      }
    }
    return max
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

  Gary() {
    let imgData = this.get()
    let x, y, r, g, b, a, gray, idx
    for (x = 0; x < imgData.width; x++) {
      for (y = 0; y < imgData.height; y++) {
        idx = (x + y * imgData.width) * 4;
        r = imgData.data[idx + 0]
        g = imgData.data[idx + 1]
        b = imgData.data[idx + 2]
        gray = .299 * r + .587 * g + .114 * b;
        imgData.data[idx + 0] = gray
        imgData.data[idx + 1] = gray
        imgData.data[idx + 2] = gray
        imgData.data[idx + 3] = 255
      }
    }
    this.put(imgData)
  }

  Oil(radius = 4, intensity = 55) {
    let width = this.w,
      height = this.h,
      imgData = this.get(),
      pixData = imgData.data,
      destCanvas = document.createElement("canvas"),
      dCtx = destCanvas.getContext("2d"),
      pixelIntensityCount = []
    let destImageData = dCtx.createImageData(width, height),
      destPixData = destImageData.data,
      intensityLUT = [],
      rgbLUT = []
    let y, x, r, g, b, a, idx, avg, xx, yy, intensityVal, curMax, dIdx
    destCanvas.width = width
    destCanvas.height = height
    for (y = 0; y < height; y++) {
      intensityLUT[y] = [];
      rgbLUT[y] = [];
      for (x = 0; x < width; x++) {
        idx = (y * width + x) * 4,
          r = pixData[idx],
          g = pixData[idx + 1],
          b = pixData[idx + 2],
          avg = (r + g + b) / 3

        intensityLUT[y][x] = Math.round((avg * intensity) / 255)
        rgbLUT[y][x] = {
          r: r,
          g: g,
          b: b
        }
      }
    }
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        pixelIntensityCount = [];
        for (yy = -radius; yy <= radius; yy++) {
          for (xx = -radius; xx <= radius; xx++) {
            if (y + yy > 0 && y + yy < height && x + xx > 0 && x + xx < width) {
              intensityVal = intensityLUT[y + yy][x + xx]

              if (!pixelIntensityCount[intensityVal]) {
                pixelIntensityCount[intensityVal] = {
                  val: 1,
                  r: rgbLUT[y + yy][x + xx].r,
                  g: rgbLUT[y + yy][x + xx].g,
                  b: rgbLUT[y + yy][x + xx].b
                }
              } else {
                pixelIntensityCount[intensityVal].val++
                  pixelIntensityCount[intensityVal].r += rgbLUT[y + yy][x + xx].r
                pixelIntensityCount[intensityVal].g += rgbLUT[y + yy][x + xx].g
                pixelIntensityCount[intensityVal].b += rgbLUT[y + yy][x + xx].b
              }
            }
          }
        }
        pixelIntensityCount.sort(function(a, b) {
          return b.val - a.val
        });
        curMax = pixelIntensityCount[0].val
        dIdx = (y * width + x) * 4
        destPixData[dIdx] = ~~(pixelIntensityCount[0].r / curMax)
        destPixData[dIdx + 1] = ~~(pixelIntensityCount[0].g / curMax)
        destPixData[dIdx + 2] = ~~(pixelIntensityCount[0].b / curMax)
        destPixData[dIdx + 3] = 255
      }
    }
    this.put(destImageData)
  }

  downloadRect(x = 0, y = 0, w = this.w, h = this.h) {
    let a, url
    a = document.getElementById('download-link')
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
      link = document.getElementById('download-link')
      link.href = url
      link.download = String(+(new Date))
      link.click()
    }
    img.src = this.url()
  }
}
