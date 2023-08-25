const cron = require('cron');
const axios = require('axios');
require('dotenv').config();
const config = require('../config.json').config.minecraft_tracker;
var previous_status = ``;
const { getDate } = require('../../utils/getDate');

let scheduledCheck = new cron.CronJob(`00 */${config.frequency_mins} * * * *`, checkServer);

async function checkServer() {

    const ip = `${process.env.MINECRAFT_SUBDOMAIN}.${process.env.DOMAIN}`;
    const url = `https://api.minetools.eu/ping/${ip}`;

    await axios.get(url)
        .then(response => {
            if (Object.hasOwn(response.data, 'players')) {
                if (!(previous_status === response.data.players.online)) {
                    previous_status = response.data.players.online;
                    console.info(`[${getDate()}] [${ip}] ${response.data.players.online} players online`);
                }
            } else if (!(previous_status === 'warning')) {
                previous_status = 'warning';
                console.warn(`[${getDate()}] [${ip}] could not reach server!`);
            }
        })
        .catch(error => {
            if (!(previous_status === 'error')) {
                previous_status = 'error';
                console.error(`[${getDate()}] [${ip}] there was an error fetching the server status (${error.message})`);
            }
        });
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (config.enabled) {
            scheduledCheck.start();
        }
    },
    stop() {
        scheduledCheck.stop();
        console.log('shutting down minecraftTracker');
    },
    checkServer
};