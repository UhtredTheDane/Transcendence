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

    // Vérifie si tous les arguments nécessaires sont fournis
    const args = process.argv.slice(2);
    if (args.length < 5) {
        console.error("Usage: node script.js <tournamentId> <player1> <player2> <score1> <score2>");
        process.exit(1);
    }

    // Récupérer les arguments
    const [tournamentId, player1, player2, score1, score2] = args;

    // Convertir tournamentId et les scores en nombres
    const parsedTournamentId = parseInt(tournamentId);
    const parsedScore1 = parseInt(score1);
    const parsedScore2 = parseInt(score2);

    // Vérifier si tournamentId et les scores sont valides
    if (isNaN(parsedTournamentId) || isNaN(parsedScore1) || isNaN(parsedScore2)) {
        console.error("Invalid tournamentId or scores. They must be valid numbers.");
        process.exit(1);
    }

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Ajoute le match au tournoi
    const addMatchTx = await pongTournament.addMatch(parsedTournamentId, player1, player2, parsedScore1, parsedScore2);
    await addMatchTx.wait();

    console.log(`Match ajouté au tournoi ID ${parsedTournamentId}: ${player1} vs ${player2}, score: ${parsedScore1}-${parsedScore2}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
