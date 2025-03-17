import Launcher from './Launcher.js'
/*
function runTimerModeGame()
{
    let launcher = new Launcher('TimerMode');

    document.addEventListener("keydown", function (event) {
if (launcher.game.isPaused || launcher.game.isGameEnded) return;
if (event.key === "ArrowUp" || event.key === "w" || event.key === "z")
    launcher.game.sendMove(Math.max(0, launcher.game.field.player.yPos - 20));
if (event.key === "ArrowDown" || event.key === "s")
    launcher.game.sendMove(Math.min(launcher.game.field.canevas.height - launcher.game.field.player.height - 20, launcher.game.field.player.yPos + 20));
});
}
*/
//runTimerModeGame();

// Afficher la modale pour Player 1
export function showModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Bloquer l'interaction avec la page
}

// Fermer la modale
export function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Réactiver l'interaction avec la page
}

// Débloquer Player 2 après la validation du timer par Player 1
export function unblockPlayer2() {
    console.log("Player 1 has set the timer. Player 2 can now play.");
    
    // Exemple : Débloquer les boutons ou champs de saisie pour Player 2
    const player2Buttons = document.querySelectorAll('.player2-interactive');
    player2Buttons.forEach(button => {
        button.disabled = false; // Réactiver les éléments interactifs
    });

    // Cacher le message de blocage
    const message = document.getElementById("player2-message");
    message.style.display = "none"; // Masquer le message de blocage
}