FROM node:22

COPY ./package-lock.json ./
COPY  ./package.json ./

WORKDIR /app

RUN npm install express
RUN npm install --save-dev hardhat
COPY . .
EXPOSE 8545
EXPOSE 3000

CMD [ "npm", "start"]   