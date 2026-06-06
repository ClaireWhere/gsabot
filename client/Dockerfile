FROM node:20-alpine3.19

# Create app directory
WORKDIR /usr/src/client

# Setup environment
ARG LOGS_DIR
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

ENV LOGS_DIR=$LOGS_DIR
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
    python3 \
    make \
    g++ \
    pkgconfig \
    cairo-dev \
    pango-dev \
    pixman-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    fontconfig-dev

RUN npm cache clean --force \
    && npm install canvas@2.11.2 --build-from-source \
    && npm install --omit=dev \
    && npm cache clean --force


RUN mkdir -p /usr/share/fonts/
COPY ./fonts/ /usr/share/fonts/
RUN find /usr/share/fonts -type f -exec install -m644 {} /usr/share/fonts/ \; \
    && fc-cache -f -v

COPY . .
RUN npm run initialize
ENTRYPOINT ["npm", "run", "start"]
