import Field from './field.js';
import Player from './player.js';

export default class Game {

	constructor(fieldValue) {
		this.field = fieldValue;
		this.isPaused = false;
		this.isGameEnded = false;
	}

	get field() {
		return this._field;
	}

	set field(value)
	{
		this._field = value;
	}
	
	get isBallMover() {
		return this._isBallMover;
	}

	set isBallMover(value) {
		this._isBallMover = value;
	}

	get isGameEnded() {
		return this._isGameEnded;
	}

	set isGameEnded(value) {
		this._isGameEnded = value;
	}

	get isPaused() {
		return this._isPaused;
	}

	set isPaused(value) {
		this._isPaused = value;
	}

	togglePauseGame() {
		this._isPaused = !this._isPaused;
		if (this._isGameEnded)
			return;
	}

	updateBall() {
		if (this._isPaused || this._isGameEnded)
			return;
		this._field.ball.updateBall(this._field, this);
	}

	sendMove(position) {
		if (this._isGameEnded)
			return;
		this._field.player.yPos = position;
	}


}
