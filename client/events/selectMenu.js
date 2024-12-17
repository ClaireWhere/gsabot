const { Events, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const { logger } = require('../utils/logger');
const { insertSupportTicket } = require('../db/queries/insertSupportTicket');
const { getSupportCategoryID } = require('../db/queries/getSupportCategory');
const { getGuildUserID } = require('../db/queries/insertGuildUser');

const MAX_INPUT_LENGTH = 1000;
const SUPPORT_TICKET_ID = 'support_ticket';
const SUPPORT_MODAL_ID = 'supportModal';
const SUPPORT_INPUT_FIELD_ID = 'supportInput';
const SUPPORT_IS_ANONYMOUS_FIELD_ID = 'supportAnonymous';
const SUPPORT_RESPONSE_REQUIRED_FIELD_ID = 'supportResponseRequired';

async function handleSupportCategory(interaction) {
    const categoryName = interaction.values[0];
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const categoryArticle = vowels.includes(categoryName.charAt(0).toLowerCase()) ? 'an' : 'a';
    
    logger.debug(`Support category selected: ${categoryName}`);

    const categoryID = await getSupportCategoryID(categoryName);
    logger.debug(`Support category ID: ${categoryID}`);

    const guildUserID = await getGuildUserID(interaction.guild.id, interaction.member.user.id);
    logger.debug(`Guild User ID: ${guildUserID}`);

    const ticketID = await insertSupportTicket(guildUserID, categoryID);

    if (!ticketID) {
        logger.error(`Error creating support ticket for ${interaction.member.user.username}`);
        return false;
    }
    logger.info(`Support ticket created for ${interaction.member.user.username} with ID ${ticketID}`);

    const supportModal = new ModalBuilder()
        .setCustomId(SUPPORT_MODAL_ID)
        .setTitle(`Submit ${categoryArticle} ${categoryName} Support Ticket`);
    logger.debug(`Support Ticket modal created`);
    
    const supportContentInput = new TextInputBuilder()
        .setCustomId(SUPPORT_INPUT_FIELD_ID)
        .setLabel('Ticket Content.')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Type the context of the submission here. Please be descriptive.')
        .setMaxLength(MAX_INPUT_LENGTH);
    
    logger.debug(`Support Ticket modal input created`);

    const supportAnonymousInput = new TextInputBuilder()
        .setCustomId(SUPPORT_IS_ANONYMOUS_FIELD_ID)
        .setLabel('Link your Discord account?')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Y/N Link your Discord account to this ticket? (leave blank or N to remain anonymous)')
        .setMaxLength(1);
    
    logger.debug(`Support Ticket modal anonymous created`);

    const supportResponseRequiredInput = new TextInputBuilder()
        .setCustomId(SUPPORT_RESPONSE_REQUIRED_FIELD_ID)
        .setLabel('Response Required?')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Y/N Do you require a response to this ticket? (leave blank or N if no response is needed)')
        .setMaxLength(1);

    logger.debug(`Support Ticket modal created`);

    supportModal.addComponents(new ActionRowBuilder().addComponents(supportContentInput));
    supportModal.addComponents(new ActionRowBuilder().addComponents(supportAnonymousInput));
    supportModal.addComponents(new ActionRowBuilder().addComponents(supportResponseRequiredInput));

    logger.debug(`Support Ticket modal components added`);

    await interaction.showModal(supportModal)
        .then(() => {
            logger.debug(`Support Ticket modal sent to ${interaction.user.username} (${interaction.user.id})`);
            return true;
        })
        .catch((error) => {
            logger.error(error);
            return false;
        });

    await interaction.editReply({ content: `${categoryName} Support ticket started!`, embeds: [], components: [] })
        .catch((error) => { logger.error(`Could not edit reply for ${interaction.member.user.username} (${error})`) });
}

module.exports = {
    name: Events.InteractionCreate,
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (!interaction.isAnySelectMenu()) { return false; }

        logger.debug(`received interaction`);
        
        logger.debug(`received ${this.name.toString()} interaction with id ${interaction.customId} from ${interaction.member.user.username}`);

        logger.debug(`Select Menu option selected: ${interaction.values}`);

        if (interaction.customId === 'supportCategory') {
            return await handleSupportCategory(interaction);
        }

        const res = await interaction.deferUpdate()
            .then(() => {
                logger.debug(`${interaction.customId} deferred`);
                return true;
            })
            .catch((error) => {
                logger.warn(`${interaction.customId} could not be deferred (${error})`);
                return false;
            });
        if (!res) { return false; }

        
        return false;
    }
}