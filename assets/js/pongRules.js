const canvas = document.getElementById("rulePongCanvas");
const ctx = canvas.getContext("2d");

let paddleWidth = 10, paddleHeight = 80;
let ballSize = 10;
let ballX, ballY, ballSpeedX, ballSpeedY;
let leftPaddleY, rightPaddleY;
let leftScore = 0, rightScore = 0;
let gameActive = false;

function resetGame() {
	ballX = canvas.width / 2;
	ballY = canvas.height / 2;
	ballSpeedX = (Math.random() > 0.5 ? 4 : -4);
	ballSpeedY = (Math.random() > 0.5 ? 3 : -3);
	leftPaddleY = (canvas.height - paddleHeight) / 2;
	rightPaddleY = (canvas.height - paddleHeight) / 2;
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black"; // Ball and paddles in black to stand out on white
	ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - 20, rightPaddleY, paddleWidth, paddleHeight);
	ctx.fillRect(ballX, ballY, ballSize, ballSize);
	document.getElementById("leftScore").textContent = leftScore;
	document.getElementById("rightScore").textContent = rightScore;
}

function update() {
	if (!gameActive) return;

	ballX += ballSpeedX;
	ballY += ballSpeedY;

	if (ballY <= 0 || ballY + ballSize >= canvas.height) ballSpeedY *= -1;

	if (ballX <= 20) {
		if (ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
			ballSpeedX *= -1;
		} else {
			rightScore++;
			resetGame();
		}
	}

	if (ballX + ballSize >= canvas.width - 20) {
		if (ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
			ballSpeedX *= -1;
		} else {
			leftScore++;
			resetGame();
		}
	}

	leftPaddleY += (ballY - (leftPaddleY + paddleHeight / 2)) * 0.1;
}

function checkWinner() {
	if (leftScore >= 5 || rightScore >= 5) {
		gameActive = false;
		document.getElementById("leftScore").textContent = leftScore >= 5 ? "Winner!" : "Loser!";
		document.getElementById("rightScore").textContent = rightScore >= 5 ? "Winner!" : "Loser!";
		setTimeout(() => {
			leftScore = 0;
			rightScore = 0;
			resetGame();
			document.getElementById("leftScore").textContent = "0";
			document.getElementById("rightScore").textContent = "0";
			gameActive = true;
		}, 3000);
	}
}

function gameLoop() {
	update();
	draw();
	checkWinner();
	requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mouseenter", () => {
	if (!gameActive) {
		gameActive = true;
	}
});

canvas.addEventListener("mousemove", (event) => {
	const rect = canvas.getBoundingClientRect();
	rightPaddleY = event.clientY - rect.top - paddleHeight / 2;
	rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
});

canvas.addEventListener("mouseleave", () => {
	gameActive = false;
});

resetGame();
gameLoop();