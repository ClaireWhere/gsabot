const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { config } = require('../../../config.json');

module.exports = { 
    execute(interaction) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Minecraft`)
                    .setCustomId(`minecraft`)
                    .setDisabled(false)
            );

        const minecraftRole = interaction.guild.roles.cache.find(role => {return role.name === 'Minecraft'}) ?? '`@Minecraft`';

        const embed = {
            title: `Minecraft Role`,
            description: `Do you want access to the Minecraft server and talk about Minecraft?\n\nClick the button below to get the ${minecraftRole} role (click again to remove)`,
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(Number(config.colors.rainbow[4].hex), 10),
            thumbnail: {
                url: config.images.minecraft_thmb,
                height: 0,
                width: 0
            }
        }
        const minecraft = { embeds: [embed], components: [row1] }
        return minecraft;
    }
}