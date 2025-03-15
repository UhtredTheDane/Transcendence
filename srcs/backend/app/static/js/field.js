import Ball from './ball.js';
import Player from './player.js';

export default class Field {
	constructor(playerValue, opponentValue, ballValue) {
		this.canevas = document.getElementById("field");
		this.contexte = this._canevas.getContext("2d");
		this.player = playerValue;
		this.opponent = opponentValue;
		this.ball = ballValue;
		this._ball.resetBall(); // Initialisation de la balle
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

	get player() {
		return this._player;
	}

	set player(value) {
		this._player = value;
	}

	get opponent() {
		return this._opponent;
	}

	set opponent(value) {
		this._opponent = value;
	}

	get ball() {
		return this._ball;
	}

	set ball(value) {
		this._ball = value;
	}

	getWinner() {
		if (this._player.playerScore > this._opponent.opponentScore)
			return "player1";
		else if (this._player.playerScore < this._opponent.opponentScore)
			return "player2";
	}

	draw() {
		this._contexte.clearRect(0, 0, this._canevas.width, this._canevas.height);
		this._contexte.font = "30px Arial";
		this._contexte.fillText(this._player.playerScore, 50, 70);
		this._contexte.fillText(this._opponent.playerScore, 720, 70);
		this._contexte.drawImage(this._player.img, this._player.xPos, this._player.yPos);
		this._contexte.drawImage(this._opponent.img, this._opponent.xPos, this._opponent.yPos);
		this._contexte.drawImage(this._ball.img, this._ball.xPos, this._ball.yPos);
	}
}
