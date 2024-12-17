const { ModalBuilder, TextInputStyle } = require('discord.js');
const { TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');

const { logger } = require('../logger');

const insertGuild = require('../../db/queries/insertGuild');
const insertUser = require('../../db/queries/insertUser');
const insertGuildUser = require('../../db/queries/insertGuildUser');
const insertSupportTicket = require('../../db/queries/insertSupportTicket');
const { getSupportCategoryID, SupportCategory } = require('../../db/queries/getSupportCategory');


const SUPPORT_INPUT_FIELD_ID = 'supportInput';
const SUPPORT_CATEGORY_FIELD_ID = 'supportCategory';
const SUPPORT_IS_ANONYMOUS_FIELD_ID = 'supportAnonymous';
const SUPPORT_RESPONSE_REQUIRED_FIELD_ID = 'supportResponseRequired';
const {config} = require('../../config.json');
const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');


async function supportTicketCategoryHandler(interaction) {
    // Send the embed with the support ticket categories dropdown
    logger.debug('Support Ticket Category Handler called');

    const supportCategories = Object.values(SupportCategory).map(category => {return {
        label: category,
        value: category
    }});

    logger.debug('Support Ticket Categories retrieved');

    const categorySelectMenu = new StringSelectMenuBuilder()
        .setCustomId(SUPPORT_CATEGORY_FIELD_ID)
        .setPlaceholder('Select a category for the support ticket')
        .addOptions(
            supportCategories.map(category => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(category.label)
                    .setValue(category.value)
            })
        )

    logger.debug('Support Ticket Category Select Menu created');

    const row = new ActionRowBuilder().addComponents(categorySelectMenu);

    logger.debug('Support Ticket Category Row created');

    const embed = new EmbedBuilder()
        .setTitle('Support Ticket Category')
        .setDescription('Please select a category for your support ticket from the dropdown below.\n\nIf you are unsure, select "Other"');

    logger.debug('Support Ticket Category Embed created');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

/**
 * Display the Support Ticket modal. Sent when the user clicks on the Support Ticket button.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the modal was sent successfully, false otherwise
 */
async function supportTicketHandler(interaction) {
    logger.debug('Support Ticket Handler called');
    
    return await supportTicketCategoryHandler(interaction);
}

/**
 * Handle the submission of a Support Ticket. Sent when the user submits the Support Ticket modal.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<boolean>} true if the ticket was submitted successfully, false otherwise
 */
async function supportTicketSubmitHandler(interaction) {
    /**
     * 1. User submits a support ticket through the modal
     * 2. Insert a new support ticket into the database
     * 3. Send a message to the support channel with the ticket information
     * 4. Send a message to the user with the ticket information
     */

    // Retrieve the support ticket information
    
    const supportInput = interaction.fields.fields.has(SUPPORT_INPUT_FIELD_ID) ? interaction.fields.getTextInputValue(SUPPORT_INPUT_FIELD_ID) : undefined;
    
    const supportAnonymousText = interaction.fields.fields.has(SUPPORT_IS_ANONYMOUS_FIELD_ID) ? interaction.fields.getTextInputValue(SUPPORT_IS_ANONYMOUS_FIELD_ID) : '';
    const supportResponseRequiredText = interaction.fields.fields.has(SUPPORT_RESPONSE_REQUIRED_FIELD_ID) ? interaction.fields.getTextInputValue(SUPPORT_RESPONSE_REQUIRED_FIELD_ID) : '';

    const supportAnonymous = supportAnonymousText.toLowerCase() === 'y';
    const supportResponseRequired = supportResponseRequiredText.toLowerCase() === 'y';

    const userID = interaction.user.id;

    // Support Category
    const supportCategory = interaction.fields.fields.has(SUPPORT_CATEGORY_FIELD_ID) ? interaction.fields.getTextInputValue(SUPPORT_CATEGORY_FIELD_ID) : SupportCategory.Other;
    const supportCategoryID = await getSupportCategoryID(supportCategory).catch((error) => {
        logger.error(`Could not get support category ID for ${supportCategory}`, error.message);
        return undefined;
    });

    if (!supportCategoryID) {
        await interaction.reply({ephemeral: true, content: `Error: Could not determine support category ${supportCategory}`})
            .catch((error) => {logger.error(`Could not respond to interaction`, error.message)});
        return false;
    }

    // Insert Ticket
    await insertGuild(interaction.guild.id, interaction.guild.name);
    await insertUser(userID, interaction.user.username, interaction.user.discriminator);
    await insertGuildUser(interaction.guild.id, userID);
    const ticketID = await insertSupportTicket(userID, supportCategoryID, supportInput, supportAnonymous, supportResponseRequired).catch((error) => {
        logger.error(`Could not insert support ticket for ${interaction.user.username} (${interaction.user.id})`, error.message);
        return undefined;
    });

    if (!ticketID) {
        await interaction.reply({ephemeral: true, content: 'Error: Could not create support ticket'})
            .catch((error) => {logger.error(`Could not respond to interaction`, error.message)});
        return false;
    }

    const messageContent = `Support Ticket submitted by ${interaction.user.username} (${interaction.user.id})\nTicket ID: ${ticketID}\nCategory: ${supportCategory}\nAnonymous: ${supportAnonymous}\nResponse Required: ${supportResponseRequired}\n\n${supportInput}`;
    const supportChannel = interaction.guild.channels.cache.find(channel => {return channel.name === config.channels.support_ticket.name});

    if (!supportChannel) {
        logger.error(`Could not find the ${config.channels.support_ticket.name} channel`);
        await interaction.reply({ephemeral: true, content: `Error: Could not find the ${config.channels.support_ticket.name} channel`})
            .catch((error) => {logger.error(`Could not respond to interaction`, error.message)});
        return false;
    }

    return await supportChannel.send(messageContent).then(() => {
        logger.info(`Support Ticket submitted by ${interaction.user.username} (${interaction.user.id})`);
        return true;
    }).catch((error) => {
        logger.error(`Could not send message to ${config.channels.support_ticket.name}. ${error.message}`);
        return false;
    });
}


module.exports = {
    supportTicketHandler,
    supportTicketSubmitHandler
};