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

let computeTextAreaW = function(text,size,ratio,min){
	let result = text.length*size*ratio
	return result>min?result:min
}


export {
	getElemOffset,
	getPointerToElem,
	computeTextAreaW
}