
import Field from './field.js';
import Player from './player.js';

export default class Ball {
	constructor(xPosValue, yPosValue, imgSrc) {
		this.xPos = xPosValue;
		this.yPos = yPosValue;
		this.xSpeed = -0.5;
		this.ySpeed = -0.5;
		this.ballSpeed = 1.5;
		this.multSpeed = 3.5;
		this.ballSpeedIncrement = 0.05;
		this.ballSpeedMax = 2.0;
		this.diameter = 30.0;
		this.img = new Image();
		this.img.src = imgSrc;
		this.resetBall();
	}
	
	get multSpeed() {
		return this._multSpeed;
	}

	set multSpeed(value) {
		this._multSpeed = value;
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
		this._xSpeed = (Math.random() > 0.5 ? 1 : -1) * this._multSpeed;
		this._ySpeed = (Math.random() > 0.5 ? 1 : -1) * this._multSpeed;
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

		player = fieldPong.player;
		opponent = fieldPong.opponent;
		if (this._xPos <= 30 && (this._yPos >= player.yPos - 5 && this._yPos <= player.yPos + player.height + 5 || this._yPos + this._diameter >= player.YPos - 5 && this._yPos + this._diameter <= player.YPos + player.height + 5) || this._xPos + this._diameter >= 770 && (this._yPos >= opponent.yPos - 5 && this._yPos <= opponent.yPos + opponent.height + 5 || this._yPos + this._diameter >= opponent.yPos - 5 && this._yPos + this._diameter <= opponent.yPos + opponent.height + 5))
		{	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle	
			var newSpeedx = this._xSpeed;
			var newSpeedy = this._ySpeed;
			if (this._xPos <= 30 && this._yPos + this._diameter / 2 >= player.yPos - 5 && this._yPos + this._diameter/2 < player.yPos + 42)
				{
					if (this._ySpeed < 0.0)
					{
					
						newSpeedx = this._xSpeed * Math.cos(Math.PI / 180 * -15) - this._ySpeed * Math.sin(Math.PI/180 * -15);
						newSpeedy = this._xSpeed * Math.sin(Math.PI / 180 * -15) + this._ySpeed * Math.cos(Math.PI/180 * -15);
					}
					else
						newSpeedy = this._ySpeed * -1;
					//hautraquette1
				}
				else if (this._xPos <= 30 && this._yPos + this._diameter/2 >= player.yPos + 42 && this._yPos + this._diameter/2 <= player.yPos + 82) {}
					//milieuraquette1
				else if (this._xPos <= 30 && this._yPos + this._diameter/2 > player.yPos + 82 && this._yPos + this._diameter/2 <= player.yPos + 122)
				{	
					//basraquette1
					if (this._ySpeed >= 0.0)
					{
						
						newSpeedx = this._xSpeed * Math.cos(Math.PI / 180 * 15) - this._ySpeed * Math.sin(Math.PI/180 * 15);
						newSpeedy = this._xSpeed * Math.sin(Math.PI / 180 * 15) + this._ySpeed * Math.cos(Math.PI/180 * 15);
					}
					else
						newSpeedy = this._ySpeed * -1;
				}
				else if (this._xPos >= 770 && this._yPos + this._diameter / 2 >= opponent.yPos - 5 && this._yPos + this._diameter / 2 < opponent.yPos + 40)
					{
						if (this._ySpeed < 0.0)
						{
							
							newSpeedx = this._xSpeed * Math.cos(Math.PI / 180 * 15) - this._ySpeed * Math.sin(Math.PI/180 * 15);
							newSpeedy = this._xSpeed * Math.sin(Math.PI / 180 * 15) + this._ySpeed * Math.cos(Math.PI/180 * 15);
						}
						else
							newSpeedy = this._ySpeed * -1;
						//hautraquette2
					}
				else if (this._xPos >= 770 && this._yPos + this._diameter / 2 >= opponent.yPos + 40 && this._yPos + this._diameter / 2 <= opponent.yPos + 80)
				{}	//milieuraquette2
				else if (this._xPos >= 770 && this._yPos + this._diameter / 2 > opponent.yPos + 80 && this._yPos + this._diameter / 2 <= opponent.yPos + 125)
				{
					//basraquette2
					if (this._ySpeed >= 0.0)
					{
						//Angle de deviation de -40 degre
						newSpeedx = this._xSpeed * Math.cos(Math.PI / 180 * -15) - this._ySpeed * Math.sin(Math.PI/180 * -15);
						newSpeedy = this._xSpeed * Math.sin(Math.PI / 180 * -15) + this._ySpeed * Math.cos(Math.PI/180 * -15);
					}
					else
						newSpeedy = this._ySpeed * -1;
				}
				this._ballSpeed = Math.sqrt(Math.pow(newSpeedx, 2) + Math.pow(newSpeedy, 2));
				this._xSpeed = newSpeedx/this._ballSpeed * this._multSpeed;
				this._ySpeed = newSpeedy/this._ballSpeed * this._multSpeed;
			if (this._xPos <= 30)
				this._xPos = 31;
			else
				this._xPos = 739;
		}
		if (this._yPos <= 0 || this._yPos + this._diameter >= fieldPong.canevas.height)
		{
			this._ySpeed *= -1;
		} 	    
		if (this._xPos + this._diameter / 2 <= 0 || this._xPos + this._diameter >= fieldPong.canevas.width) {
			if (this._xPos <= 0)
				opponent.playerScore++;
			else
				player.playerScore++;
			this.resetBall();
			//game.sendUpdateGameScore();
			//if (player.playerScore >= 2 || opponent.playerScore >= 2)
			//	game.endGame();
		}
				//game.sendBallPosition();
	}

	updateOnlineBall(fieldPong, game) {
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
		if (this._xPos <= 30 && (this._yPos >= player.yPos - 5 && this._yPos <= player.yPos + player.height + 5 || this._yPos + this._diameter >= player.YPos - 5 && this._yPos + this._diameter <= player.YPos + player.height + 5) || this._xPos + this._diameter >= 770 && (this._yPos >= opponent.yPos - 5 && this._yPos <= opponent.yPos + opponent.height + 5 || this._yPos + this._diameter >= opponent.yPos - 5 && this._yPos + this._diameter <= opponent.yPos + opponent.height + 5))
		{	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle	
			if (this._xPos <= 30)
				this._xPos = 31;
			else
				this._xPos = 739;
		}
		if (this._yPos <= 0 || this._yPos + this._diameter >= fieldPong.canevas.height)
		{
			this._ySpeed *= -1;
		} 	    
		if (this._xPos + this._diameter / 2 <= 0 || this._xPos + this._diameter >= fieldPong.canevas.width) {
			if (this._xPos <= 0)
				opponent.playerScore++;
			else
				player.playerScore++;
			this.resetBall();
			game.sendUpdateGameScore();
		}
			game.sendBallPosition();
	}
}
