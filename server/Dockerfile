FROM --platform=arm64 node:alpine3.19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Setup environment
RUN NODE_ENV=production
COPY . .
RUN npm run initialize
ENTRYPOINT ["npm", "run", "start"]