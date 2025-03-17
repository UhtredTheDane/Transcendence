import OnlineGame from './OnlineGame.js';
import {closeModal} from './TimerMode.js';
import {unblockPlayer2} from './TimerMode.js';
import {showModal} from './TimerMode.js';

export default class TimerGame extends OnlineGame {
    constructor(fieldValue, mode) {
        super(fieldValue, mode);
        this._timer = 0;
        this._intervalId = 0;

        // Élément de la modale
        const modal = document.getElementById("modal");
        const closeBtn = document.getElementById("closeBtn");
        const submitBtn = document.getElementById("submitBtn");
        const playerNameInput = document.getElementById("customValue");
        
        let tempoGame = this;

        // Gérer l'événement de réception de messages du serveur
        this.socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.type === "update_timer")
            {
                tempoGame.timer = data.timer;
                console.log("player: " + playerRole + " et timer: " + tempoGame.timer)
            }
            else if (data.type === "update_position") {
				if (data.player === "player1") {
					if (playerRole === "player1") tempoGame.field.player.yPos = data.position;
					else tempoGame.field.opponent.yPos = data.position;
				} else {
					if (playerRole === "player2") tempoGame.field.player.yPos = data.position;
					else tempoGame.field.opponent.yPos = data.position;
				}
			} else if (data.type === "update_ball_position") {
				tempoGame.field.ball.xPos = data.ball_x;
				tempoGame.field.ball.yPos = data.ball_y;
			} else if (data.type === "update_game_score") {
				tempoGame.field.player.playerScore = data.score_player1;
				tempoGame.field.opponent.playerScore = data.score_player2;
			} else if (data.type === "update_pause") {
				tempoGame.isPaused = data.is_paused;
				if (tempoGame.isPaused)
					document.getElementById("pauseButton").innerText = "Play";
				else
					document.getElementById("pauseButton").innerText = "Pause";
			} else if (data.type === "game_state") {
					tempoGame.field.player.yPos = data.player1_y;
					tempoGame.field.opponent.yPos = data.player2_y;
					tempoGame.field.ball.xPos = data.ball_x;
					tempoGame.field.ball.yPos = data.ball_y;
					tempoGame.isBallMover = (playerRole === "player1");
			} else if (data.type === "game_over") {
				//document.getElementById("pauseButton").display = "none";
				window.location.href = "/";
			}
			    tempoGame.field.draw();
        };
        
        // Vérifier le rôle du joueur (est-ce que c'est player1 ?)
        if (playerRole === "player1") {
            // Empêcher l'interaction avec le reste de la page jusqu'à ce que player1 valide
            showModal();
        } else {
            // Bloquer l'interaction de player2 tant que player1 n'a pas validé
        }
        // Fermer la modale si l'utilisateur clique sur le X
        closeBtn.onclick = (event) => {
            const modal = document.getElementById("modal");
            if (event.target === modal) {
                closeModal();
            }
        };
        
        // Fermer la modale si l'utilisateur clique en dehors de la modale
        window.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
        
        let tempoSocket = this.socket;
        // Gérer l'envoi du formulaire de timer
        submitBtn.onclick = () => {
            const timerValue = document.getElementById("customValue").value;
            if (timerValue && timerValue > 0) {
                console.log("gogo")
                // Envoyer le timer au serveur via WebSocket
                tempoSocket.send(JSON.stringify({
                    type: 'set_timer_success',
                    timer: timerValue,
                    gameId: gameId
                }));
                tempoGame.timer = timerValue;
                // Afficher un message de confirmation et fermer la modale
                alert("Timer envoyé : " + tempoGame.timer);
                closeModal();
            } else {
                alert("Veuillez entrer un timer valide.");
            }
        };
    }

    // Bloquer Player 2 (empêche l'interaction avec l'interface de jeu)
    /*blockPlayer2() {
        console.log("Player 2 is blocked, waiting for Player 1...");
        
        // Exemple : Bloquer des boutons ou champs de saisie pour Player 2
        const player2Buttons = document.querySelectorAll('.player2-interactive');
        player2Buttons.forEach(button => {
            button.disabled = true; // Désactiver les boutons ou autres éléments interactifs
        });

        // Afficher un message pour informer Player 2 qu'il doit attendre
        const message = document.getElementById("player2-message");
        message.innerText = "En attente de la validation de Player 1...";
        message.style.display = "block"; // Afficher le message de blocage
    }*/

    get timer() {
		return this._timer;
	}


	set timer(value) {
		this._timer = value;
    }

}
   /* startTimer() {
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
    }*/
