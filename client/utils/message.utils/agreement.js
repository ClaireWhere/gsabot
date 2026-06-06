const { config } = require('../../config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    async execute(interaction, isEdit = false) {
	const guildOwner = await interaction.guild.fetchOwner();

        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`I agree to the rules of this server`)
            .setCustomId(`member`)
            .setDisabled(false);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = {
            title: "",
            description: `‎\n# **Make sure you've read through the rules, then click the button below saying that you agree to the rules of this server!**\n\n‎If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guildOwner}\n‎`,
            timestamp: new Date().toISOString(),
            footer: {
                text: isEdit ? `Updated` : `Posted`,
                icon_url: config.images.gsa_icon
            },
            author: {
                name: `Sexuality And Gender Entrance`,
                icon_url: config.images.gsa_icon
            },
            // eslint-disable-next-line no-magic-numbers
            color: parseInt(Number(config.colors.light_red.darken[0].hex), 10)
        }

        const agreement = {embeds: [embed], components: [row] };

        return agreement;
    }
 }
