FROM --platform=arm64 node:alpine3.19

# Create app directory
WORKDIR /usr/src/client

# Setup environment
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG CLIENT_ID
ARG GUILD_ID
ARG DISCORD_TOKEN
ARG DOMAIN
ARG MINECRAFT_SUBDOMAIN
ARG SERVER_SUBDOMAIN
ARG SCHOOL
ARG SCHOOL_CODE
ARG REGISTER
ARG GSA_BANNER

ENV PGHOST=$DB_HOST
ENV PGPORT=$DB_PORT
ENV PGDATABASE=$DB_NAME
ENV PGUSER=$DB_USER
ENV PGPASSWORD=$DB_PASSWORD
ENV CLIENT_ID=$CLIENT_ID
ENV GUILD_ID=$GUILD_ID
ENV DISCORD_TOKEN=$DISCORD_TOKEN
ENV DOMAIN=$DOMAIN
ENV MINECRAFT_SUBDOMAIN=$MINECRAFT_SUBDOMAIN
ENV SERVER_SUBDOMAIN=$SERVER_SUBDOMAIN
ENV SCHOOL=$SCHOOL
ENV SCHOOL_CODE=$SCHOOL_CODE
ENV REGISTER=$REGISTER
ENV GSA_BANNER=$GSA_BANNER

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

RUN mkdir -p /usr/share/fonts/ \
    && install -m644 /usr/src/client/fonts/* /usr/share/fonts/ \
    && fc-cache -f -v

COPY . .
RUN npm run initialize
ENTRYPOINT ["npm", "run", "start"]