const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../config.json');
const { getChannelParentName } = require("../../utils");

module.exports = { 
    execute(interaction) {
        const announcementsChannel = interaction.guild.channels.cache.find(channel => {return channel.name === 'announcements' && !getChannelParentName(channel).includes('archive')}) ?? `\`#announcements\``;
        const announcementsRole = interaction.guild.roles.cache.find(role => {return role.name === config.roles.announcements.name ?? '`@Announcements`'});

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Announcements`)
                    .setCustomId(`announcements`)
                    .setDisabled(false)
            );

        const embed = {
            title: `Announcements Role`,
            description: `Would you like to be pinged with ${announcementsRole} in ${announcementsChannel} for important GSA announcements?\n\nClick the button below to get notifications to keep you up to date on GSA events and news (click again to remove)`,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(config.colors.rainbow[3].hex, 10),
            thumbnail: {
                url: config.images.announcements_thmb,
                height: 0,
                width: 0
            }
        }


        const announcements = { embeds: [embed], components: [row1] }
        return announcements;
    }
}