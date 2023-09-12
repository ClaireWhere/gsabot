const cron = require('cron');
const axios = require('axios');
require('dotenv').config();
const config = (require('../config.json')).config.minecraft_tracker;
var previous_status = ``;
const { getChannelParentName } = require('../../utils/utils');
const { logger } = require('../../utils/logger');

var scheduledCheck;
var client;

async function checkServer() {

    const ip = `${process.env.MINECRAFT_SUBDOMAIN}.${process.env.DOMAIN}`;
    const url = `https://api.minetools.eu/ping/${ip}`;

    await axios.get(url)
        .then(async response => {
            if (Object.hasOwn(response.data, 'players')) {
                if (!(previous_status === response.data.players.online)) {
                    previous_status = response.data.players.online;
                    await setStatusChannel(`${response.data.players.online} Players Online`).catch(error => logger.warn(`[${ip}] there was an error fetching the server status channel (${error})`));
                    logger.info(`[${ip}] ${response.data.players.online} players online`)
                }
            } else if (!(previous_status === 'warning')) {
                previous_status = 'warning';
                await setStatusChannel(`Server Offline :(`).catch(error => logger.warn(`[${ip}] there was an error fetching the server status channel (${error})`));
                logger.warn(`[${ip}] could not reach server!`);
            }
        })
        .catch(error => {
            if (!(previous_status === 'error')) {
                previous_status = 'error';
                logger.error(`[${ip}] there was an error fetching the server status (${error})`);
            }
        });
}

function start(client_) {
    client = client_;
    scheduledCheck = new cron.CronJob(`00 */${config.frequency_mins} * * * *`, checkServer);
    scheduledCheck.start()
}

/**
 * 
 * @param {import('discord.js').Client} client 
 */
async function setStatusChannel(status) {
    const channel = client.channels.cache.find(channel => getChannelParentName(channel).includes('minecraft server') && !channel.name.toLowerCase().includes('ip:'))
    channel.setName(status);
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (config.enabled) {
            start(client)
        }
    },
    stop() {
        scheduledCheck.stop();
        logger.info(`shutting down minecraftTracker`);
    },
    checkServer
};