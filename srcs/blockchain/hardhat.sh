npx hardhat node --hostname 0.0.0.0 &
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/createTournament.js --network localhost
npx hardhat add-match --tournamentid 1 --player1 "Alice" --player2 "Bob" --score1 21 --score2 15 --network localhost
