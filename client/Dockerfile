FROM --platform=arm64 node:alpine3.19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install canvas dependencies
# RUN apt-get update
# RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev

RUN apk add --no-cache \
    make \
    g++ \
    cairo-dev \
    pango-dev

RUN npm cache clean --force \
    && npm install canvas@2.11.2 --build-from-source \
    && NODE_ENV=production \
    && npm install --omit=dev \
    && npm cache clean --force

COPY . .
RUN npm run initialize
RUN npm run start