var mercury = require('mercury');
var h = mercury.h;
var input = mercury.input;
var struct = mercury.struct;
var value = mercury.value;
var event = mercury.event;

var chesslib = require('chesslib');
var Point = chesslib.Point;
var Queen = chesslib.Queen;
var util = chesslib.util;

var dragEvent = require('./drag-handler.js');

var ranks = '87654321'.split('');
var files = 'abcdefgh'.split('');

module.exports = playable;

function playable(position) {

	var state = struct({
		position: value(position),
		draggingPiece: value(null),
		registeredPiece: value(null),
		targetSquare: value(null),
		offset: value(null),
		rotated: value(false),
		events: input(['dragPiece', 'registerPiece', 'dropPiece'])
	});

	state.events.dragPiece(function (event) {
		state.registeredPiece.set(null);
		state.draggingPiece.set(event.piece);
		state.offset.set({ x: event.x, y: event.y });
		state.targetSquare.set(getTargetSquare({
			rs: position.ranks,
			fs: position.files,
			boardWidth: event.boardWidth,
			boardHeight: event.boardHeight,
			x: event.absX,
			y: event.absY,
			rotated: state.rotated(),
		}));
	});

	state.events.registerPiece(function (event) {
		state.registeredPiece.set(event.piece);
	});

	state.events.dropPiece(function (event) {
		var target = util.squareCoords(state.targetSquare());
		if (target != null) {
			var newPosition = state.position().tryMovePiece(event.piece, target);
			if (newPosition.promotionSquare != null) {
				// auto-promoting for now:
				state.position.set(
					newPosition.promote(new Queen({ color: piece.color })));
			}
			else {
				state.position.set(newPosition);
			}
			if (newPosition.isCheckmate()) {
				alert('checkmate');
			}
		}
		state.draggingPiece.set(null);
		state.registeredPiece.set(null);
		state.targetSquare.set(null);
	});

	return state;
}

playable.board = function (state) {
	return h('div.board', rotate(ranks, state.rotated).map(function (r, i) {
		return h('div.rank.r' + r, rotate(files, state.rotated).map(function (f, j) {
			return h('div.square.' + f + r, (
				isTarget(state, f, r) ? { className: 'active' } : {}
			), renderPiece(state, i, j));
		}))}));
};

function renderPiece(state, rank, file) {
	var piece
		= state.position.pieceByCoords(new Point(file, rank), state.rotated);
	if (piece == null) {
		return null;
	}
	var options = { piece: piece, rank: rank, file: file };
	var dragging = piece === state.draggingPiece;
	var registered = piece === state.registeredPiece;
	return h('div.piece.' + piece.fenEncoding, {
		'ev-mousedown': dragEvent(state.events.dragPiece, options),
		'ev-click': event(state.events.registerPiece, options),
		'ev-mouseup': event(state.events.dropPiece, options),
		'className': dragging ? 'dragging' : registered ? 'registered' : null,
		'style': (
			dragging ? {
				'top': state.offset.y + 'px',
				'left': state.offset.x + 'px',
				'z-index': '2'
			} : {
				'z-index': '1'
			}
		)
	});
}

function isTarget(state, file, rank) {
	return state.targetSquare === '' + file + rank;
}

function getTargetSquare(event) {
	return [
		rotate(files, event.rotated)[Math.floor(event.x / event.boardHeight * event.fs)],
		rotate(ranks, event.rotated)[Math.floor(event.y / event.boardWidth * event.rs)],
	].join('');
}

function rotate(arr, rotated) {
	if (rotated) {
		return [].slice.call(arr).reverse();
	}
	return arr;
}
