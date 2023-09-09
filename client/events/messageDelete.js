const { config } = require('../config.json');
const { messageToBuffer } = require('../../utils/messageToImage');
const { AttachmentBuilder, Events } = require('discord.js');
require('dotenv').config({path: `${__dirname}/../../.env`});
const { LoggedMessage } = require('../../models/LoggedMessage');
const { insertMessageLog } = require('../../utils/db.utils/messageLogger');

module.exports = {
    name: Events.MessageDelete,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @returns 
     */
    async execute(message) {
        if (!config.deleted_message_log.enabled) { return; }
        
        console.log(`Message deleted from ${message.channel} by ${message.author.tag}`);

        const author = message.guild.members.cache.find(x => x.id === message.author.id);
        const nickname = author.nickname ?? author.globalName ?? author.username;
        const displayColor = author.displayHexColor;
        const channel_name = message.guild.channels.cache.find(c => c.id === message.channelId).name;

        const logged = new LoggedMessage(
            message.id,
            message.content,
            message.author.id,
            message.author.username,
            message.channelId,
            channel_name,
            message.guildId,
            message.createdTimestamp
        );
        
        var raw = "";
        if (config.deleted_message_log.use_database) {
            insertMessageLog(logged);
            raw = `\n[Raw](https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}/logs/${message.id} 'Open raw text to copy/paste')`;
        }
        
        const buffer = await messageToBuffer(message, nickname, displayColor);
        const file = !buffer ? null : new AttachmentBuilder().setFile(buffer).setName('message.png');

        const embed = {
            title: "**MESSAGE DELETED**",
            description: '' 
                + `**Author: **${message.author.globalName} (${message.author.username})`
                + `\n**Channel: **${message.channel}`
                + `\nCreated On: ${new Date(message.createdTimestamp).toUTCString()}`
                + raw,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Message ID: ${message.id}\nAuthor ID: ${message.author.id}`,
                icon_url: message.author.avatarURL()
            },
            // thumbnail: {
            //     url: message.author.avatarURL()
            // },
            author: {
                name: message.author.globalName,
                icon_url: message.author.avatarURL()
            },
            image: {
                url: 'attachment://message.png'
            },
            color: parseInt(config.colors.light_red.darken[2].hex)
        }

        
        let delchannel = message.guild.systemChannel;
        // let delchannel = await message.guild.channels.cache.find(x => x.name === 'moderator-only');
        if (!file) {
            await delchannel.send({embeds: [embed]});
        } else {
            await delchannel.send({embeds: [embed], files: [file]});
        }
    }
}