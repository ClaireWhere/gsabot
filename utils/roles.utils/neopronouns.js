const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getNeopronounRoles } = require('./roles');
const { logger } = require('../logger');


/**
 * @param {import('discord.js').Interaction} interaction 
 */
async function handleNeopronouns(interaction) {
    const neopronounsModal = new ModalBuilder()
        .setCustomId('neopronounsModal')
        .setTitle('Manage Your Neopronouns!');

    const previousRoles = await getNeopronounRoles(interaction);
    const previousNeopronouns = 
    previousRoles.length > 0 
        ? new TextInputBuilder()
            .setCustomId('removeNeopronouns')
            .setLabel(`${previousRoles.join(', ').substring(0, 45)}`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder(`Type the neopronouns you would like removed from your profile (if any) separated by commas as above`)
            .setMinLength(4)
            .setMaxLength(200)
        : undefined;
    
    const neopronounsInput = new TextInputBuilder()
        .setCustomId('neopronounsInput')
        .setLabel('what neopronouns would you like to add?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(previousRoles.length > 0 ? false : true)
        .setPlaceholder('Type the neopronouns you would like to add to your profile separated by commas. (e.g. xe/xem, ey/em)')
        .setMinLength(4)
        .setMaxLength(200);

    const firstRow = new ActionRowBuilder().addComponents(previousNeopronouns);
    const secondRow = new ActionRowBuilder().addComponents(neopronounsInput);

    if (previousNeopronouns) {
        neopronounsModal.addComponents(firstRow);
    }
    neopronounsModal.addComponents(secondRow);

    await interaction.showModal(neopronounsModal)
        .catch((error) => {
            logger.error(error);
            return false;
        })
    return true;
}

module.exports = { handleNeopronouns }