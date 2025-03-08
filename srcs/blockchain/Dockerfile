# Utiliser une image officielle Node.js en tant qu'image de base
FROM node:18

# Créer un répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package.json package-lock.json ./
COPY . .

# Installer les dépendances du projet localement (y compris Hardhat)
RUN npm install --save-dev hardhat
#RUN npm install
# Copier tous les fichiers du projet dans le conteneur

# Exposer le port 8545 pour le nœud local Hardhat
EXPOSE 8545

# Définir la commande par défaut pour démarrer le nœud Hardhat
# CMD [ "sh", "./hardhat.sh" ]   

CMD ["npx", "hardhat", "node"]