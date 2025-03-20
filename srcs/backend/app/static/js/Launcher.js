import Game from './Game.js';
import OnlineGame from './OnlineGame.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';
import AI from './AI.js';
import TimerGame from './TimerGame.js';
import RushGame from './RushGame.js';
import MaxScoreGame from './MaxScoreGame.js';

export default class Launcher {
    constructor(mode) {
        this._mode = mode;
        this._timerValue = 0.;
        this._idIntervalle = 0.;
        if (this._mode == 'AI' || playerRole == "player1")
        {
            this._player = new Player(0.0, 167.5, '../../static/images/Player1.png');
            this._opponent = new Player(785, 167.5, '../../static/images/Player2.png');
        }
        else
        {
            this._opponent = new Player(0.0, 167.5, '../../static/images/Player1.png');
            this._player = new Player(785, 167.5, '../../static/images/Player2.png');
        }
        this._ball = new Ball(384, 212.5, '../../static/images/Ball.png');
        this._fieldPong = new Field(this._player, this._opponent, this._ball);
        if (this._mode == 'AI')
        {
            this._game = new Game(this._fieldPong);
            this._ai = new AI();
            this._idIntervalle = setInterval(() => {
                this._game.updateBall(this._fieldPong, this._game);
                this._fieldPong.draw();
                this._ai.moveAI(this._fieldPong, this._ball, this._opponent);
            }, 16);
        }
        else
        {
            if (this._mode == 'MaxScoreMode')
                this._game = new MaxScoreGame(this._fieldPong, mode);
            else if (this._mode == 'RushMode')
                this._game = new RushGame(this._fieldPong, mode);
            else
            {
                this._game = new OnlineGame(this._fieldPong, mode);
                this._idIntervalle = setInterval(() => {
                    this._game.updateBall(this._fieldPong, this._game);
                    this._fieldPong.draw();
                    this._game.updateScore();
                }, 16);
            }
        }
        this.initControls();
    }

    initControls()
    {
        let tempoGame = this._game;
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

    get mode() {
		return this._mode;
	}

	set mode(value) {
		this._mode = value;
	}

    get timerValue() {
		return this._timerValue;
	}

	set timerValue(value) {
		this.timerValue = value;
	}

    get player() {
		return this._player;
	}

	set player(value) {
		this._player = value;
	}

    get opponent() {
		return this._opponent;
	}

	set opponent(value) {
		this._opponent = value;
	}

    get game() {
		return this._game;
	}

	set game(value) {
		this._game = value;
	}

    get ball() {
		return this._ball;
	}

	set ball(value) {
		this._ball = value;
	}

    get idIntervalle() {
		return this._idIntervalle;
	}

	set idIntervalle(value) {
		this._idIntervalle = value;
	}

    get fieldPong() {
		return this._fieldPong;
	}

	set fieldPong(value) {
		this._fieldPong = value;
	}

}
