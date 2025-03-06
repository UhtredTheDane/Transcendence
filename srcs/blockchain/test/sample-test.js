// const { expect } = require("chai");

// describe("PongTournament", function () {
//   let PongTournament;
//   let pongTournament;
//   let admin;
//   let user;

// before(async function () {
//   // Récupère les comptes disponibles
//   [admin, user] = await ethers.getSigners();

//   // Déploie le contrat
//   PongTournament = await ethers.getContractFactory("PongTournament");
//   pongTournament = await PongTournament.deploy();  // Déployez directement le contrat sans `deployed()`
// });


//   it("Doit permettre à l'admin de créer un tournoi", async function () {
//     // Seul l'admin peut créer un tournoi
//     await pongTournament.connect(admin).createTournament("World Pong Championship");

//     // Vérifie que le tournoi a été créé
//     const tournament = await pongTournament.getTournament(1);
//     expect(tournament.name).to.equal("World Pong Championship");
//     expect(tournament.matchCount).to.equal(0);
//   });

//   it("Doit permettre à l'admin d'ajouter un match", async function () {
//     // Seul l'admin peut ajouter un match
//     await pongTournament.connect(admin).addMatch(1, "Alice", "Bob", 21, 15);

//     // Vérifie que le match a été ajouté
//     const matches = await pongTournament.getTournamentMatches(1);
//     expect(matches[0].player1).to.equal("Alice");
//     expect(matches[0].player2).to.equal("Bob");
//     expect(matches[0].score1).to.equal(21);
//     expect(matches[0].score2).to.equal(15);
//   });

//   it("Ne doit pas permettre à un utilisateur non-admin de créer un tournoi", async function () {
//     // Un utilisateur non-admin ne peut pas créer un tournoi
//     await expect(
//       pongTournament.connect(user).createTournament("Unauthorized Tournament")
//     ).to.be.revertedWith("Only admin can call this function");
//   });

//   it("Ne doit pas permettre à un utilisateur non-admin d'ajouter un match", async function () {
//     // Un utilisateur non-admin ne peut pas ajouter un match
//     await expect(
//       pongTournament.connect(user).addMatch(1, "Charlie", "Dave", 18, 21)
//     ).to.be.revertedWith("Only admin can call this function");
//   });

//   it("Doit permettre à l'admin de changer l'admin", async function () {
//     // L'admin actuel peut transférer son rôle à un autre utilisateur
//     await pongTournament.connect(admin).changeAdmin(user.address);

//     // Vérifie que l'admin a été changé
//     expect(await pongTournament.admin()).to.equal(user.address);
//   });
// });

const { ethers } = require("hardhat");

async function main() {
  // L'adresse de votre contrat déployé
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // Chargement du contrat
  const PongTournament = await ethers.getContractFactory("PongTournament");
  const pongTournament = await ethers.getContractAt("PongTournament", contractAddress);

  // Récupérer l'admin
  const admin = await pongTournament.admin();
  console.log("Admin address:", admin);

  // Récupérer des informations sur un tournoi
  const tournament = await pongTournament.getTournament(1);
  console.log("Tournament details:", tournament);

  // Récupérer les matchs du tournoi
  const matches = await pongTournament.getTournamentMatches(1);
  console.log("Tournament matches:", matches);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
