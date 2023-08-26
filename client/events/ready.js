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
        if (config.custom_status.enabled) {
            client.user.setPresence({
                activities: [{
                    name: config.custom_status.name,
                    type: ActivityType.Custom,
                    state: config.custom_status.status,
                }]
            })
        }
        
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};