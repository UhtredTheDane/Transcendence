const hardhat = require("hardhat");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config(); // Charger les variables d'environnement existantes

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

    // Mise à jour du fichier .env avec l'adresse du contrat
    const envFilePath = ".env";
    const envVar = `CONTRACT_ADDRESS=${deployedContract.target}`;

    // Lire le contenu du fichier .env existant
    let envContent = fs.readFileSync(envFilePath, "utf8");

    // Mettre à jour ou ajouter l'adresse du contrat dans .env
    if (envContent.includes("CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, envVar);
    } else {
        envContent += `\n${envVar}`;
    }

    // Sauvegarder le fichier .env modifié
    fs.writeFileSync(envFilePath, envContent);
    
    console.log("Contract address saved to .env file:", deployedContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
