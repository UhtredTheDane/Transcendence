import OnlineGame from './OnlineGame.js';

export default class MaxScoreGame extends OnlineGame{

	constructor(fieldValue, mode) {
		super(fieldValue, mode);
        this._player1score = 0;
        this._player2score = 0;
        this._maxscore = 0;
    }
 
    updateScore(playerPoint, aiPoint) {
        playerScore += playerPoint;
        aiScore += aiPoint;
        document.getElementById("playerScore").innerText = playerScore;
        document.getElementById("aiScore").innerText = aiScore;
        let maxScore = parseInt(document.getElementById("maxScore").value);
        if (playerScore >= maxScore || aiScore >= maxScore) {
            let winner = playerScore > aiScore ? "Player1 wins!" : "Player2 wins!";
            alert(winner);
            playerScore = 0;
            aiScore = 0;
            document.getElementById("playerScore").innerText = playerScore;
            document.getElementById("aiScore").innerText = aiScore;
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