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
app.post("/add-match", (req, res) => {
  const { tournamentId, player1, player2, score1, score2 } = req.body;

  const command = `npx hardhat add-match --tournamentid ${tournamentId} --player1 "${player1}" --player2 "${player2}" --score1 ${score1} --score2 ${score2} --network localhost`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing add match:", err);
      return res.status(500).json({ status: "error", message: "Error executing add match" });
    }
    if (stderr) {
      console.error("stderr:", stderr);
      return res.status(500).json({ status: "error", message: stderr });
    }
    console.log("stdout:", stdout);
    res.status(200).json({ status: "success", message: stdout });
  });
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
