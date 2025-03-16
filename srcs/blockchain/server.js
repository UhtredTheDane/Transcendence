const express = require("express");
const { exec } = require("child_process");
const app = express();
const port = 3000;

app.use(express.json());

// Create Tournament Endpoint
app.post("/create-tournament", (req, res) => {
  exec("npx hardhat run scripts/createTournament.js --network localhost", (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing create tournament:", err);
      return res.status(500).json({ status: "error", message: "Error executing create tournament" });
    }
    if (stderr) {
      console.error("stderr:", stderr);
      return res.status(500).json({ status: "error", message: stderr });
    }
    console.log("stdout:", stdout);
    res.status(200).json({ status: "success", message: stdout });
  });
});

// Add Match Endpoint
app.post("/add-match", async (req, res) => {
  try {
    const { tournamentid, player1, player2, score1, score2, date } = req.body;

    if (!tournamentid || !player1 || !player2 || !score1 || !score2 || !date) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    // Call the Hardhat script with the received parameters, including the date
    const exec = require("child_process").exec;
    const command = `npx hardhat add-match --tournamentid ${tournamentid} --player1 "${player1}" --player2 "${player2}" --score1 ${score1} --score2 ${score2} --date ${date} --network localhost`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing add match: ${error.message}`);
        return res.status(500).json({ status: "error", message: error.message });
      }
      res.json({ status: "success", message: "Match added successfully", result: stdout });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Failed to add match" });
  }
});



// Check Matches Endpoint
app.get("/checkMatches/:tournamentId", (req, res) => {
  const { tournamentId } = req.params;

  const command = `npx hardhat checkMatches --tournamentid ${tournamentId} --network localhost`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing check matches:", err);
      return res.status(500).json({ status: "error", message: "Error executing check matches" });
    }
    if (stderr) {
      console.error("stderr:", stderr);
      return res.status(500).json({ status: "error", message: stderr });
    }
    console.log("stdout:", stdout);
    res.status(200).json({ status: "success", message: stdout });
  });
});

app.get("/getPlayerMatches/:tournamentId/:playerName", (req, res) => {
  const { tournamentId, playerName } = req.params;

  // Construct the command to execute with npx and Hardhat
  const command = `npx hardhat getPlayerMatches --tournamentid ${tournamentId} --playername "${playerName}" --network localhost`;

  // Execute the command using exec
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({
        status: "error",
        message: "Failed to execute Hardhat task",
        error: error.message,
      });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({
        status: "error",
        message: "Error in Hardhat task execution",
        error: stderr,
      });
    }

    // Parse the output from Hardhat if it's JSON
    try {
      const matches = JSON.parse(stdout);
      return res.json({
        status: "success",
        matches: matches,
      });
    } catch (parseError) {
      console.error("Error parsing Hardhat output:", parseError);
      return res.status(500).json({
        status: "error",
        message: "Error parsing Hardhat task output",
        error: parseError.message,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
