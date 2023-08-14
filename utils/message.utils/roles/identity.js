const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../client/config.json');

module.exports = { 
    async execute(interaction) {
        const row_1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`Straight`)
                .setCustomId(`identity:straight`)
                .setDisabled(false),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`Questioning`)
                .setCustomId(`identity:questioning`)
                .setDisabled(false),
        );

        const row_2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Lesbian`)
                    .setCustomId(`identity:lesbian`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Gay`)
                    .setCustomId(`identity:gay`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Bisexual`)
                    .setCustomId(`identity:bi`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Pansexual`)
                    .setCustomId(`identity:pan`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Queer`)
                    .setCustomId(`identity:queer`)
                    .setDisabled(false),
            );

        const row_3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Asexual`)
                    .setCustomId(`identity:ace`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Aromantic`)
                    .setCustomId(`identity:aro`)
                    .setDisabled(false),
            );

        const embed = {
            title: `Identity Roles`,
            description: `Click the buttons below that represent your identity.\n\n**Remember that these are completely optional. Only take them if you are comfortable with it being visible to anyone who clicks your profile!**\n`,
            color: parseInt(config.colors.yellow.lighten[3].hex),
            thumbnail: {
            url: config.images.identity_thmb,
            height: 0,
            width: 0
            }
        }

        const identity = { embeds: [embed], components: [row_1, row_2, row_3] }
        return identity;
    }
}