const { config } = require('../../client/config.json');
const { ButtonStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');

module.exports = { 
    async execute(interaction) {
        const guild_owner = await interaction.client.guilds.cache.get(process.env.GUILD_ID).fetchOwner();
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`I agree to the rules of this server`)
            .setCustomId(`member`)
            .setDisabled(false);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = {
            title: "",
            description: `‎\n# **Make sure you've read through the rules, then click the button below saying that you agree to the rules of this server!**\n\n‎If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guild_owner}\n‎`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Posted on`,
                icon_url: config.images.gsa_icon
            },
            author: {
                name: `Gender & Sexuality Alliance`,
                icon_url: config.images.gsa_icon
            },
            color: parseInt(config.colors.light_red.darken[0].hex)
        }

        const agreement = {embeds: [embed], components: [row] };
        return agreement;
    }
 }