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
	console.log("Mode: " + mode);
	switch (mode) {
		case "AI":
			window.location.href = '/AIMode/';
	  		break;
		case "Unranked":
			window.location.href = '/MatchMaking/?typegame=UnrankedMode';
			break;
		case "Ranked":
			window.location.href = '/MatchMaking/?typegame=RankedMode';
			break;
		case "Tournament":
			new bootstrap.Modal(document.getElementById('tournamentModal')).show();
			break;
		case "RushMode":
			window.location.href='/MatchMaking/?typegame=RushMode';
			break;
		case "TimerMode":
			window.location.href='/MatchMaking/?typegame=TimerMode';
			break;
		case "MaxScoreMode":
			window.location.href='/MatchMaking/?typegame=MaxScoreMode';
			break;
		case "ChallengeMode":
			window.location.href='MatchMaking/?typegame=ChallengeMode';
			break;
		case "TicTacToe":
			window.location.href='/MatchMaking/?typegame=TicTacToeMode';
			break;
		default:
			console.log("Invalid mode: " + mode);
	}
}

function customMode(mode)
{
	if (mode === 'Custom') 
	{
		new bootstrap.Modal(document.getElementById('customModal')).show();
	}
}

window.customMode = customMode;

window.main = function (mode) {
	setGameMode(mode);
};
