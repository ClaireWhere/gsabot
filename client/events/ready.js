const { Client, ActivityType } = require("discord.js");
const { config } = require('../config.json');

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};