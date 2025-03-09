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

    // Spécifie l'ID du tournoi auquel ajouter le match (par exemple, tournoi ID 1)
    const tournamentId = 1;

    // Spécifie les détails du match (noms des joueurs et scores)
    const player1 = "Alice";
    const player2 = "Bob";
    const score1 = 21;
    const score2 = 15;

    // Ajoute le match au tournoi
    const addMatchTx = await pongTournament.addMatch(tournamentId, player1, player2, score1, score2);
    await addMatchTx.wait();

    console.log(`Match ajouté au tournoi ID ${tournamentId}: ${player1} vs ${player2}, score: ${score1}-${score2}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
