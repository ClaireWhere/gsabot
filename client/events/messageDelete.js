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

/**
 * 
 * @param {Collection<string, Attachment>} attachments 
 * @param {string} messageID 
 * @returns {{messageFiles: any[], messageEmbeds: any[]} } an object containing an array of files: `messageFiles` and an array of embeds: `messageEmbeds` from the provided attachments
 */
function extractAttachments(attachments, messageID) {
    const attachmentQuantity = attachments?.size ?? 0;
    const messageFiles = [];
    const messageEmbeds = [];

    if (attachmentQuantity === 0) {
        logger.debug(`No attachments found for deleted message ${messageID}`);
        return {messageFiles, messageEmbeds};
    }

    logger.debug(`Extracting attachments for deleted message ${messageID}`);
    
    let attachmentIndex = 0;
    attachments.forEach(attachment => {
        attachmentIndex++;
        logger.debug(`Extracting attachment ${attachmentIndex}/${attachmentQuantity} for deleted message ${messageID}`);
        const attachmentUrl = attachment.url;
        const attachmentType = attachment.contentType;
        const DEFAULT_DECIMALS = 2;
        function formatBytes(bytes, decimals = DEFAULT_DECIMALS) {
            const ZERO_BYTES = 0;
            if (bytes === ZERO_BYTES) {return '0 Bytes';}
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))  } ${  sizes[i]}`;
        }
        const attachmentSize = formatBytes(attachment.size);

        const attachmentEmbed = {
            title: `**ATTACHMENT ${attachmentIndex}/${attachmentQuantity}**`,
            description: `${attachmentUrl}\n**Type: **${attachmentType}\n**Size: **${attachmentSize}`,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(Number(config.colors.light_red.darken[2].hex), 10)
        }

        if (attachmentType.startsWith('image')) {
            const imageExtension = attachmentType.split('/').pop();
            const imageName = `attachment${attachmentIndex}.${imageExtension}`;
            const imageUrl = `attachment://${imageName}`;
            attachmentEmbed.image = {
                url: imageUrl
            };
            const attachmentFile = new AttachmentBuilder().setFile(attachmentUrl).setName(imageName);
            messageFiles.push(attachmentFile);
        } else {
            logger.debug(`Attachment ${attachmentIndex}/${attachmentQuantity} is not an image for deleted message ${messageID}`);
        }

        messageEmbeds.push(attachmentEmbed);
    });

    return {messageFiles, messageEmbeds};
}

/**
 * 
 * @param {Embed[]} embeds 
 * @param {string} messageID 
 * @returns {{messageFiles: any[], messageEmbeds: any[]} } an object containing an array of files: `messageFiles` and an array of embeds: `messageEmbeds` from the provided embeds
 */
function extractEmbeds(embeds, messageID) {
    const embedQuantity = embeds?.length ?? 0;
    const messageFiles = [];
    const messageEmbeds = [];

    if (embedQuantity === 0) {
        logger.debug(`No embeds found for deleted message ${messageID}`);
        return {messageFiles, messageEmbeds};
    }
    
    let embedIndex = 0;
    logger.debug(`Extracting ${embedQuantity} embeds for deleted message ${messageID}`);
    embeds.forEach(messageEmbed => {
        embedIndex++;
        logger.debug(`Extracting embed ${embedIndex}/${embedQuantity} for deleted message ${messageID}`);
        
        let urlSource;
        if (messageEmbed.image) {
            urlSource = messageEmbed.image.url;
        } else if (messageEmbed.video) {
            urlSource = messageEmbed.video.url;
        } else {
            urlSource = messageEmbed.url ?? null;
        }

        const embedType = messageEmbed.data?.type ?? messageEmbed.type ?? 'unknown';
        const embedDescription = `${urlSource ? `[Download/Link](${urlSource})\n` : ''}**Type: **${embedType}`;

        const embedEmbed = {
            title: `**EMBED ${embedIndex}/${embedQuantity}**`,
            description: embedDescription,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(Number(config.colors.light_red.darken[2].hex), 10)
        }

        const embedExtension = urlSource?.includes('.') ? urlSource.split('.').pop().split('?').shift() : null;
        const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
        if (validExtensions.includes(embedExtension)) {
            logger.debug(`Embed ${embedIndex}/${embedQuantity} has extension: ${embedExtension}`);
            const embedName = `embed${embedIndex}.${embedExtension}`;
            const embedUrl = `attachment://${embedName}`;

            if (messageEmbed.image || messageEmbed.type === 'image') {
                embedEmbed.image = {
                    url: embedUrl
                }
            } else if (messageEmbed.video || messageEmbed.type === 'video') {
                embedEmbed.video = {
                    url: embedUrl
                }
            }
            const embedFile = new AttachmentBuilder().setFile(urlSource).setName(embedName);
            messageFiles.push(embedFile);
            messageEmbeds.push(embedEmbed);
        } else {
            logger.debug(`Adding raw embed ${embedIndex}/${embedQuantity} to embeds for deleted message ${messageID}`);
            messageEmbeds.push(messageEmbed);
        }
    });
    return {messageFiles, messageEmbeds};
}

module.exports = {
    name: Events.MessageDelete,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @returns 
     */
    async execute(message) {
        if (!config.deleted_message_log.enabled) { return; }
        logger.info(`Received ${this.name.toString()} interaction\n\tChannel: ${message.channel.name} (id: ${message.channel.id})\n\tAuthor: ${message.author.username} (id: ${message.author.id})\n\tGuild: ${message.guild.name} (id: ${message.guild.id})`);

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
            await insertGuild(message.guild.id, message.guild.name).catch((error) => {logger.warn(`failed to insert guild: ${error}`)});
            await insertUser(authorID, authorUsername, authorDisplayName, authorAvatar).catch((error) => {logger.warn(`failed to insert user: ${error}`)});
            const guildUserID = await insertGuildUser(message.guild.id, authorID, authorNickname, authorDisplayColor).catch((error) => {logger.warn(`failed to insert guild user: ${error}`)});
            await insertChannel(message.channel.id, message.channel.name, message.guild.id).catch((error) => {logger.warn(`failed to insert channel: ${error}`)});
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
        if (attachmentsText.length > 0) {
            logger.debug(`Created attachments list for deleted message ${message.id}: ${attachmentsText}`);
        }

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
            color: parseInt(Number(config.colors.light_red.darken[2].hex), 10)
        }
        logger.debug(`Generated embed for deleted message ${message.id}`);

        /**
         * Add the generated embed and file attachment to the embeds and files for the message log and add any additional attachments and embeds from the deleted message.
         */
        const embeds = [embed];
        const files = [file];

        logger.debug(`Adding attachments and embeds to message log ${message.id}...`);
        const {messageFiles: attachmentFiles, messageEmbeds: attachmentEmbeds} = extractAttachments(message.attachments, message.id);
        files.push(...attachmentFiles);
        embeds.push(...attachmentEmbeds);

        const {messageFiles: embedFiles, messageEmbeds: embedEmbeds} = extractEmbeds(message.embeds, message.id);
        files.push(...embedFiles);
        embeds.push(...embedEmbeds);

        logger.debug(`Generated ${embeds.length} embeds and ${files.length} files for deleted message ${message.id}`);

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
