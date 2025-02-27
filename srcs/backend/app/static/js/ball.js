export default class Ball {
    constructor(xPosValue, yPosValue, imgSrc) {
        this.xPos = xPosValue;
        this.yPos = yPosValue;
        this.xSpeed = -0.5;
        this.ySpeed = 0.5;
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
        this._xPos = 384; // Réinitialiser la position horizontale de la balle
        this._yPos = 212.5; // Réinitialiser la position verticale de la balle
        this._ballSpeed = 1.5; // Réinitialiser la vitesse de la balle
    
        // Générer un angle aléatoire entre -45° et 45° (en radians)
        let angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // Angle entre -45° et 45°
    
        // Calculer les composantes de la vitesse
        this._xSpeed = this._ballSpeed * Math.cos(angle); // Composante horizontale
        this._ySpeed = this._ballSpeed * Math.sin(angle); // Composante verticale
    
        // Choisir une direction aléatoire (gauche ou droite)
        if (Math.random() > 0.5) {
            this._xSpeed *= -1; // Inverser la direction horizontale
        }
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
        player = fieldPong.player;
        opponent = fieldPong.opponent;
        ball.x += ball.dx;
        ball.y += ball.dy;
        // Collision avec le haut/bas
        if (ball.y <= 0 || ball.y >= fieldPong.canevas.height)
                ball.dy *= -1;
        // Collision avec les raquettes
        if ((ball.x <= 30 && ball.y >= player.yPos && ball.y <= player.yPos + player.height) ||
            (ball.x >= 770 && ball.y >= opponent.yPos && ball.y <= opponent.yPos + opponent.height))
            ball.dx *= -1;
        if (ball.x <= 0 || ball.x >= fieldPong.canevas.width) {
            if (ball.x <= 0)
                opponent.playerScore++;
            else
                player.playerScore++;
            resetBall();
            game.sendUpdateGameScore();
            if (player.playerScore >= 2 || opponent.playerScore >= 2)
                    endGame();
        }
            game.sendBallPosition();
        }
}
