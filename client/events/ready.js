const { logger } = require("../utils/logger");

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {import('discord.js').Client} client
     */
    execute(client) {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        
        if (typeof process.send === 'function') { 
            process.send('ready');
        }        
    },
};