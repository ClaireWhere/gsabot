const cron = require('cron');
const axios = require('axios');
require('dotenv').config();
// eslint-disable-next-line no-extra-parens
const config = (require('../config.json')).config.minecraft_tracker;
const { getChannelParentName } = require('../utils/utils');
const { logger } = require('../utils/logger');

let previousStatus = ``;
let scheduledCheck;
let client;

/**
 * 
 * @param {import('discord.js').Client} client 
 */
async function setStatusChannel(status) {
    const channel = client.channels.cache.find(_channel => {return getChannelParentName(_channel).includes('minecraft server') && !_channel.name.toLowerCase().includes('ip:')})
    await channel.setName(status);
}

async function checkServer() {

    const ip = `${process.env.MINECRAFT_SUBDOMAIN}.${process.env.DOMAIN}`;
    const url = `https://api.minetools.eu/ping/${ip}`;

    await axios.get(url)
        .then(async response => {
            const currentStatus = response?.data?.players?.online;
            if (currentStatus === previousStatus) {
                logger.debug(`[${ip}] no changes since last check`);
                return;
            }

            if (typeof currentStatus === 'number') {
                previousStatus = currentStatus;
                await setStatusChannel(`${previousStatus} Player${previousStatus === 1 ? '' : 's'} Online`).catch(error => {return logger.warn(`[${ip}] there was an error fetching the server status channel (${error})`)});
                logger.info(`[${ip}] ${previousStatus} player${previousStatus === 1 ? '' : 's'} online`);
            } else {
                previousStatus = 'warning';
                await setStatusChannel(`Server Offline :(`).catch(error => {return logger.warn(`[${ip}] there was an error fetching the server status channel (${error})`)});
                logger.warn(`[${ip}] could not reach server!`);
            }
        })
        .catch(error => {
            if (previousStatus === 'error') {
                logger.debug(`[${[ip]}] no changes since last check`);
            } else {
                previousStatus = 'error';
                logger.error(`[${ip}] there was an error fetching the server status (${error})`);
            }
        });
}

function start(client_) {
    client = client_;
    scheduledCheck = new cron.CronJob(`00 */${config.frequency_mins} * * * *`, checkServer);
    scheduledCheck.start()
}



module.exports = {
    name: 'ready',
    once: true,
    execute(_client) {
        if (config.enabled) {
            start(_client)
        }
    },
    stop() {
        scheduledCheck.stop();
        logger.info(`shutting down minecraftTracker`);
    },
    checkServer
};