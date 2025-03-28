import Ball from './ball.js';

export default class AI {
    constructor() {
        this._aiReactionDelay = 1; 
        this._ballSpeed = 0.75; 
        this._ballSpeedInitiate = 0.75; 
        this._ballMaxSpeed = 1.75;
        this._aiReactionCounter = 0;
    }

    get aiReactionDelay() {
		return this._aiReactionDelay;
	}

	set aiReactionDelay(value) {
		this._aiReactionDelay = value;
	}

    get ballSpeed() {
		return this._ballSpeed;
	}

	set ballSpeed(value) {
		this._ballSpeed = value;
	}

    get ballSpeedInitiate() {
		return this._ballSpeedInitiate;
	}

	set ballSpeedInitiate(value) {
		this._ballSpeedInitiate = value;
	}

    get ballMaxSpeed() {
		return this._ballMaxSpeed;
	}

	set ballMaxSpeed(value) {
		this._ballMaxSpeed = value;
	}

    get aiReactionCounter() {
		return this._aiReactionCounter;
	}

	set aiReactionCounter(value) {
		this._aiReactionCounter = value;
	}

    moveAI(field) {
        if (this._aiReactionCounter >= this._aiReactionDelay) {
            // Déplacer la raquette de l'IA (pos2y) pour suivre la balle
            if (field.ball.yPos + 15 > field.opponent.yPos + field.opponent.height / 2) {
                // Si la balle est en dessous du centre de la raquette, déplacer vers le bas
                field.opponent.yPos += 3; // Vitesse de déplacement de l'IA
            } else if (field.ball.yPos + 15 < field.opponent.yPos + field.opponent.height / 2) {
                // Si la balle est au-dessus du centre de la raquette, déplacer vers le haut
                field.opponent.yPos -= 3; // Vitesse de déplacement de l'IA
            }
            // Empêcher la raquette de l'IA de sortir du canvas
            field.opponent.yPos = Math.max(0, Math.min(field.canevas.height - field.opponent.height, field.opponent.yPos));
            this._aiReactionCounter = 0; // Réinitialiser le compteur
        }
        else 
            this._aiReactionCounter++; // Incrémenter le compteur
    }
}