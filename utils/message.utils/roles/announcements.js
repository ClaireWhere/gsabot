const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../client/config.json');
const { getChannelParentName } = require("../../utils");

module.exports = { 
    async execute(interaction) {
        const announcements_channel = interaction.guild.channels.cache.find(channel => channel.name === 'announcements' && !getChannelParentName(channel).includes('archive')) ?? `\`#announcements\``;
        const announcements_role = interaction.guild.roles.cache.find(role => role.name === config.roles.announcements.name ?? '\`@Announcements\`');

        const row_1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Announcements`)
                    .setCustomId(`announcements`)
                    .setDisabled(false)
            );

        const embed = {
            title: `Announcements Role`,
            description: `Would you like to be pinged with ${announcements_role} in ${announcements_channel} for important GSA announcements?\n\nClick the button below to get notifications to keep you up to date on GSA events and news (click again to remove)`,
            color: parseInt(config.colors.rainbow[3].hex),
            thumbnail: {
                url: config.images.announcements_thmb,
                height: 0,
                width: 0
            }
        }


        const announcements = { embeds: [embed], components: [row_1] }
        return announcements;
    }
}