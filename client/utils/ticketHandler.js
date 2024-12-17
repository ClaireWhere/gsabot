const { ModalBuilder, TextInputStyle } = require('discord.js');
const { config } = require('../config.json');
const { logger } = require('./logger');
const gscAnnouncement = require('./message.utils/gsc_announcement');
const { TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { getChannelParentName } = require('./utils');
const { supportTicketSubmitHandler, supportTicketHandler } = require('./ticket.utils/supportTicket');

const MAX_INPUT_LENGTH = 1000;
const GSC_TALK_CHANNEL_NAME = 'gsc-talk';
const GSC_TICKET_ID = 'gsc_announcement';
const GSC_MODAL_ID = 'gscModal';
const GSC_INPUT_FIELD_ID = 'gscInput';
const GSC_PING_FIELD_ID = 'pingInput';
const SUPPORT_TICKET_ID = 'support_ticket';


/**
 * 
 * @param {string} customId The custom ID of the ticket button from the interaction
 * @returns {string} The ticket type ID. 'unknown' if the type is not recognized.
 */
function getTicketTypeID(customId) {
    const type = customId.split(':');
    // eslint-disable-next-line no-magic-numbers
    if (!type || type[0] !== 'ticket' || type.length !== 2) {
        return 'unknown';
    }

    switch (type[1]) {
        case 'gsc_announcement':
            return GSC_TICKET_ID;
        case 'support_ticket':
            return SUPPORT_TICKET_ID;
        default:
            return 'unknown';
    }
}

/**
 * Display the GSC Announcement modal. Sent when the user clicks on the GSC Announcement button.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the modal was sent successfully, false otherwise
 */
async function gscAnnouncementHandler(interaction) {
    if (!interaction.member.roles.cache.find(role => {return role.name === config.roles.gsc_student_assistant.name})
        && !interaction.member.roles.cache.find(role => {return role.name === config.roles.gsc_coordinator.name})
        && !interaction.member.roles.cache.find(role => {return role.name === config.roles.gsc_graduate_assistant.name})
    ) {
        logger.error(`User ${interaction.user.username} (${interaction.user.id}) does not have permissions to make GSC Announcements`);
        await interaction.reply({ephemeral: true, content: `You do not have permissions to make GSC Announcements!`})
            .catch((error) => {logger.error(`Could not respond to interaction. ${error.message}`)});
        return false;
    }
    const gscModal = new ModalBuilder()
        .setCustomId(GSC_MODAL_ID)
        .setTitle('Create a GSC Announcement');
    const gscInput = new TextInputBuilder()
        .setCustomId(GSC_INPUT_FIELD_ID)
        .setLabel('What would you like the announcement to say?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Type your message here. Please be descriptive.')
        .setMaxLength(MAX_INPUT_LENGTH);
    const pingInput = new TextInputBuilder()
        .setCustomId(GSC_PING_FIELD_ID)
        .setLabel('Should GSC Announcements be pinged?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('Y/N (leave blank for N)')
        .setMaxLength(1);
    const firstRow = new ActionRowBuilder().addComponents(gscInput);
    const secondRow = new ActionRowBuilder().addComponents(pingInput);

    gscModal.addComponents(firstRow);
    gscModal.addComponents(secondRow);

    return await interaction.showModal(gscModal)
        .then(() => {
            logger.debug(`GSC Announcement modal sent to ${interaction.user.username} (${interaction.user.id})`);
            return true;
        })
        .catch((error) => {
            logger.error(error);
            return false;
        });
}

/**
 * Display the Support Ticket modal. Sent when the user clicks on the Support Ticket button.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the modal was sent successfully, false otherwise
 */

/**
 * Handle the submission of a GSC Announcement. Sent when the user submits the GSC Announcement modal.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the announcement was sent successfully, false otherwise
 */
async function gscTicketSubmitHandler(interaction) {
    const announcementInput = interaction.fields.fields.has(GSC_INPUT_FIELD_ID) ? interaction.fields.getTextInputValue(GSC_INPUT_FIELD_ID) : undefined;
    const pingText = interaction.fields.fields.has(GSC_PING_FIELD_ID) ? interaction.fields.getTextInputValue(GSC_PING_FIELD_ID) : '';

    const ping = pingText.toLowerCase() === 'y';

    const messageContent = gscAnnouncement.execute(interaction, {ping: ping, content: announcementInput});
    const gscTalk = interaction.guild.channels.cache.find(channel => {return channel.name === GSC_TALK_CHANNEL_NAME && !getChannelParentName(channel).includes('archive')});

    if (!gscTalk) {
        logger.error(`Could not find the ${GSC_TALK_CHANNEL_NAME} channel`)
        await interaction.reply({ephemeral: true, content: `Error: Could not find the ${GSC_TALK_CHANNEL_NAME} channel`})
            .catch((error) => {logger.error(`Could not respond to interaction`, error.message)});
        return false;
    }

    return await gscTalk.send(messageContent).then(() => {
        logger.info(`GSC Announcement made by ${interaction.user.username} (${interaction.user.id})`);
        return true;
    }).catch((error) => {
        logger.error(`Could not send message to ${GSC_TALK_CHANNEL_NAME}. ${error.message}`);
        return false;
    });
}

/**
 * Display the appropriate modal for the ticket type. Sent when the user clicks on a ticket button.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the handler was successful, false otherwise
 */
async function ticketDisplayHandler(interaction) {
    const ticketID = getTicketTypeID(interaction.customId);

    switch (ticketID) {
        case GSC_TICKET_ID:
            return await gscAnnouncementHandler(interaction);
        case SUPPORT_TICKET_ID:
            logger.debug(`Sending support Ticket modal to ${interaction.user.username} (${interaction.user.id})`);
            return await supportTicketHandler(interaction);
        default:
            logger.error(`Unknown ticket type ${ticketID}`);
            return false;
    }
}

/**
 * Handle the submission of a ticket. Sent when the user submits a modal.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} id
 * @returns {Promise<boolean>} true if the ticket was submitted successfully, false otherwise
 */
async function ticketSubmitHandler(interaction) {
    const ticketID = getTicketTypeID(interaction.customId);
    
    switch (ticketID) {
        case GSC_TICKET_ID:
            return await gscTicketSubmitHandler(interaction);
        case SUPPORT_TICKET_ID:
            return await supportTicketSubmitHandler(interaction);
        default:
            logger.error(`Unknown ticket type ${interaction.customId}`);    
            return false;
    }
}



module.exports = { ticketDisplayHandler, ticketSubmitHandler }