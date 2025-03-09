npx hardhat node --hostname 0.0.0.0 &
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/createTournament.js --network localhost