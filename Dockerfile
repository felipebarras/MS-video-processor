# Dockerfile
FROM node:20.18-alpine3.21

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

# starta a instalação do Node
RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

# esse é o comando para rodar o Microsserviço
CMD ["node", "server.js"]
