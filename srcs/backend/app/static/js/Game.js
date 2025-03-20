import Field from './field.js';
import Player from './player.js';

export default class Game {

	constructor(fieldValue) {
		this.field = fieldValue;
		this.isPaused = false;
		this.isGameEnded = false;
		this.maxScore = 2;
	}

	get field() {
		return this._field;
	}

	set field(value)
	{
		this._field = value;
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

	get maxscore() {
		return this._maxscore;
	}

	set maxscore(value) {
		this._maxscore = value;
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
