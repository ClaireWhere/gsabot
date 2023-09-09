const { Client } = require("discord.js");
const { logger } = require("../../utils/logger");

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    execute(client) {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
    },
};