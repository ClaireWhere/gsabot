const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../config.json');

module.exports = { 
    execute() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Year 1`)
                    .setCustomId(`year:1`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Year 2`)
                    .setCustomId(`year:2`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Year 3`)
                    .setCustomId(`year:3`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Year 4+`)
                    .setCustomId(`year:4`)
                    .setDisabled(false),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`Alumni`)
                    .setCustomId(`year:alumni`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`Grad Student`)
                    .setCustomId(`year:grad`)
                    .setDisabled(false),
            );

        const embed = {
            title: `Year Roles`,
            description: `Click the buttons below for what year you're in here at OU.\n\nYou can only have one of these at once. At the start of each school year we'll try to remind you to click the next one!`,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(Number(config.colors.rainbow[2].hex), 10),
            thumbnail: {
            url: config.images.year_thmb,
            height: 0,
            width: 0
            }
        }


        const year = { embeds: [embed], components: [row1, row2] }
        return year;
    }
}