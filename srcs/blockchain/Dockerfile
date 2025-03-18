# Utiliser une image officielle Node.js en tant qu'image de base
FROM node:22

#RUN npm install -g npm@latest
#RUN npm -v
# Créer un répertoire de travail
# Copier package.json et package-lock.json pour installer les dépendances

COPY ./package-lock.json ./
COPY  ./package.json ./
WORKDIR /app

RUN npm install express
RUN npm install --save-dev hardhat
# Copier tous les fichiers du projet dans le conteneur après l'installation des dépendances
COPY . .

# Exposer le port 8545 pour le nœud local Hardhat
EXPOSE 8545
EXPOSE 3000

CMD [ "npm", "start"]   