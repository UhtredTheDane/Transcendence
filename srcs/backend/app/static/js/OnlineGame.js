import Game from './Game.js';

export default class OnlineGame extends Game{

	constructor(fieldValue, mode) {
		super(fieldValue);
		this.socket = new WebSocket("wss://" + window.location.host + "/wss/" + mode + "/" + gameId + "/");

		this.isSocketOpen = false;
		this.isBallMover = false;
		this.#initOnOpen();
		this.#initOnClose();
		this.initOnMessage();
		this.initControls();
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
			} else if (data.type === "game_over")
			{
				tempoGame.socket.close(1000, "Fermeture normale");
				window.location.href = "/";
				return;
			}

			tempoGame.field.draw();
		};
	}

	initControls()
    {
        let tempoGame = this;
        if (playerRole == 'player1')
            {
                document.addEventListener("keydown", function (event) {
                if (tempoGame.isPaused || tempoGame.isGameEnded) return;
                if (event.key === "w" || event.key === "z")
                    tempoGame.sendMove(Math.max(0, tempoGame.field.player.yPos - 20), "player1");
                if (event.key === "s")
                    tempoGame.sendMove(Math.min(tempoGame.field.canevas.height - tempoGame.field.player.height - 20, tempoGame.field.player.yPos + 20), "player1");
                if (event.key === "ArrowUp")
                    tempoGame.sendMove(Math.max(0, tempoGame.field.opponent.yPos - 20), "player2");
                if (event.key === "ArrowDown")
                    tempoGame.sendMove(Math.min(tempoGame.field.canevas.height - tempoGame.field.opponent.height - 20, tempoGame.field.opponent.yPos + 20), "player2");
                });
            }
           else if (playerRole == 'player2')
                {
                    document.addEventListener("keydown", function (event) {
                    if (tempoGame.isPaused || tempoGame.isGameEnded) return;
                    if (event.key === "ArrowUp")
                        tempoGame.sendMove(Math.max(0, tempoGame.field.player.yPos - 20), "player2");
                    if (event.key === "ArrowDown")
                        tempoGame.sendMove(Math.min(tempoGame.field.canevas.height - tempoGame.field.player.height - 20, tempoGame.field.player.yPos + 20), "player2");
                    if (event.key === "w" || event.key === "z")
                        tempoGame.sendMove(Math.max(0, tempoGame.field.opponent.yPos - 20), "player1");
                    if (event.key === "s")
                        tempoGame.sendMove(Math.min(tempoGame.field.canevas.height - tempoGame.field.opponent.height - 20, tempoGame.field.opponent.yPos + 20), "player1");
                    });
                }
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

	get isSocketOpen() {
		return this._isSocketOpen;
	}

	set isSocketOpen(value) {
		this._isSocketOpen = value;
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
		{
			this._field.ball.updateOnlineBall(this._field, this);
		}
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

	updateScore() {
        let playerScore = this.field.player.playerScore;
        let opponentScore = this.field.opponent.playerScore;
        if (playerScore >= this.maxScore || opponentScore >= this.maxScore) {
        //   console.log("playerScore: ", playerScore);
        //   console.log("opponentScore: ", opponentScore);
        //   console.log("MaxScore: ", this.maxScore);
        //   console.log("game will end now");
          this.endGame();
        }
      }


	endGame() {
		this._isGameEnded = true;
		if (this._isSocketOpen && this._socket.readyState === WebSocket.OPEN)
		{
			this._socket.send(JSON.stringify({ type: "end", score_player1: this._field.player.playerScore, score_player2: this._field.opponent.playerScore }));
			window.location.href = "/";
		}
	}

	sendMove(position, targetPlayer) {
		if (this._isGameEnded || !this._isSocketOpen || this._socket.readyState !== WebSocket.OPEN)
			return;
		this._socket.send(JSON.stringify({ type: "move", position: position, player: targetPlayer }));
	}
}
