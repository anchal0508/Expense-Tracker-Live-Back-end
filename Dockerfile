FROM node:20-alpine AS base

WORKDIR /usr/src/services

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

USER node

CMD [ "node", "server.js" ]