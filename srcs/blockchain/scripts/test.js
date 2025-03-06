const hardhat = require("hardhat");
const dotenv = require("dotenv");

dotenv.config();
const { ethers } = hardhat;

async function main() {
    // Récupère l'adresse du contrat depuis le fichier .env
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Vérifie si l'adresse du contrat est bien récupérée
    if (!contractAddress) {
        throw new Error("L'adresse du contrat n'est pas définie dans le fichier .env");
    }

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Créer le tournoi
    const tournamentName = "World Pong Championship";
    console.log(`Création du tournoi: ${tournamentName}`);

    // Envoie de la transaction pour créer le tournoi
    const tx = await pongTournament.createTournament(tournamentName);
    await tx.wait();  // Attend que la transaction soit confirmée

    console.log("Tournoi créé avec succès.");

    // Optionnel : récupération du tournoi
    const tournamentId = 1;  // ID du tournoi créé
    try {
        const tournament = await pongTournament.getTournament(tournamentId);
        console.log(`Tournoi récupéré: ${tournament.name}`);
    } catch (error) {
        console.error("Erreur lors de la récupération du tournoi:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
