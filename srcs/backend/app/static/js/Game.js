import Field from './field.js';
import Player from './player.js';

export default class Game {

	constructor(fieldValue) {
		this.socket = new WebSocket("ws://" + window.location.host + "/ws/game/" + gameId + "/");
		this.field = fieldValue;
		this.isPaused = false;
		this.isSocketOpen = false;
		this.isBallMover = false;
		this.isGameEnded = false;
		this.#initOnOpen();
		this.#initOnClose();
		this.initOnMessage();	
	}

	#initOnOpen() {
		let tempoGame = this;
		this.socket.onopen = function () {
			console.log("Connecté au WebSocket du jeu");
			tempoGame.isSocketOpen = true;
		};
	}

	#initOnClose() {
		let tempoGame = this;
		this.socket.onclose = function() {
			console.log("WebSocket fermé");
			tempoGame.isSocketOpen = false;
		};
	}

	initOnMessage() {
		let tempoGame = this;
		this.socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			if (data.type === "update_position") {
				if (data.player === "player1") {
					if (playerRole === "player1") tempoGame.field.player.yPos = data.position;
					else tempoGame.field.opponent.yPos = data.position;
				} else {
					if (playerRole === "player2") tempoGame.field.player.yPos = data.position;
					else tempoGame.field.opponent.yPos = data.position;
				}
			} else if (data.type === "update_ball_position") {
				tempoGame.field.ball.xPos = data.ball_x;
				tempoGame.field.ball.yPos = data.ball_y;
			} else if (data.type === "update_game_score") {
				tempoGame.field.player.playerScore = data.score_player1;
				tempoGame.field.opponent.playerScore = data.score_player2;
			} else if (data.type === "update_pause") {
				tempoGame.isPaused = data.is_paused;
				if (tempoGame.isPaused)
					document.getElementById("pauseButton").innerText = "Play";
				else
					document.getElementById("pauseButton").innerText = "Pause";
			} else if (data.type === "game_state") {
					tempoGame.field.player.yPos = data.player1_y;
					tempoGame.field.opponent.yPos = data.player2_y;
					tempoGame.field.ball.xPos = data.ball_x;
					tempoGame.field.ball.yPos = data.ball_y;
					tempoGame.isBallMover = (playerRole === "player1");
			} else if (data.type === "game_over") {
				document.getElementById("pauseButton").display = "none";
				window.location.href = "/";
			}
			tempoGame.field.draw();
		};
	}

	get field() {
		return this._field;
	}
	set field(value)
	{
		this._field = value;
	}
	get socket() {
		return this._socket;
	}

	set socket(value) {
		this._socket = value;
	}

	get isBallMover() {
		return this._isBallMover;
	}

	set isBallMover(value) {
		this._isBallMover = value;
	}

	get isGameEnded() {
		return this._isGameEnded;
	}

	set isGameEnded(value) {
		this._isGameEnded = value;
	}

	get isSocketOpen() {
		return this._isSocketOpen;
	}

	set isSocketOpen(value) {
		this._isSocketOpen = value;
	}

	get isPaused() {
		return this._isPaused;
	}

	set isPaused(value) {
		this._isPaused = value;
	}

	togglePauseGame() {
		this._isPaused = !this._isPaused;
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "pause", is_paused: this._isPaused }));
	}

	updateBall() {
		if (this._isPaused || this._isGameEnded)
			return;
		if (this._isBallMover)
			this._field.ball.updateBall(this._field, this);
	}

	sendBallPosition() {
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "ball", ball_x: this._field.ball.xPos, ball_y: this._field.ball.yPos }));
	}

	sendUpdateGameScore() {
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "score", score_player1: this._field.player.playerScore, score_player2: this._field.opponent.playerScore }));
	}

	endGame() {
		this._isGameEnded = true;
		if (this._isSocketOpen && this._socket.readyState === WebSocket.OPEN)
			this._socket.send(JSON.stringify({ type: "end", score_player1: this._field.player.playerScore, score_player2: this._field.opponent.playerScore }));
		document.getElementById("pauseButton").display = "none";
		if (this._field.getWinner())
			alert("Vous avez gagné !")
		else
			alert("Vous avez perdu !");
		window.location.href = "/";
	}

	sendMove(position) {
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "move", position: position }));
	}

	makeMove(position) {
		if (this._isGameEnded)
			return;
		this._field.player.yPos = position;
	}


}
