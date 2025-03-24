import Game from './Game.js';
import AI from './AI.js';

export default class AIGame extends Game {

	constructor(fieldValue) {
		super(fieldValue)
		this.isBallMover = false;
		this._ai = new AI();
	}

	get isBallMover() {
		return this._isBallMover;
	}

	set isBallMover(value) {
		this._isBallMover = value;
	}

	moveAI(AIopponent) {
		this._ai.moveAI(this.field, AIopponent)
	}
}