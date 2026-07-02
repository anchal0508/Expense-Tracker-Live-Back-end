
# installing small OS which has nodejs pre-installed
FROM node:20-alpine AS base

# Entering inside the folder of this OS
WORKDIR /usr/src/server

# Copying all the packages available in  my local computer
COPY package*.json ./

# Running and installing all the dependencies mentioned in the package
# this command in faster then the npm install
RUN ci --only=production

# Copying all the folders and files of the NodeJS (project files)
COPY . .

# Security Audit: setting user as Non-root
USER node

# opening the port to connect with other or making it online
EXPOSE 3000

# it is faster and lignter then npm start
CMD [ "node", "server.js" ]

