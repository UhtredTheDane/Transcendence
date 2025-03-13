import Game from './OnlineGame.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';

function redirectToProfile() {
	window.location.href = "/ProfilePage";
}

function runAIGame()
{
	let player = new Player(0.0, 167.5, '../../media/textures/Player1.png');
	let opponent = new Player(785, 167.5, '../../media/textures/Player2.png');

	let ball = new Ball(384, 212.5, '../../media/textures/Ball.png');
	let fieldPong = new Field(player, opponent, ball);
	let game = new Game(fieldPong);

	document.addEventListener("keydown", function (event) {
	if (game.isPaused || game.isGameEnded) return;
	if (event.key === "ArrowUp" || event.key === "w" || event.key === "z")
		game.makeMove(Math.max(0, game.field.player.yPos - 10));
	if (event.key === "ArrowDown" || event.key === "s")
			game.makeMove(Math.min(game.field.canevas.height - game.field.player.height, game.field.player.yPos + 10));
	});

	setInterval(() => {
		game.updateBall(fieldPong, game);
		fieldPong.draw();
	}, 16);
}





function setGameMode(mode) {
	document.getElementById('selectedMode').textContent = "Current Mode: " + mode;
	console.log("sa passe la cool;", window.location.href);
	switch (mode) {
		case "AI":
			window.location.href = '/AIMode/';
	  		break;
		case "Unranked":
			window.location.href = '/UnrankedMode/';
			break;
		case "Ranked":
			window.location.href = '/RankedMode/';
			break;
		case "Tournament":
			new bootstrap.Modal(document.getElementById('tournamentModal')).show();
			break;
		case "RushMode":
			window.location.href='/RushMode/';
			break;
		case "TimerMode":
			window.location.href='/TimerMode/';
			break;
		default:
			window.location.href='/MaxScoreMode/';
	}
}

function customMode(mode)
{
	if (mode === 'Custom') 
	{
		// Open Custom Mode Modal for options
		new bootstrap.Modal(document.getElementById('customModal')).show();
	}
}

window.customMode = customMode;

window.main = function (mode) {
	setGameMode(mode);

/*

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
	*/
};
