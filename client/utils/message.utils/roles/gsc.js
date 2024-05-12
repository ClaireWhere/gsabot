const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../config.json');
const { getChannelParentName } = require("../../utils");

module.exports = { 
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    execute(interaction) {
        const gscChannel = interaction.guild.channels.cache.find(channel => {return channel.name === 'gsc-talk' && !getChannelParentName(channel).includes('archive')}) ?? `\`#gsc-talk\``;
        const gscRole = interaction.guild.roles.cache.find(role => {return role.name === config.roles.gsc.name ?? '`@GSC Announcements`'});

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`GSC Announcements`)
                    .setCustomId(`gsc`)
                    .setDisabled(false)
            );

        const embed = {
            title: `GSC Announcements Role`,
            description: `Would you like to be pinged with ${gscRole} in ${gscChannel} for important announcements about the Gender and Sexuality Center (GSC) on campus?\n\nClick the button below to get notifications for imporant news and events, and when the GSC is closed unexpectedly. (click again to remove)`,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(config.colors.rainbow[5].hex, 10),
            thumbnail: {
                url: config.images.gsc_thmb,
                height: 0,
                width: 0
            }
        }


        const gsc = { embeds: [embed], components: [row1] }
        return gsc;
    }
}