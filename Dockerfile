FROM node:18.17.0
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install --prefix client
# Install Canvas
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev
# Setup environment
RUN NODE_ENV=production
COPY . .
EXPOSE 5048
RUN npm run initialize
CMD [ "npm", "run", "client" ]