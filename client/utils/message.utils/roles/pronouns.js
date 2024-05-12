const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../config.json');

module.exports = { 
    execute() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`She/Her`)
                    .setCustomId(`pronouns:she_her`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`She/They`)
                    .setCustomId(`pronouns:she_they`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`She/He`)
                    .setCustomId(`pronouns:she_he`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`She/He/They`)
                    .setCustomId(`pronouns:she_he_they`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`She/They/He`)
                    .setCustomId(`pronouns:she_they_he`)
                    .setDisabled(false)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`He/Him`)
                    .setCustomId(`pronouns:he_him`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`He/They`)
                    .setCustomId(`pronouns:he_they`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`He/She`)
                    .setCustomId(`pronouns:he_she`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`He/She/They`)
                    .setCustomId(`pronouns:he_she_they`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`He/They/She`)
                    .setCustomId(`pronouns:he_they_she`)
                    .setDisabled(false)
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`They/Them`)
                    .setCustomId(`pronouns:they_them`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`They/She`)
                    .setCustomId(`pronouns:they_she`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`They/He`)
                    .setCustomId(`pronouns:they_he`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`They/She/He`)
                    .setCustomId(`pronouns:they_she_he`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`They/He/She`)
                    .setCustomId(`pronouns:they_he_she`)
                    .setDisabled(false)
            );

        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Any Pronouns`)
                    .setCustomId(`pronouns:any`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Manage Neopronouns`)
                    .setCustomId(`pronouns:neo`)
                    .setDisabled(false)
            );

        const embed = {
            title: `Pronoun Roles`,
            description: `Click the buttons to set your pronouns! \nClicking a button again will remove those pronouns, you may do this as much as you like\n\nIf you use multiple pronouns but have no preference, select the blue options. If you use multiple pronouns and DO have a preference, choose from the gray options.\n\n**Example:** If I use all pronouns but prefer she and they equally. I would choose she/he and they/he, showing that he is my secondary choice. If you prefer your pronouns in a certain order, pick the right option for you!`,
            color: parseInt(config.colors.rainbow[0].hex, 10),
            thumbnail: {
            url: config.images.pronouns_thmb,
            height: 0,
            width: 0
            }
        }

        const pronouns = { embeds: [embed], components: [row1, row2, row3, row4] }
        return pronouns;
    }
}