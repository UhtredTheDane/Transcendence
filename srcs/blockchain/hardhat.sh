# npx hardhat node --hostname 0.0.0.0
# npx hardhat run scripts/deploy.js --network localhost
# npx hardhat run scripts/createTournament.js --network localhost
npm start
npx hardhat run scripts/createTournament.js --network localhost
npx hardhat add-match --tournamentid 1 --player1 "Alice" --player2 "Bob" --score1 16 --score2 15 --network localhost
npx hardhat add-match --tournamentid 1 --player1 "Alice" --player2 "Charles" --score1 29 --score2 28 --network localhost
npx hardhat getPlayerMatches --tournamentid 1 --playername Alice --network localhost
# tail -f /dev/null
