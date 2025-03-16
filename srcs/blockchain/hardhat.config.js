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
  .addParam("date", "The date of the match in Unix timestamp") // Ajout du paramètre date
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
    const date = parseInt(taskArgs.date); // Convertir la date en timestamp Unix

    // Ajouter un match au tournoi
    const addMatchTx = await pongTournament.addMatch(tournamentId, taskArgs.player1, taskArgs.player2, score1, score2, date); // Passer la date ici
    await addMatchTx.wait();

    console.log(`Match ajouté au tournoi ID:${tournamentId}, ${taskArgs.player1}, ${taskArgs.player2}, ${score1}, ${score2}, Date: ${date}`);
  });


// Register a custom task to get player matches

task("getPlayerMatches", "Get matches for a player in a tournament")
  .addParam("tournamentid", "The ID of the tournament")
  .addParam("playername", "The name of the player")
  .setAction(async (taskArgs, hre) => {
    const { tournamentid, playername } = taskArgs;
    
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Contract address and name must be updated as per your deployment
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = PongTournament.attach(contractAddress);

    try {
      // Call the function from the contract
      const matches = await pongTournament.getPlayerMatches(tournamentid, playername);

      // Ensure the result is in the expected format
      if (!matches || matches.length === 0) {
        throw new Error('No matches found for this player');
      }

      // Convert the result to JSON
      const matchesJson = matches.map(match => ({
        player1: match.player1,
        player2: match.player2,
        score1: match.score1.toString(),  // Convert BigNumber to string
        score2: match.score2.toString(),  // Convert BigNumber to string
        date: new Date(match.date * 1000).toLocaleString() // Convert Unix timestamp to readable date
      }));

      // Log the result as a JSON string with dates
      console.log(JSON.stringify(matchesJson, null, 2));
    } catch (error) {
      console.error("Error fetching player matches:", error);
      process.exit(1); // Exit with error code
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

    // Format and display the matches with dates
    matches.forEach((match, index) => {
      console.log(`Match ${index + 1}: ${match.player1} vs ${match.player2}, score: ${match.score1.toString()} - ${match.score2.toString()}, Date: ${new Date(match.date * 1000).toLocaleString()}`);
    });
  });


module.exports = {
  solidity: "0.8.20",
};
