import Game from './Game.js';
import OnlineGame from './OnlineGame.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';
import AI from './AI.js';

export default class Launcher {
    constructor(mode) {
        this._mode = mode;
        if (this._mode || playerRole == "player1")
        {
                this._player = new Player(0.0, 167.5, '../../static/images/Player1.png');
                this._opponent = new Player(785, 167.5, '../../static/images/Player2.png');
        }
        else
        {
            this._opponent = new Player(0.0, 167.5, '../../static/images/Player1.png');
            this._player = new Player(785, 167.5, '../../static/images/Player2.png');
        }
        this._ball = new Ball(384, 212.5, '../static/images/Ball.png');
        this._fieldPong = new Field(this._player, this._opponent, this._ball);
        if (this._mode == 'AI')
        {
            this._game = new Game(this._fieldPong);
            this._ai = new AI();
            setInterval(() => {
                this._game.updateBall(this._fieldPong, this._game);
                this._fieldPong.draw();
                this._ai.moveAI(this._fieldPong, this._ball, this._opponent);
            }, 16);
        }
        else
        {
            this._game = new OnlineGame(this._fieldPong);
            setInterval(() => {
                this._game.updateOnlineBall(this._fieldPong, this._game);
                this._fieldPong.draw();
            }, 16);
        }
    }

    get mode() {
		return this._mode;
	}

	set mode(value) {
		this._mode = value;
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

    get fieldPong() {
		return this._fieldPong;
	}

	set fieldPong(value) {
		this._fieldPong = value;
	}

}
