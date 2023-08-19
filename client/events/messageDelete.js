const { config } = require('../config.json');
const { messageToBuffer } = require('../../utils/messageToImage');
const { AttachmentBuilder, Events } = require('discord.js');
require('dotenv').config();
const { LoggedMessage } = require('../../models/LoggedMessage');
const { insertMessageLog } = require('../../utils/messageLogger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (config.debug_mode) {
            console.debug('running MessageDelete event');
        }
        await interaction.deferUpdate()
                .then((res) => {
                    if (config.debug_mode) {
                        console.debug('interaction deferred');
                    }
                }).catch((err) => {
                    console.error(err);
                    return;
                });
        
        console.log(`Message deleted from ${message.channel} by ${message.author.tag}`);

        const author = await message.guild.members.cache.find(x => x.id === message.author.id);
        const nickname = author.nickname ?? author.globalName ?? author.username;
        const displayColor = author.displayHexColor;
        const channel_name = await message.guild.channels.cache.find(c => c.id === message.channelId).name;

        const logged = new LoggedMessage(
            message.content,
            message.id,
            message.author.id,
            message.channelId,
            channel_name,
            message.author.username,
            message.createdTimestamp,
            message.guildId
        );
        await insertMessageLog(logged);
        const raw = `\n[Raw](https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}/logs/${message.id} 'Open raw text to copy/paste')`;

        const file = new AttachmentBuilder()
            .setFile(await messageToBuffer(message, nickname, displayColor))
            .setName(`message.png`);

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

        
        let delchannel = await message.guild.systemChannel;
        // let delchannel = await message.guild.channels.cache.find(x => x.name === 'moderator-only');
        await delchannel.send({embeds: [embed], files: [file]});
    }
}