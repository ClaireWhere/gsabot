const { config } = require('../config.json');
const { AttachmentBuilder, Events } = require('discord.js');
require('dotenv').config();
const { logger } = require('../utils/logger');
const { messageToBuffer } = require('../utils/messageToImage');
const insertMessage = require('../db/queries/insertMessage');
const insertChannel = require('../db/queries/insertChannel');
const insertGuild = require('../db/queries/insertGuild');
const insertUser = require('../db/queries/insertUser');
const insertGuildUser = require('../db/queries/insertGuildUser');
const insertDeletedMessage = require('../db/queries/insertDeletedMessage');
const { insertAttachments } = require('../db/queries/insertAttachment');


module.exports = {
    name: Events.MessageDelete,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @returns 
     */
    async execute(message) {
        if (!config.deleted_message_log.enabled) { return; }
        logger.info(`Received ${this.name.toString()} interaction\n\tChannel: ${message.channel.name} (id: ${message.channelID})\n\tAuthor: ${message.author.username} (id: ${message.author.id})\n\tGuild: ${message.guild.name} (id: ${message.guild.id})`);

        /**
         * Skip logging messages sent by bots or messages not sent in a guild.
         * The case of a message not sent in a guild should not occur, but it is handled here just in case.
         */
        if (message.author.bot) {
            logger.warn(`Message ${message.id} was sent by a bot. Logging will be skipped`);
            return;
        }
        if (!message.guild) {
            logger.warn(`Message ${message.id} was not sent in a guild. Logging will be skipped`);
            return;
        }

        const authorID = message.author.id;
        const guildUser = message.guild.members.cache.find(user => {return user.id === authorID});
        const authorUsername = message.author.username;
        const authorDisplayName = guildUser.displayName;
        const authorNickname = message.author.nickname;
        const authorAvatar = message.author.avatarURL();
        const authorDisplayColor = guildUser.displayHexColor;
        const deletedAt = new Date();

        let rawText = "";
        
        /**
         * Insert the deleted message into the database if the feature is enabled.
         */
        if (config.deleted_message_log.use_database) {
            await insertGuild(message.guildId, message.guild.name).catch((error) => {logger.warn(`failed to insert guild: ${error}`)});
            await insertUser(authorID, authorUsername, authorDisplayName, authorAvatar).catch((error) => {logger.warn(`failed to insert user: ${error}`)});
            const guildUserID = await insertGuildUser(message.guildId, authorID, authorNickname, authorDisplayColor).catch((error) => {logger.warn(`failed to insert guild user: ${error}`)});
            await insertChannel(message.channelId, message.channel.name, message.guildId).catch((error) => {logger.warn(`failed to insert channel: ${error}`)});
            await insertMessage(message.id, message.content, message.createdAt, guildUserID, message.channelId).catch((error) => {logger.warn(`failed to insert message: ${error}`)});
            await insertAttachments(message.attachments, message.id).catch((error) => {logger.warn(`failed to insert attachments: ${error}`)});
            const deletedID = await insertDeletedMessage(message.id, deletedAt).catch((error) => {logger.warn(`failed to insert deleted message: ${error}`)});

            /**
             * If the deleted message was successfully inserted into the database, generate a raw text link to the message.
             */
            if (deletedID) {
                logger.debug(`Inserted deleted message (id: ${deletedID})`);
                rawText = `\n[Raw](https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}/logs/${deletedID} 'Open raw text to copy/paste')`;
                logger.debug(`Generated raw text link for deleted message (${deletedID}): ${rawText}`);
            }
        }

        /**
         * Set the channel to log deleted messages. 
         * This is done much earlier than the message is actually logged to avoid doing unnecessary work if the channel is not set.
         * If the channel is not set, the bot will not log the deleted message, so we can exit early.
         */
        const delchannel = message.guild.systemChannel;
        if (!delchannel) {
            logger.error(`No system channel found for guild: ${message.guild.name}`);
            return;
        }

        logger.debug(`Set deleted message log channel for guild: ${message.guild.name} to: ${delchannel.name}`);

        const authorName = authorNickname ? `${authorNickname} (${authorUsername})` : authorDisplayName ? `${authorDisplayName} (${authorUsername})` : authorUsername;
        logger.debug(`Generated author name for deleted message ${message.id}: ${authorName}\n\tnickname: ${authorNickname}\n\tdisplay name: ${authorDisplayName}\n\tusername: ${authorUsername}`);

        /**
         * Generate the message image for the deleted message.
         * This is an image representation of the message that was deleted.
         */
        logger.debug(`Generating message image for deleted message ${message.id}...`);
        const buffer = await messageToBuffer(message, authorName, authorDisplayColor);
        logger.debug(`Generated message image buffer for deleted message ${message.id}`);
        const file = buffer ? new AttachmentBuilder().setFile(buffer).setName('message.png') : null;
        logger.debug(`Successfully generated message image attachment for deleted message ${message.id}`);
        const creationDate = new Date(message.createdTimestamp);

        const attachmentsText = message.attachments.size > 0 ? `\n**Attachments: **${message.attachments.map(attachment => {return `[${attachment.name}](${attachment.url})`}).join(', ')}` : '';

        /**
         * Create the embed for the deleted message.
         * This embed contains information about the deleted message, including the author, channel, and creation date.
         */
        const embed = {
            title: "**MESSAGE DELETED**",
            description: `` 
                + `**Author: **${message.author.globalName} (${message.author.username})`
                + `\n**Channel: **${message.channel}`
                + `\nCreated On: ${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}`
                + `${attachmentsText}${rawText}`,
            timestamp: deletedAt.toISOString(),
            footer: {
                text: `Message ID: ${message.id}\nAuthor ID: ${authorID}`,
                icon_url: authorAvatar
            },
            author: {
                name: message.author.globalName,
                icon_url: authorAvatar
            },
            image: {
                url: 'attachment://message.png'
            },
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(config.colors.light_red.darken[2].hex, 10)
        }
        logger.debug(`Generated embed for deleted message ${message.id}`);

        /**
         * Add the generated embed and file attachment to the embeds and files for the message log and add any additional attachments and embeds from the deleted message.
         */
        const embeds = [embed];
        const files = [file];

        if (files) {
            await delchannel.send({embeds: embeds, files: files})
                .then(() => {
                    logger.info(`Logged deleted message with ${file ? 'generated message image and ' : ''}attachments to channel: ${delchannel.name}`);
                })
                .catch((error) => {
                    logger.error(`Failed to log deleted message to channel: ${delchannel.name} with error: ${error}`);
                });
        } else {
            await delchannel.send({embeds: embeds})
                .then(() => {
                    logger.info(`Logged deleted message to channel: ${delchannel.name}`);
                })
                .catch((error) => {
                    logger.error(`Failed to log deleted message to channel: ${delchannel.name} with error: ${error}`);
                });
        }
    }
}
