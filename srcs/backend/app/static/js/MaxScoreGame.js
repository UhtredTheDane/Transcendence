import OnlineGame from './OnlineGame.js';

export default class MaxScoreGame extends OnlineGame{

	constructor(fieldValue, mode, maxScoreValue) {
		super(fieldValue, mode);
        this._maxscore = maxScoreValue;
        this.initOnMessage();	
    }
 
    updateScore() {
      let playerScore = this.field.player.playerScore;
      let opponentScore = this.field.opponent.playerScore;
      if (playerScore == this._maxscore || opponentScore == this._maxScore) {
        console.log("playerScore: ", playerScore);
        console.log("opponentScore: ", opponentScore);
        console.log("MaxScore: ", this._maxscore);
        console.log("game will end now");
        this.endGame();
      }
    }

    
  get player1score() {
		return this._maxscore;
	}

	set player1score(value) {
		this._maxscore = value;
    }


    get player2score() {
		return this._maxscore;
	}

	set player2score(value) {
		this._maxscore = value;
    }

    get maxscore() {
		return this._maxscore;
	}

	set maxscore(value) {
		this._maxscore = value;
    }
}