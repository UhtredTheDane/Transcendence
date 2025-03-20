import OnlineGame from './OnlineGame.js';
import {showModal} from './TimerMode.js';
import {closeModal} from './TimerMode.js';

export default class RushGame extends OnlineGame{

	constructor(fieldValue, mode) {
		super(fieldValue, mode);

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
            if (data.type === "update_speed")
            {
                tempoGame.field.ball.multSpeed = data.speed;
                tempoGame.field.ball.resetBall();
                if (playerRole == "player2")
                    tempoGame.disableInteractions(false);
                if (!tempoGame.idIntervalle)
                {
                    tempoGame.idIntervalle = setInterval(() => {
                        tempoGame.updateBall(tempoGame.field, this);
                        tempoGame.field.draw();
                        tempoGame.updateScore();
                    }, 16);
                }
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
				window.location.href = "/";
			}
			    tempoGame.field.draw();
        };
        
        // Vérifier le rôle du joueur (est-ce que c'est player1 ?)
        if (playerRole === "player1") {
            // Empêcher l'interaction avec le reste de la page jusqu'à ce que player1 valide
            showModal();
        } else {
            this.disableInteractions(true);
        }

        // Fermer la modale si l'utilisateur clique sur le X
        closeBtn.onclick = (event) => {
            const modal = document.getElementById("modal");
            if (event.target === modal) {
                closeModal();
            }
        };
        
        // Empeche la Fermeture de la modale si l'utilisateur clique en dehors de la modale
        window.onclick = (event) => {
            if (event.target === modal) {

            }
        };
        
        let tempoSocket = this.socket;
        // Gérer l'envoi du formulaire de timer
        submitBtn.onclick = () => {
            const speedValue = document.getElementById("customValue").value;
            if (speedValue && speedValue > 0 && speedValue < 15) {
                // Envoyer le timer au serveur via WebSocket
                tempoSocket.send(JSON.stringify({
                    type: 'set_speed_success',
                    speed: speedValue,
                    gameId: gameId
                }));
				tempoGame.field.ball.multSpeed = speedValue;
                closeModal();
            } else {
                alert("Veuillez entrer une vitesse valide.");
            }
        };
    }

	updateSpeed() {
		this.field.ball.multSpeed = this.speed;
	}

    get speed() {
		return this._speed;
	}

	set speed(value) {
		this._speed = value;
    }

    disableInteractions(disable) {
        // Désactiver tous les éléments interactifs (boutons, liens, etc.)
        const elements = document.querySelectorAll('button, a, input, select, textarea');
        elements.forEach((element) => {
            element.disabled = disable; // Désactive ou active les éléments
        });

        // Désactiver tout autre élément qui pourrait être interactif
        if (disable) {
            document.body.style.pointerEvents = "none"; // Empêche tout clic sur la page
        } else {
            document.body.style.pointerEvents = "auto"; // Réactive les clics
        }
    }
}