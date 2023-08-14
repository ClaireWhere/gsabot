const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../client/config.json');

module.exports = { 
    async execute(interaction) {
        const row_1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Minecraft`)
                    .setCustomId(`minecraft`)
                    .setDisabled(false)
            );

        const minecraft_role = await interaction.guild.roles.cache.find(role => role.name === 'Minecraft');

        const embed = {
            title: `Minecraft Role`,
            description: `Do you want access to the Minecraft server and talk about Minecraft?\n\nClick the button below to get the ${minecraft_role} role (click again to remove)`,
            color: parseInt(config.colors.purple.lighten[3].hex),
            thumbnail: {
                url: config.images.minecraft_thmb,
                height: 0,
                width: 0
            }
        }
        const minecraft = { embeds: [embed], components: [row_1] }
        return minecraft;
    }
}