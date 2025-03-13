export default class Player {
	constructor(xPosValue, yPosValue, imgSrc) {
		this.xPos = xPosValue;
		this.yPos = yPosValue;
		this.xSpeed = 0.0;
		this.ySpeed = 0.0;
		this.height = 130.0;
		this.width = 17.0;
		this.playerScore = 0;
		this.img = new Image();
		this.img.src = imgSrc;
	}

	get xPos() {
		return this._xPos;
	}
	
	set xPos(value) {
        	this._xPos = value;
    	}

	get yPos() {
		return this._yPos;
	}
	set yPos(value) {
		this._yPos = value;
	}

	get xSpeed() {
		return this._xSpeed;
	}
	set xSpeed(value) {
		this._xSpeed = value;
	}

	get ySpeed() {
		return this._ySpeed;
	}

	set ySpeed(value) {
		this._ySpeed = value;
	}

	get height() {
		return this._height;
	}
	set height(value) {
		this._height = value;
	}

	get width() {
		return this._width;
	}
	set width(value) {
		this._width = value;
	}

	get playerScore() {
		return this._playerScore;
	}

	set playerScore(value) {
		this._playerScore = value;
	}

	get img() {
		return this._img;
	}
	set img(value) {
		this._img = value;
	}

}
