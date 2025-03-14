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

task("getPlayerMatches", "Fetches all matches of a specific player in a tournament")
  .addParam("tournamentid", "The ID of the tournament")
  .addParam("playername", "The name of the player")
  .setAction(async (taskArgs) => {
    const { tournamentid, playername } = taskArgs;

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("Contract address is not set in environment variables.");
    }

    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    // Fetch the matches of the tournament
    const matches = await pongTournament.getTournamentMatches(tournamentid);

    if (matches.length === 0) {
        console.log(`No matches found for tournament with ID ${tournamentid}`);
    } else {
        // Filter matches by the player's name
        const playerMatches = matches.filter(
            (match) => match.player1 === playername || match.player2 === playername
        );

        if (playerMatches.length === 0) {
            console.log(`No matches found for player ${playername} in tournament ID ${tournamentid}`);
        } else {
            // Display each match for the player
            playerMatches.forEach((match, index) => {
                console.log(`Match ${index + 1}: ${match.player1} vs ${match.player2}, score: ${match.score1}-${match.score2}`);
            });
        }
    }
  });

  // Register custom Hardhat task to check matches
  task("checkMatches", "Get matches for a specific tournament")
    .addParam("tournamentid", "The tournament ID")
    .setAction(async ({ tournamentid }) => {
      // Load contract address from environment variables
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not set in the environment");
      }
  
      // Attach to the contract
      const PongTournament = await ethers.getContractFactory("PongTournament");
      const pongTournament = PongTournament.attach(contractAddress);
  
      // Fetch tournament matches
      const matches = await pongTournament.getTournamentMatches(tournamentid);
  
      // Check if matches exist
      if (matches.length === 0) {
        console.log(`No matches found for tournament ID ${tournamentid}`);
        return;
      }
  
      // Format and display the matches
      matches.forEach((match, index) => {
        console.log(`Match ${index + 1}: ${match.player1} vs ${match.player2}, score: ${match.score1.toString()} - ${match.score2.toString()}`);
      });
    });

module.exports = {
  solidity: "0.8.20",
};
