
import Field from './field.js';

import Player from './player.js';
export default class Ball {
	constructor(xPosValue, yPosValue, imgSrc) {
		this.xPos = xPosValue;
		this.yPos = yPosValue;
		this.xSpeed = -0.5;
		this.ySpeed = -0.5;
		this.ballSpeed = 1.5;
		this.ballSpeedIncrement = 0.05;
		this.ballSpeedMax = 2.0;
		this.diameter = 30.0;
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

	get ballSpeed() {
		return this._ballSpeed;
	}

	set ballSpeed(value) {
		this._ballSpeed = value;
	}

	get ballSpeedMax() {
		return this._ballSpeedMax;
	}
	set ballSpeedMax(value) {
		this._ballSpeedMax = value;
	}

	get ballSpeedIncrement() {
		return this._ballSpeedIncrement;
	}
	set ballSpeedIncrement(value) {
		this._ballSpeedIncrement = value;
	}

	get diameter() {
		return this._diameter;
	}
	set diameter(value) {
		this._diameter = value;
	}

	get img() {
		return this._img;
	}
	set img(value) {
		this._img = value;
	}


	resetBall() {
		this._xPos = 802 / 2;
		this._yPos = 455 / 2;
		this._xSpeed = (Math.random() > 0.5 ? 1 : -1) * 3;
		this._ySpeed = (Math.random() > 0.5 ? 1 : -1) * 3;
	}

	increaseBallSpeed() {
		// Augmenter la vitesse de la balle sans dépasser la vitesse maximale
		if (this._ballSpeed < this._ballSpeedMax) {
			this._ballSpeed += this._ballSpeedIncrement;
		}

		// Recalculer les composantes de la vitesse pour conserver la direction
		let angle = Math.atan2(this._ySpeed, this._xSpeed); // Calculer l'angle actuel
		this._xSpeed = this._ballSpeed * Math.cos(angle); // Mettre à jour la composante horizontale
		this._ySpeed = this._ballSpeed * Math.sin(angle); // Mettre à jour la composante verticale
	}

	updateBall(fieldPong, game) {
		let player;
		let opponent; 
		this._xPos += this._xSpeed;
		this._yPos += this._ySpeed;

		if (playerRole == "player1")
		{
			player = fieldPong.player;
			opponent = fieldPong.opponent;
		}
		else
		{
			player = fieldPong.opponent;
			opponent = fieldPong.player;
		}
		if ((this._xPos  <= 30 || this._xPos >= 770) && (this._yPos >= player.yPos && this._yPos <= player.yPos + player.height || this._yPos >= opponent.yPos && this._yPos <= opponent.yPos + opponent.height))
		{	console.log("testraquette");
			this._xSpeed *= -1;
		}
		if (this._yPos <= 0 || this._yPos >= fieldPong.canevas.height)
		{
			this._ySpeed *= -1;
			console.log("testhautbass");
		} 	    
		if (this._xPos <= 0 || this._xPos + this._diameter >= fieldPong.canevas.width) {
			console.log("testbut");
			if (this._xPos <= 0)
				opponent.playerScore++;
			else
				player.playerScore++;
			this.resetBall();
			game.sendUpdateGameScore();
			if (player.playerScore >= 2 || opponent.playerScore >= 2)
				game.endGame();
		}

				game.sendBallPosition();
	}
}
