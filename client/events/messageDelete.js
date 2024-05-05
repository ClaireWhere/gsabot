const { config } = require('../config.json');
const { messageToBuffer } = require('../../utils/messageToImage');
const { AttachmentBuilder, Events } = require('discord.js');
require('dotenv').config({path: `${__dirname}/../../.env`});
const { LoggedMessage } = require('../../models/LoggedMessage');
const { insertMessageLog } = require('../../utils/db.utils/messageLogger');
const { logger } = require('../../utils/logger');

module.exports = {
    name: Events.MessageDelete,
    /**
     * 
     * @param {import('discord.js').Interaction} message 
     * @returns 
     */
    async execute(message) {
        if (!config.deleted_message_log.enabled) { return; }
        logger.info(`received ${this.name.toString()} interaction from channel: ${message.channel} by ${message.author.username}`);

        const author = message.guild.members.cache.find(user => {return user.id === message.author.id});
        const nickname = author.nickname ?? message.author.globalName ?? message.author.username;
        const displayColor = author.displayHexColor;
        const channelName = message.guild.channels.cache.find(c => {return c.id === message.channelId}).name;

        const logged = new LoggedMessage(
            message.id,
            message.content,
            message.author.id,
            nickname,
            message.channelId,
            channelName,
            message.guildId,
            message.createdTimestamp
        );
        
        let raw = "";
        if (config.deleted_message_log.use_database) {
            if (!insertMessageLog(logged)) {
                return false;
            }
            raw = `\n[Raw](https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}/logs/${message.id} 'Open raw text to copy/paste')`;
        }
        
        const buffer = await messageToBuffer(message, nickname, displayColor);
        const file = buffer ? new AttachmentBuilder().setFile(buffer).setName('message.png') : null;
        const creationDate = new Date(message.createdTimestamp);

        const embed = {
            title: "**MESSAGE DELETED**",
            description: `` 
                + `**Author: **${message.author.globalName} (${message.author.username})`
                + `\n**Channel: **${message.channel}`
                + `\nCreated On: ${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}${
                 raw}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Message ID: ${message.id}\nAuthor ID: ${message.author.id}`,
                // eslint-disable-next-line camelcase
                icon_url: message.author.avatarURL()
            },
            // eslint-disable-next-line multiline-comment-style
            // thumbnail: {
            //     url: message.author.avatarURL()
            // },
            author: {
                name: message.author.globalName,
                // eslint-disable-next-line camelcase
                icon_url: message.author.avatarURL()
            },
            image: {
                url: 'attachment://message.png'
            },
            color: parseInt(config.colors.light_red.darken[2].hex)
        }

        
        let delchannel = message.guild.systemChannel;
        // eslint-disable-next-line capitalized-comments
        // let delchannel = await message.guild.channels.cache.find(x => x.name === 'moderator-only');
        if (file) {
            await delchannel.send({embeds: [embed], files: [file]});
        } else {
            await delchannel.send({embeds: [embed]});
        }
    }
}