import Launcher from './Launcher.js'

function runMaxScoreModeGame()
{
    let launcher = new Launcher('MaxScoreMode');

    document.addEventListener("keydown", function (event) {
    if (launcher.game.isPaused || launcher.game.isGameEnded) return;
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "z")
        launcher.game.sendMove(Math.max(0, launcher.game.field.player.yPos - 20));
    if (event.key === "ArrowDown" || event.key === "s")
        launcher.game.sendMove(Math.min(launcher.game.field.canevas.height - launcher.game.field.player.height - 20, launcher.game.field.player.yPos + 20));
    });

}

runMaxScoreModeGame();