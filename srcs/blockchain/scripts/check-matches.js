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

    // Vérifie si l'ID du tournoi a été passé en paramètre
    const args = process.argv.slice(2);
    if (args.length === 0) {
        throw new Error("Veuillez fournir un ID de tournoi en paramètre.");
    }

    // Le premier argument sera l'ID du tournoi
    const tournamentId = parseInt(args[0]);

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Récupère les matchs du tournoi
    const matches = await pongTournament.getTournamentMatches(tournamentId);

    if (matches.length === 0) {
        console.log(`Aucun match trouvé pour le tournoi avec ID ${tournamentId}`);
    } else {
        // Affiche chaque match dans le tournoi
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
