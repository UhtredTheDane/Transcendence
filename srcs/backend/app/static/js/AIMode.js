import Game from './AIGame.js';
import Field from './field.js';
import Player from './player.js';
import Ball from './ball.js';

function runAIGame()
{
    let player = new Player(0.0, 167.5, '../static/images/Player1.png');
    let opponent = new Player(785, 167.5, '../static/images/Player2.png');

    let ball = new Ball(384, 212.5, '../static/images/Ball.png');
    let fieldPong = new Field(player, opponent, ball);
    let game = new Game(fieldPong);

    document.addEventListener("keydown", function (event) {
    if (game.isPaused || game.isGameEnded) return;
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "z")
        game.makeMove(Math.max(0, game.field.player.yPos - 10));
    if (event.key === "ArrowDown" || event.key === "s")
            game.makeMove(Math.min(game.field.canevas.height - game.field.player.height, game.field.player.yPos + 10));
    });

    setInterval(() => {
        game.updateBall(fieldPong, game);
        fieldPong.draw();
    }, 16);
}

runAIGame();