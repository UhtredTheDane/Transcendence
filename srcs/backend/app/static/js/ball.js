
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

	updateBall(fieldPong) {
		let player;
		let opponent;
	
		player = fieldPong.player;
		opponent = fieldPong.opponent;
		
		// Collision avec la raquette du joueur
		if (this._xPos <= 16 && this._yPos + this._diameter >= player.yPos && this._yPos <= player.yPos + player.height) {
			// Calculer l'impact : distance du centre de la raquette
			let impactY = this._yPos + this._diameter / 2 - (player.yPos + player.height / 2);
			let normalizedImpact = impactY / (player.height / 2); // Normaliser l'impact entre -1 et 1
	
			// Modifier la vitesse verticale de la balle en fonction du point d'impact
			this._ySpeed = normalizedImpact * 5; // 5 est un facteur de force pour le rebond, ajustable
	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle
			this._xPos = 17; // Réinitialiser la position de la balle après collision
		}
		
		// Collision avec la raquette de l'adversaire
		else if (this._xPos + this._diameter >= 786 && this._yPos + this._diameter >= opponent.yPos && this._yPos <= opponent.yPos + opponent.height) {
			// Calculer l'impact : distance du centre de la raquette
			let impactY = this._yPos + this._diameter / 2 - (opponent.yPos + opponent.height / 2);
			let normalizedImpact = impactY / (opponent.height / 2); // Normaliser l'impact entre -1 et 1
	
			// Modifier la vitesse verticale de la balle en fonction du point d'impact
			this._ySpeed = normalizedImpact * 5; // 5 est un facteur de force pour le rebond, ajustable
	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle
			this._xPos = 755; // Réinitialiser la position de la balle après collision
		}
	
		// Collision avec le haut et le bas du terrain
		if (this._yPos <= 0 || this._yPos + this._diameter >= fieldPong.canevas.height) {
			this._ySpeed *= -1;
		}
		
		// Mise à jour des scores si la balle sort des limites
		if (this._xPos + this._diameter / 2 <= 0 || this._xPos + this._diameter >= fieldPong.canevas.width) {
			if (this._xPos <= 0)
				opponent.playerScore++;
			else
				player.playerScore++;
			this.resetBall();
		}
	
		// Mise à jour de la position de la balle
		this._xPos += this._xSpeed;
		this._yPos += this._ySpeed;
	}
	

	updateOnlineBall(fieldPong, game) {
		let player;
		let opponent;
	
		player = fieldPong.player;
		opponent = fieldPong.opponent;
		
		// Collision avec la raquette du joueur
		if (this._xPos <= 16 && this._yPos + this._diameter >= player.yPos && this._yPos <= player.yPos + player.height) {
			// Calculer l'impact : distance du centre de la raquette
			let impactY = this._yPos + this._diameter / 2 - (player.yPos + player.height / 2);
			let normalizedImpact = impactY / (player.height / 2); // Normaliser l'impact entre -1 et 1
	
			// Modifier la vitesse verticale de la balle en fonction du point d'impact
			this._ySpeed = normalizedImpact * 5; // 5 est un facteur de force pour le rebond, ajustable
	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle
			this._xPos = 17; // Réinitialiser la position de la balle après collision
		}
		
		// Collision avec la raquette de l'adversaire
		else if (this._xPos + this._diameter >= 786 && this._yPos + this._diameter >= opponent.yPos && this._yPos <= opponent.yPos + opponent.height) {
			// Calculer l'impact : distance du centre de la raquette
			let impactY = this._yPos + this._diameter / 2 - (opponent.yPos + opponent.height / 2);
			let normalizedImpact = impactY / (opponent.height / 2); // Normaliser l'impact entre -1 et 1
	
			// Modifier la vitesse verticale de la balle en fonction du point d'impact
			this._ySpeed = normalizedImpact * 5; // 5 est un facteur de force pour le rebond, ajustable
	
			this._xSpeed *= -1; // Inverser la direction horizontale de la balle
			this._xPos = 755; // Réinitialiser la position de la balle après collision
		}
	
		// Collision avec le haut et le bas du terrain
		if (this._yPos <= 0 || this._yPos + this._diameter >= fieldPong.canevas.height) {
			this._ySpeed *= -1;
		}
		
		// Mise à jour des scores si la balle sort des limites
		if (this._xPos + this._diameter / 2 <= 0 || this._xPos + this._diameter >= fieldPong.canevas.width) {
			if (this._xPos <= 0)
				opponent.playerScore++;
			else
				player.playerScore++;
			this.resetBall();
			game.sendUpdateGameScore();
		}
		this._xPos += this._xSpeed;
		this._yPos += this._ySpeed;
		game.sendBallPosition();
	}
}
