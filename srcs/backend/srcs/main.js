import Game from './Game.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';

let player1 = new Player(0.0, 167.5, 'textures/Player1.png');
let player2 = new Player(785, 167.5, 'textures/Player2.png');
let ball = new Ball(384, 212.5, 'textures/Ball.png');
let fieldPong = new Field(player1, player2, ball);
let game = new Game(fieldPong);

window.main = function () {

	if (game.isPaused) {
		window.requestAnimationFrame(main);
		return;
	}
	window.requestAnimationFrame(main);
	fieldPong.draw();

	// Gestion des collisions avec les bords du terrain (haut et bas)
	if (ball.yPos + ball.diameter + ball.ySpeed * 2.5 > fieldPong.canevas.height || ball.yPos + ball.ySpeed * 2.5 < 0)
		ball.ySpeed = ball.ySpeed * -1;

	// Gestion des collisions avec les raquettes
	// Joueur 1 (gauche)
	if (ball.xPos + ball.xSpeed * 2.5 <= player1.xPos + player1.width &&
		ball.yPos + 30 > player1.yPos && // La balle est en dessous du haut de la raquette
		ball.yPos < player1.yPos + player1.height // La balle est au-dessus du bas de la raquette
	) {
		ball.xSpeed = ball.xSpeed * -1; // Inverser la direction horizontale de la balle	
		var newSpeedx = ball.xSpeed;
		var newSpeedy = ball.ySpeed;
		if (ball.yPos + ball.diameter/ 2 >= player1.yPos && ball.yPos + ball.diameter/2 < player1.yPos + 40)
		{
			if (ball.ySpeed < 0.0)
			{
				//Angle de deviation de -40 degre
				newSpeedx = ball.xSpeed * Math.cos(Math.PI / 180 * -40) - ball.ySpeed * Math.sin(Math.PI/180 * -40);
				newSpeedy = ball.xSpeed * Math.sin(Math.PI / 180 * -40) + ball.ySpeed * Math.cos(Math.PI/180 * -40);
			}
			else
				newSpeedy = ball.ySpeed * -1;
			alert("sa touche haut");
		}
		else if (ball.yPos + ball.diameter/2 >= player1.yPos + 40 && ball.yPos + ball.diameter/2 <= player1.yPos + 80)
			alert("sa touche milieu");
		else if (ball.yPos + ball.diameter/2 > player1.yPos + 80 && ball.yPos + ball.diameter/2 <= player1.yPos + 120)
		{	
			alert("sa touche bas");
			if (ball.ySpeed >= 0.0)
			{
				//Angle de deviation de 40 degre
				newSpeedx = ball.xSpeed * Math.cos(Math.PI / 180 * 40) - ball.ySpeed * Math.sin(Math.PI/180 * 40);
				newSpeedy = ball.xSpeed * Math.sin(Math.PI / 180 * 40) + ball.ySpeed * Math.cos(Math.PI/180 * 40);
			}
			else
				newSpeedy = ball.ySpeed * -1;
		}
		ball.xSpeed = newSpeedx;
		ball.ySpeed = newSpeedy;
		ball.increaseBallSpeed(); // Augmenter la vitesse de la balle
	}
	else if (//Joueur 2 droite
		ball.xPos + ball.diameter + ball.xSpeed * 2.5 >= player2.xPos && // La balle est à droite de la raquette
		ball.yPos + ball.diameter > player2.yPos && // La balle est en dessous du haut de la raquette
		ball.yPos < player2.yPos + player2.height // La balle est au-dessus du bas de la raquette
	) {
		ball.xSpeed = ball.xSpeed * -1; // Inverser la direction horizontale de la balle	
		var newSpeedx = ball.xSpeed;
		var newSpeedy = ball.ySpeed;
		if (ball.yPos + ball.diameter / 2 >= player2.yPos && ball.yPos + ball.diameter / 2 < player2.yPos + 40)
		{
			if (ball.ySpeed < 0.0)
			{
				//Angle de deviation de 40 degre
				newSpeedx = ball.xSpeed * Math.cos(Math.PI / 180 * 40) - ball.ySpeed * Math.sin(Math.PI/180 * 40);
				newSpeedy = ball.xSpeed * Math.sin(Math.PI / 180 * 40) + ball.ySpeed * Math.cos(Math.PI/180 * 40);
			}
			else
				newSpeedy = ball.ySpeed * -1;
			alert("sa touche haut");
		}
		else if (ball.yPos + ball.diameter / 2 >= player2.yPos + 40 && ball.yPos + ball.diameter / 2 <= player2.yPos + 80)
			alert("sa touche milieu");
		else if (ball.yPos + ball.diameter / 2 > player2.yPos + 80 && ball.yPos + ball.diameter / 2 <= player2.yPos + 120)
		{	
			alert("sa touche bas");
			if (ball.ySpeed >= 0.0)
			{
				//Angle de deviation de -40 degre
				newSpeedx = ball.xSpeed * Math.cos(Math.PI / 180 * -40) - ball.ySpeed * Math.sin(Math.PI/180 * -40);
				newSpeedy = ball.xSpeed * Math.sin(Math.PI / 180 * -40) + ball.ySpeed * Math.cos(Math.PI/180 * -40);
			}
			else
				newSpeedy = ball.ySpeed * -1;
		}
		ball.xSpeed = newSpeedx;
		ball.ySpeed = newSpeedy;
		ball.increaseBallSpeed(); // Augmenter la vitesse de la balle
	}

	// Gestion des points
	if (ball.xPos + ball.xSpeed * 2.5 < 0) {
		++player2.playerScore;
		ball.resetBall();
	} else if (ball.xPos + 30 + ball.xSpeed * 2.5 > fieldPong.width) {
		++player1.playerScore;
		ball.resetBall();
	}

	// Limites des raquettes
	player1.yPos = Math.max(0, Math.min(fieldPong.canevas.height - player1.height, player1.yPos + player1.ySpeed));
	player2.yPos = Math.max(0, Math.min(fieldPong.canevas.height - player2.height, player2.yPos + player2.ySpeed));

	// Mise à jour de la position de la balle
	ball.xPos += ball.xSpeed * 2.5;
	ball.yPos += ball.ySpeed * 2.5;





	setInterval(() => {
		updateBall();
		drawGame();
	}, 16);
};

main();
