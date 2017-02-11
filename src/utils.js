let getElemOffset = function(parent, child) {
  let parentOffsetToView = parent.getBoundingClientRect()
  let childOffsetToView = child.getBoundingClientRect()
  let parentOffsetToPage = {
    left: parentOffsetToView.left + window.pageXOffset,
    top: parentOffsetToView.top + window.pageYOffset
  }
  let childOffsetToPage = {
    left: childOffsetToView.left + window.pageXOffset,
    top: childOffsetToView.top + window.pageYOffset
  }
  let left = childOffsetToPage.left - parentOffsetToPage.left
  let top = childOffsetToPage.top - parentOffsetToPage.top
  let right = parentOffsetToView.width - (left + childOffsetToView.width)
  let bottom = parentOffsetToView.height - (top + childOffsetToView.height)
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  }
}

let getPointerToElem = function(ev, elem) {
  let pointerOffset = {
    left: ev.clientX + window.pageXOffset,
    top: ev.clientY + window.pageYOffset
  }
  let elemOffsetToView = elem.getBoundingClientRect()
  let elemOfFset = {
    left: elemOffsetToView.left + window.pageXOffset,
    top: elemOffsetToView.top + window.pageYOffset
  }
  let left = pointerOffset.left - elemOffsetToView.left
  let top = pointerOffset.top - elemOffsetToView.top
  let right = elemOffsetToView.width - left
  let bottom = elemOffsetToView.height - top
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  }
}

let computeTextW = function(ctx, text, min) {
  let result
  result = ctx.measureText(text).width
  return result > min ? result : min
}

let ctxDataToImgUrl = function(data, x, y, w, h) {
  let canvas = document.createElement('canvas'),
    ctx, result
  canvas.width = w
  canvas.height = h
  ctx = canvas.getContext('2d')
  ctx.putImageData(data, -x, -y)
  result = canvas.toDataURL()
  return result
}

export {
  getElemOffset,
  getPointerToElem,
  computeTextW,
  ctxDataToImgUrl
}
