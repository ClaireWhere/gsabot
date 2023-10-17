const { config } = require('../../client/config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = { 
    async execute(interaction) {
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`Submit GSC Announcement`)
            .setCustomId(`ticket:gsc_announcement`)
            .setDisabled(false);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = {
            title: "GSC Announcement Submissions",
            description: `# Click the button below to start a new GSC Announcement\nThis will not send anything immediately.`,
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

        const gsc_ticket = {embeds: [embed], components: [row] };
        return gsc_ticket;
    }
 }