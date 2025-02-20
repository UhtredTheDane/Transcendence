import Ball from './ball.js';
import Player from './player.js';

export default class Field {
	constructor(player1Value, player2Value, ballValue) {
		this.canevas = document.getElementById("field");
		this.contexte = this._canevas.getContext("2d");
		this.player1 = player1Value;
		this.player2 = player2Value;
		this.ball = ballValue;
		this._ball.resetBall(); // Initialisation de la balle
		document.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowUp')
				this._player2.ySpeed = -5;
			else if (event.key === 'ArrowDown')
				this._player2.ySpeed = 5;
			else if (event.key === 'z' || event.key === 'w')
				this._player1.ySpeed = -5;
			else if (event.key === 's')
				this._player1.ySpeed = 5;
		});
		document.addEventListener('keyup', function (event) {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
				this._player2.ySpeed = 0;
			else if (event.key === 'w' || event.key === 'z' || event.key === 's')
				this._player1.ySpeed = 0;
		});
	}

	get canevas() {
		return this._canevas;
	}

	set canevas(value) {
		this._canevas = value;
	}

	get contexte() {
		return this._contexte;
	}
	set contexte(value) {
		this._contexte = value;
	}

	get player1() {
		return this._player1;
	}

	set player1(value) {
		this._player1 = value;
	}

	get player2() {
		return this._player2;
	}

	set player2(value) {
		this._player2 = value;
	}

	get ball() {
		return this._ball;
	}

	set ball(value) {
		this._ball = value;
	}

	draw() {
		this._contexte.clearRect(0, 0, this._canevas.width, this._canevas.height);
		this._contexte.font = "30px Arial";
		this._contexte.fillText(this._player1.playerScore, 50, 70);
		this._contexte.fillText(this._player2.playerScore, 720, 70);
		this._contexte.drawImage(this._player1.img, this._player1.xPos, this._player1.yPos);
		this._contexte.drawImage(this._player2.img, this._player2.xPos, this._player2.yPos);
		this._contexte.drawImage(this._ball.img, this._ball.xPos, this._ball.yPos);
	}
}
