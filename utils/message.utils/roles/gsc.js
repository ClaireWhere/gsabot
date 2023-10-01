const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../client/config.json');
const { getChannelParentName } = require("../../utils");

module.exports = { 
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    async execute(interaction) {
        const gsc_channel = interaction.guild.channels.cache.find(channel => channel.name === 'gsc-talk' && !getChannelParentName(channel).includes('archive')) ?? `\`#gsc-talk\``;
        const gsc_role = interaction.guild.roles.cache.find(role => role.name === config.roles.gsc.name ?? '\`@GSC Announcements\`');

        const row_1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`GSC Announcements`)
                    .setCustomId(`gsc`)
                    .setDisabled(false)
            );

        const embed = {
            title: `GSC Announcements Role`,
            description: `Would you like to be pinged with ${gsc_role} in ${gsc_channel} for important announcements about the Gender and Sexuality Center (GSC) on campus?\n\nClick the button below to get notifications for imporant news and events, and when the GSC is closed unexpectedly. (click again to remove)`,
            color: parseInt(config.colors.rainbow[5].hex),
            thumbnail: {
                url: config.images.gsc_thmb,
                height: 0,
                width: 0
            }
        }


        const gsc = { embeds: [embed], components: [row_1] }
        return gsc;
    }
}