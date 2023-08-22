const cron = require('cron');
const axios = require('axios');
require('dotenv').config();
const config = require('../config.json').config.minecraft_tracker;
var previous_status = ``;

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
            } else if (previous_status != 'warning') {
                previous_status = 'warning'
                console.warn(`[${getDate()}] [${ip}] could not reach server!`);
            }
        })
        .catch(error => {
            console.error(`[${getDate()}] [${ip}] there was an error fetching the server status`);
        });
}

function getDate() {
    var date = new Date();
    return `${date.getFullYear()}-${pad(date.getMonth(), 2)}-${pad(date.getDay(), 2)} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`;
}
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (!config.disabled) {
            scheduledCheck.start();
        }
    },
    stop() {
        scheduledCheck.stop();
    },
    checkServer
};