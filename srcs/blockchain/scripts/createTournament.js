const { ethers } = require("hardhat");
const dotenv = require("dotenv");

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

async function main() {
    // Récupérer le compte admin
    const [admin] = await ethers.getSigners();  // Utilise le compte admin
    console.log("Deploiement du contrat avec:", admin.address);

    // Adresse du contrat récupérée depuis la variable d'environnement
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS n'est pas défini dans les variables d'environnement");
    }

    console.log("Adresse du contrat utilisé:", contractAddress);

    // Récupérer le contrat déjà déployé
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = await PongTournament.attach(contractAddress);

    // Créer un tournoi
    const tournamentName = "World Pong Championship";
    console.log("Création du tournoi:", tournamentName);
    const tx = await pongTournament.createTournament(tournamentName);
    
    // Attendre la confirmation de la transaction
    await tx.wait();

    // Vérifier si le tournoi a bien été créé
    const tournament = await pongTournament.getTournament(1);  // Récupère le tournoi avec ID 1
    console.log("Tournoi créé:", tournament);
}

// Lancer la fonction main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
