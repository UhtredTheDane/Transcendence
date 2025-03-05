import Field from './field.js';

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
		this.#initOnMessage();
	}

	#initOnOpen() {
		this.socket.onopen = function () {
			console.log("Connecté au WebSocket du jeu");
			this._isSocketOpen = true;
		};
	}

	#initOnClose() {
		this.socket.onclose = function() {
			console.log("WebSocket fermé");
			this._isSocketOpen = false;
		};
	}

	#initOnMessage() {
		this.socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			//if (data.type !== "update_ball_position" && data.type !== "update_position")
			//	console.log("Message reçu :", data);
			if (data.type === "update_position") {
				if (data.player === "player1") {
					if (this._playerRole === "player1") this._field.player.yPos = data.position;
					else this._field.opponent.yPos = data.position;
				} else {
					if (this._playerRole === "player2") this._field.player.yPos = data.position;
					else this._field.opponent.yPos = data.position;
				}
			} else if (data.type === "update_ball_position") {
				this._field.ball.xPos = data.ball_x;
				this._field.ball.yPos = data.ball_y;
			} else if (data.type === "update_game_score") {
				this._field.player.playerScore = data.score_player1;
				this._field.opponent.playerScore = data.score_player2;
			} else if (data.type === "update_pause") {
				this._isPaused = data.is_paused;
				if (this._isPaused) {
					document.getElementById("pauseButton").innerText = "Play";
				} else {
					document.getElementById("pauseButton").innerText = "Pause";
				}
			} else if (data.type === "game_state") {
				this._field.player.yPos = data.player1_y;
				this._field.opponent.yPos = data.player2_y;
				this._field.ball.xPos = data.ball_x;
				this._field.ball.yPos = data.ball_y;
				this._isBallMover = (this._playerRole === "player1");
			} else if (data.type === "game_over") {
				document.getElementById("pauseButton").display = "none";
				//alert(playerRole == getWinner() ? "Vous avez gagné !" : "Vous avez perdu !");
				//setTimeout(() => {
				window.location.href = "/";
				//}, 4000);
			}
			this._field.draw();
		};
	}

	static get gameId() {
		return this._gameId;
	}

	static get playerRole() {
		return this._playerRole;
	}

	static get socket() {
		return this._socket;
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
		alert(playerRole == this._field.getWinner() ? "Vous avez gagné !" : "Vous avez perdu !");
		window.location.href = "/";
	}

	sendMove(position) {
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "move", position: position }));
	}

}
