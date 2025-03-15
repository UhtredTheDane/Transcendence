import OnlineGame from './OnlineGame.js';

export default class RushGame extends OnlineGame{

	constructor(fieldValue, mode) {
		super(fieldValue, mode);
        this._speed;
    }

    get speed() {
		return this._speed;
	}

	set speed(value) {
		this._speed = value;
    }
}