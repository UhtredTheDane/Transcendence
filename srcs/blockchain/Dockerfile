# Utiliser une image officielle Node.js en tant qu'image de base
FROM node:18

# Créer un répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
#COPY package.json package-lock.json ./

# Installer les dépendances du projet localement (y compris Hardhat)
RUN npm install --save-dev hardhat@^2.22.19 @nomicfoundation/hardhat-toolbox@^5.0.0
#RUN npm install

# Copier tous les fichiers du projet dans le conteneur après l'installation des dépendances
COPY . .

# Exposer le port 8545 pour le nœud local Hardhat
EXPOSE 8545

# Commande par défaut pour démarrer le nœud Hardhat
#CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
CMD [ "sh", "./hardhat.sh" ]   