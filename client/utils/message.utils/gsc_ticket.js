const { config } = require('../../config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getRandomName } = require('../utils');

module.exports = {
    async execute(interaction, isEdit = false) {
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
                text: isEdit ? `Updated` : `Posted`,
                icon_url: config.images.gsa_icon
            },
            author: {
                name: getRandomName(),
                icon_url: config.images.gsa_icon
            },
            color: parseInt(Number(config.colors.light_red.darken[0].hex), 10)
        }

        const gscTicket = {embeds: [embed], components: [row] };
        return gscTicket;
    }
 }
