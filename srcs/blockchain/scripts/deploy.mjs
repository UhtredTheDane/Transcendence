import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
    // Compile le contrat
    await hardhat.run('compile');

    // Déploie le contrat PongTournament
    const PongTournament = await ethers.getContractFactory("PongTournament");
    const pongTournament = await PongTournament.deploy();

    // Attendre la confirmation de la transaction de déploiement
    const deployedContract = await pongTournament.waitForDeployment(); // Remplace deployed() par waitForDeployment

    // Affiche l'adresse du contrat déployé
    console.log("PongTournament contract deployed to:", deployedContract.target);

    // Ajouter l'adresse du contrat dans la variable d'environnement CONTRACT_ADDRESS
    process.env.CONTRACT_ADDRESS = deployedContract.target;
    console.log("Contract address added to environment variable CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
