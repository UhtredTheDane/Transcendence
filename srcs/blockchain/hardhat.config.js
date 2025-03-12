require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://localhost:8545",  // Make sure this URL is correct for your setup
    },
  },
};

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // Add dotenv to load environment variables from .env

task("add-match", "Adds a match to a tournament")
  .addParam("tournamentid", "The tournament ID")
  .addParam("player1", "The name of player 1")
  .addParam("player2", "The name of player 2")
  .addParam("score1", "The score of player 1")
  .addParam("score2", "The score of player 2")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    // Récupère l'adresse du contrat depuis les variables d'environnement
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
        throw new Error("L'adresse du contrat n'est pas définie dans le fichier .env");
    }

    // Initialise le contrat avec l'adresse déployée
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Convertir les paramètres en nombres
    const tournamentId = parseInt(taskArgs.tournamentid);
    const score1 = parseInt(taskArgs.score1);
    const score2 = parseInt(taskArgs.score2);

    // Ajouter un match au tournoi
    const addMatchTx = await pongTournament.addMatch(tournamentId, taskArgs.player1, taskArgs.player2, score1, score2);
    await addMatchTx.wait();

    console.log(`Match ajouté au tournoi ID ${tournamentId}: ${taskArgs.player1} vs ${taskArgs.player2}, score: ${score1}-${score2}`);
  });

module.exports = {
  solidity: "0.8.20",
};
