var window = require("global/window");
var extend = require("lodash.assign");

module.exports = DragEventHandler;

function DragEventHandler(fn, value) {
	if (!(this instanceof DragEventHandler)) {
		return new DragEventHandler(fn, value);
	}

	this.fn = fn;
	this.value = value || {};
}

DragEventHandler.prototype.handleEvent = function (ev) {
	var fn = this.fn;
	var value = this.value;

	var initialX = ev.offsetX || ev.layerX;
	var initialY = ev.offsetY || ev.layerY;

	var top = ev.currentTarget.parentNode.offsetTop;
	var left = ev.currentTarget.parentNode.offsetLeft;

	var board = ev.currentTarget.parentNode.parentNode.parentNode;

	function onmove(ev) {
		var absX = ev.clientX - initialX;
		var absY = ev.clientY - initialY;

		var offset = {
			absX: absX,
			absY: absY,
			x: absX - left,
			y: absY - top,
			boardWidth: board.offsetWidth,
			boardHeight: board.offsetHeight,
		}

		fn(extend(value, offset));
	}

	function onup(ev) {
		window.removeEventListener("mousemove", onmove);
		window.removeEventListener("mouseup", onup);
	}

	window.addEventListener("mousemove", onmove);
	window.addEventListener("mouseup", onup);
}
