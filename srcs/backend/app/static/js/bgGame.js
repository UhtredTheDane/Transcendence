const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

function adjustCanvasSize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 48;
}

adjustCanvasSize();
window.onresize = adjustCanvasSize;

let paddleWidth = 10, paddleHeight = 80;
let ballSize = 10;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 3;
let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - 20, rightPaddleY, paddleWidth, paddleHeight);
	ctx.fillRect(ballX, ballY, ballSize, ballSize);
}

function update() {
	ballX += ballSpeedX;
	ballY += ballSpeedY;
	if (ballY <= 0 || ballY + ballSize >= canvas.height) ballSpeedY *= -1;
	if (ballX <= 20 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ballSpeedX *= -1;
	if (ballX + ballSize >= canvas.width - 20 && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) ballSpeedX *= -1;
	if (ballX <= 0 || ballX + ballSize >= canvas.width) ballX = canvas.width / 2, ballY = canvas.height / 2;
	leftPaddleY = ballY - paddleHeight / 2;
	rightPaddleY = ballY - paddleHeight / 2;
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}
gameLoop();