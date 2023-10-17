const { ModalBuilder, TextInputStyle } = require('discord.js');
const { config } = require('../client/config.json');
const { logger } = require('./logger');
const gsc_announcement = require('./message.utils/gsc_announcement');
const { TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { getChannelParentName } = require('./utils');


/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} id
 */
async function ticketDisplayHandler(interaction, id) {
    if (id === 'gsc_announcement') {
        return await gscAnnouncementHandler(interaction);
    }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} id
 */
async function ticketSubmitHandler(interaction) {
    const announcementInput = interaction.fields.fields.has('gscInput') ? interaction.fields.getTextInputValue('gscInput') : undefined;
    const pingText = interaction.fields.fields.has('pingInput') ? interaction.fields.getTextInputValue('pingInput') : '';

    const ping = pingText.toLowerCase() === 'y';

    const message_content = await gsc_announcement.execute(interaction, {ping: ping, content: announcementInput});
    const gsc_talk = interaction.guild.channels.cache.find(channel => channel.name === 'gsc-talk' && !getChannelParentName(channel).includes('archive'));

    if (!gsc_talk) {
        logger.error(`Could not find gsc-talk channel`)
        await interaction.reply({ephemeral: true, content: `Error: Could not find gsc-talk channel`})
            .catch((error) => {logger.error(`Could not respond to interaction`)});
        return;
    }

    await gsc_talk.send(message_content);
    return true;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 */
async function gscAnnouncementHandler(interaction) {
    if (!interaction.member.roles.cache.find(role => role.name === config.roles.gsc_student_assistant.name)
     && !interaction.member.roles.cache.find(role => role.name === config.roles.gsc_coordinator.name)
     && !interaction.member.roles.cache.find(role => role.name === config.roles.gsc_graduate_assistant.name)
     ) {
        logger.error(`User does not have permissions to make GSC Announcements`)
        await interaction.reply({ephemeral: true, content: `You do not have permissions to make GSC Announcements!`})
            .catch((error) => {logger.error(`Could not respond to interaction. ${error.message}`)});
        return;
    } 
    var gscModal = new ModalBuilder()
        .setCustomId('gscModal')
        .setTitle('Create a GSC Announcement');
    const gscInput = new TextInputBuilder()
        .setCustomId('gscInput')
        .setLabel('What would you like the announcement to say?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Type your message here. Please be descriptive.')
        .setMaxLength(1000);
    const pingInput = new TextInputBuilder()
        .setCustomId('pingInput')
        .setLabel('Should GSC Announcements be pinged?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('Y/N (leave blank for N)')
        .setMaxLength(1);
    const firstRow = new ActionRowBuilder().addComponents(gscInput);
    const secondRow = new ActionRowBuilder().addComponents(pingInput);

    gscModal.addComponents(firstRow);
    gscModal.addComponents(secondRow);

    await interaction.showModal(gscModal)
        .catch((error) => {
            logger.error(error);
            return false;
        })
    logger.info('Modal sent to user');
    return true;
}

module.exports = { ticketDisplayHandler, ticketSubmitHandler }