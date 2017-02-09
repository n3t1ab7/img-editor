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
    return {
        left: childOffsetToPage.left - parentOffsetToPage.left,
        top: childOffsetToPage.top - parentOffsetToPage.top
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
    return {
        left: pointerOffset.left - elemOffsetToView.left,
        top: pointerOffset.top - elemOffsetToView.top
    }
}

let computeTextW = function(text, size, ratio, min) {
    let result = text.length * size * ratio
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
