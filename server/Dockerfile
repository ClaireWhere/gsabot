FROM --platform=arm64 node:alpine3.19

# Create app directory
WORKDIR /usr/src/server

# Setup environment
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD

ENV PGHOST=$DB_HOST
ENV PGPORT=$DB_PORT
ENV PGDATABASE=$DB_NAME
ENV PGUSER=$DB_USER
ENV PGPASSWORD=$DB_PASSWORD

# Install app dependencies
COPY package*.json ./
RUN NODE_ENV=production && \
    npm install --omit=dev && \
    npm cache clean --force

COPY . .
RUN npm run initialize
ENTRYPOINT ["npm", "run", "start"]