const hardhat = require("hardhat");
const dotenv = require("dotenv");

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();
const { ethers } = hardhat;

async function main() {
    // Récupère l'adresse du contrat depuis les variables d'environnement
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Vérifie si l'adresse du contrat est bien récupérée
    if (!contractAddress) {
        throw new Error("L'adresse du contrat n'est pas définie dans les variables d'environnement");
    }

    // Vérifie si l'ID du tournoi et le nom du joueur ont été passés en paramètres
    const args = process.argv.slice(2);
    if (args.length < 2) {
        throw new Error("Veuillez fournir un ID de tournoi et un nom de joueur en paramètre.");
    }

    // Le premier argument sera l'ID du tournoi, le second sera le nom du joueur
    const tournamentId = parseInt(args[0]);
    const playerName = args[1];

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Récupère les matchs du tournoi
    const matches = await pongTournament.getTournamentMatches(tournamentId);

    if (matches.length === 0) {
        console.log(`Aucun match trouvé pour le tournoi avec ID ${tournamentId}`);
    } else {
        // Filtrer les matchs pour obtenir ceux où le joueur participe
        const playerMatches = matches.filter(match =>
            match.player1 === playerName || match.player2 === playerName
        );

        if (playerMatches.length === 0) {
            console.log(`Aucun match trouvé pour le joueur "${playerName}" dans le tournoi avec ID ${tournamentId}`);
        } else {
            // Affiche chaque match dans lequel le joueur a participé
            playerMatches.forEach((match, index) => {
                const opponent = match.player1 === playerName ? match.player2 : match.player1;
                const playerScore = match.player1 === playerName ? match.score1 : match.score2;
                const opponentScore = match.player1 === playerName ? match.score2 : match.score1;
                console.log(`Match ${index + 1}: ${playerName} vs ${opponent}, score: ${playerScore}-${opponentScore}`);
            });
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
