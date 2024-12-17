const { config } = require('../../config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { logger } = require('../logger');


const SUPPORT_TICKET_ID = 'support_ticket';
const GSC_TICKET_ID = 'gsc_announcement';

function getTicketTypeID(type) {
    switch (type) {
        case 'gsc_announcement':
            return GSC_TICKET_ID;
        case 'support_ticket':
            return SUPPORT_TICKET_ID;
        default:
            return 'unknown';
    }
}

module.exports = { 
    async execute(interaction) {
        logger.debug(`Ticket command received with options: {type: ${interaction.options.getString('type')}, title: ${interaction.options.getString('title')}, description: ${interaction.options.getString('description')}, label: ${interaction.options.getString('label')}, emoji: ${interaction.options.getString('emoji')}`);
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(interaction.options.getString('label'))
            .setCustomId(`ticket:${getTicketTypeID(interaction.options.getString('type'))}`)
            .setEmoji(interaction.options.getString('emoji'))
            .setDisabled(false);
        logger.debug(`Ticket button created`);
        const row = new ActionRowBuilder()
            .addComponents(button);
        logger.debug(`Ticket button row created`);

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
        logger.debug(`Ticket embed created`);

        const ticket = {embeds: [embed], components: [row] };
        logger.debug(`Ticket message created`);
        return ticket;
    }
 }