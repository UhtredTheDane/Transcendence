export default class Player {
	constructor(xPosValue, yPosValue, imgSrc) {
		this.xPos = xPosValue;
		this.yPos = yPosValue;
		this.xSpeed = 0.0;
		this.ySpeed = 0.0;
		this.height = 122.0;
		this.width = 16.0;
		this.playerScore = 0;
		this.img = new Image();
		this.img.src = imgSrc;
		this.keyStatesPlayer = null; 
		if (playerRole == "player1")
		{
			this.keyStates = {
			w: false,
			z: false,
			s: false,
			};
		}
		else
		{
			this.keyStates = {
				ArrowUp: false,
				ArrowDown: false,
			};
		}
	}

	movePlayer(game) {
		if (this.keyStates.w || this.keyStates.s) {
			this.ySpeed = this.keyStates.w ? -10 : 10; // Mouvement vers le haut ou vers le bas
			if (this.yPos + this.ySpeed <= 0 && this.keyStates.w)
				game.sendMove(0, "player1");
			else if (this.yPos + this.height + this.ySpeed >= game.field.canevas.height && this.keyStates.s)
				game.sendMove(game.field.canevas.height - this.height, "player1");
			else
				game.sendMove(this.yPos + this.ySpeed, "player1");
		}
		else if (this.keyStates.ArrowUp || this.keyStates.ArrowDown) {
			this.ySpeed = this.keyStates.ArrowUp ? -10 : 10; // Mouvement vers le haut ou vers le bas
			if (this.yPos + this.ySpeed <= 0 && this.keyStates.ArrowUp)
				game.sendMove(0, "player2");
			else if (this.yPos + this.height + this.ySpeed >= game.field.canevas.height && this.keyStates.ArrowDown)
				game.sendMove(game.field.canevas.height - this.height, "player2");
			else
				game.sendMove(this.yPos + this.ySpeed, "player2");
		}
		else
			this.ySpeed = 0;
	}

	get keyStatesPlayer() {
		return this._keyStatesPlayer;
	}
	
	set keyStatesPlayer(value) {
        	this._keyStatesPlayer = value;
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
