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

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Récupère les arguments passés en ligne de commande
    const tournamentId = process.argv[2];
    const playerName = process.argv[3];

    // Vérifie si les paramètres sont fournis
    if (!tournamentId || !playerName) {
        throw new Error("Veuillez fournir un ID de tournoi et le nom d'un joueur");
    }

    // Récupère les matchs du joueur dans le tournoi
    const matches = await pongTournament.getPlayerMatches(tournamentId, playerName);

    if (matches.length === 0) {
        console.log(`Aucun match trouvé pour le joueur ${playerName} dans le tournoi avec ID ${tournamentId}`);
    } else {
        // Affiche chaque match joué par le joueur dans le tournoi
        matches.forEach((match, index) => {
            console.log(`Match ${index + 1}: ${match.player1} vs ${match.player2}, score: ${match.score1}-${match.score2}`);
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
