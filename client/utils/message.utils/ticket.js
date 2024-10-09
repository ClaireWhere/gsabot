const { config } = require('../../config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

function getTicketTypeID(type) {
    switch (type) {
        case 'gsc_announcement':
            return 'gsc_announcement';
        case 'new_ticket':
            return 'new_ticket';
        default:
            return null;
    }
}

module.exports = { 
    execute(interaction) {
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(interaction.options.getString('label'))
            .setCustomId(`ticket:${getTicketTypeID(interaction.options.getString('type'))}`)
            .setEmoji(interaction.options.getString('emoji'))
            .setDisabled(false);
        
        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = {
            title: interaction.options.getString('title'),
            description: interaction.options.getString('description'),
            timestamp: new Date().toISOString(),
            footer: {
                text: `Posted on`,
                icon_url: config.images.gsa_icon
            },
            author: {
                name: `Gender & Sexuality Alliance`,
                icon_url: config.images.gsa_icon
            },
            color: parseInt(Number(config.colors.light_red.darken[0].hex), 10)
        }

        const ticket = {embeds: [embed], components: [row] };
        return ticket;
    }
 }