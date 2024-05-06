const { config } = require('../config.json');
const { AttachmentBuilder, Events } = require('discord.js');
require('dotenv').config({path: `${__dirname}/../../.env`});
const { logger } = require('../../utils/logger');
const { messageToBuffer } = require('../../utils/messageToImage');
const insertMessage = require('../../db/queries/insertMessage');
const insertChannel = require('../../db/queries/insertChannel');
const insertGuild = require('../../db/queries/insertGuild');
const insertUser = require('../../db/queries/insertUser');
const insertGuildUser = require('../../db/queries/insertGuildUser');
const insertDeletedMessage = require('../../db/queries/insertDeletedMessage');
const { insertAttachments } = require('../../db/queries/insertAttachment');

module.exports = {
    name: Events.MessageDelete,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @returns 
     */
    async execute(message) {
        if (!config.deleted_message_log.enabled) { return; }
        logger.info(`received ${this.name.toString()} interaction from channel: ${message.channel} by ${message.author.username}`);

        const author = message.guild.members.cache.find(user => {return user.id === message.author.id});
        const authorUsername = author.username;
        const authorDisplayName = author.displayName;
        const authorNickname = author.nickname;
        const authorAvatar = author.avatarURL();

        const authorDisplayColor = author.displayHexColor;
        const deletedAt = new Date();
        
        let rawText = "";
        if (config.deleted_message_log.use_database) {
            insertGuild(message.guildId, message.guild.name);
            insertUser(message.author.id, authorUsername, authorDisplayName, authorAvatar);
            insertGuildUser(message.guildId, message.author.id, authorNickname, authorDisplayColor);
            insertChannel(message.channelId, message.channel.name, message.guildId);
            insertMessage(message.id, message.content, message.createdAt, message.author.id, message.channelId, message.guildId);
            insertAttachments(message.attachments, message.id);
            const insertDeletedResponse = insertDeletedMessage(message.id, deletedAt);
            const deletedId = insertDeletedResponse ? insertDeletedResponse.id : null;

            if (deletedId) {
                logger.info(`inserted deleted message (id: ${deletedId}) with message id: ${message.id}, deleted at: ${deletedAt}`);
                rawText = `\n[Raw](https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}/logs/${deletedId} 'Open raw text to copy/paste')`;
            } else {
                logger.error(`failed to insert deleted message with message id: ${message.id}, deleted at: ${deletedAt}`);
            }
        }

        const authorName = authorNickname ? `${authorNickname} (${authorUsername})` : authorDisplayName ? `${authorDisplayName} (${authorUsername})` : authorUsername;
        
        const buffer = await messageToBuffer(message, authorName, authorDisplayColor);
        const file = buffer ? new AttachmentBuilder().setFile(buffer).setName('message.png') : null;
        const creationDate = new Date(message.createdTimestamp);

        // eslint-disable-next-line no-magic-numbers
        const attachmentsText = message.attachments.size > 0 ? `\n**Attachments: **${message.attachments.map(attachment => {return `[${attachment.name}](${attachment.url})`}).join(', ')}` : '';

        const embed = {
            title: "**MESSAGE DELETED**",
            description: `` 
                + `**Author: **${message.author.globalName} (${message.author.username})`
                + `\n**Channel: **${message.channel}`
                + `\nCreated On: ${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}`
                + `${attachmentsText}${rawText}`,
            timestamp: deletedAt.toISOString(),
            footer: {
                text: `Message ID: ${message.id}\nAuthor ID: ${message.author.id}`,
                // eslint-disable-next-line camelcase
                icon_url: authorAvatar
            },
            // eslint-disable-next-line multiline-comment-style
            // thumbnail: {
            //     url: authorAvatar
            // },
            author: {
                name: message.author.globalName,
                // eslint-disable-next-line camelcase
                icon_url: authorAvatar
            },
            image: {
                url: 'attachment://message.png'
            },
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(config.colors.light_red.darken[2].hex, 10)
        }

        
        const delchannel = message.guild.systemChannel;
        if (!delchannel) {
            logger.error(`No system channel found for guild: ${message.guild.name}`);
            return;
        }

        if (file) {
            await delchannel.send({embeds: [embed], files: [file].concat(message.attachments)})
                .then(() => {
                    logger.info(`Logged message deleted message with generated message image and attachments to channel: ${delchannel.name}`);
                })
                .catch((error) => {
                    logger.error(`Failed to send message deleted message to channel: ${delchannel.name} with error: ${error}`);
                });
        } else {
            await delchannel.send({embeds: [embed], files: message.attachments})
                .then(() => {
                    logger.info(`Logged message deleted message with attachments to channel: ${delchannel.name}`);
                })
                .catch((error) => {
                    logger.error(`Failed to send message deleted message to channel: ${delchannel.name} with error: ${error}`);
                });
        }
    }
}