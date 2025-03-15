import OnlineGame from './OnlineGame.js';

export default class TimerGame extends OnlineGame{

	constructor(fieldValue, mode) {
		super(fieldValue, mode);
        this._timer = 60;

    }

    startTimer() {
        let timer = this._timer;
        clearInterval(timer);
        let timeLeft = parseInt(document.getElementById("timeInput").value);
        document.getElementById("timeDisplay").textContent = `Time Left: ${timeLeft}s`;

        timer = setInterval(() => {
            timeLeft--;
            document.getElementById("timeDisplay").textContent = `Time Left: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert("Time's up!");
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
