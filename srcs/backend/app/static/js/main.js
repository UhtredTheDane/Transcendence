import Game from './OnlineGame.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';

function redirectToProfile() {
	window.location.href = "/ProfilePage";
}

function setGameMode(mode) {
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
