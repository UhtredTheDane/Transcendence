import OnlineGame from './OnlineGame.js';

export default class TimerGame extends OnlineGame{

	constructor(fieldValue, mode, timerValue) {
		super(fieldValue, mode);
        this._timer = timerValue;
        this.startTimer()
    }

    startTimer() {
        this._intervalId = setInterval(() => {
            if (this._timer > 0) {
                this._timer--;
                console.log("Time left: " + this._timer + " seconds");
            } else {
                this.endGame();  
                clearInterval(this._intervalId);
                console.log("Game over!");
            }
        }, 1000);
    }
    get time() {
		return this._timer;
	}

	set time(value) {
		this._timer = value;
    }
}
