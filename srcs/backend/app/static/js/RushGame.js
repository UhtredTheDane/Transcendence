import OnlineGame from './OnlineGame.js';

export default class RushGame extends OnlineGame{

	constructor(fieldValue, mode, speedValue) {
		super(fieldValue, mode);
        this._speed = speedValue;
		this.field.ball.multSpeed = this.speed;
    }

	updateSpeed() {
		this.field.ball.multSpeed = this.speed;
	}

    get speed() {
		return this._speed;
	}

	set speed(value) {
		this._speed = value;
    }
}