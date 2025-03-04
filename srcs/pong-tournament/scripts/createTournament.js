const { ethers } = require("hardhat");

async function main() {
    // Récupérer l'adresse du contrat depuis l'environnement
    const [admin] = await ethers.getSigners();  // Utilise le compte admin

    console.log("Deploying contract with account:", admin.address);

    // Adresse du contrat déployé
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

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
