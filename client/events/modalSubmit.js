const { Events } = require('discord.js');
const { removeNeopronouns, addNeopronouns } = require('../utils/roles.utils/pronouns');
const { removeIntersection, arrayToLowerCase } = require('../utils/utils');
const { config } = require('../config.json');
const { logger } = require('../utils/logger');
const { ticketSubmitHandler } = require('../utils/ticketHandler');

const NEOPRONOUNS_MODAL_ID = 'neopronounsModal';
const NEOPRONOUNS_INPUT_FIELD = 'neopronounsInput';
const REMOVE_NEOPRONOUNS_FIELD = 'removeNeopronouns';
const GSC_MODAL_ID = 'gscModal';

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        if (!interaction.isModalSubmit()) { return false; }
        
        logger.info(`received ${this.name.toString()} interaction with id ${interaction.customId} from ${interaction.member.user.username}`);

        if (!await interaction.deferUpdate()
                .then(() => {
                    logger.info(`${this.name.toString()} interaction deferred`);
                    return true;
                }).catch((error) => {
                    logger.warn(`Unable to defer modal submit interaction from ${interaction.member.user.username} (${error})`);
                    return false;
                })
        ) {
            return false;
        }
        
        if (interaction.customId === NEOPRONOUNS_MODAL_ID) {
            const neopronounsRemove = interaction?.fields?.fields?.has(REMOVE_NEOPRONOUNS_FIELD) ? interaction.fields.getTextInputValue(REMOVE_NEOPRONOUNS_FIELD) : undefined;
            const neopronounsAdd = interaction?.fields?.fields?.has(NEOPRONOUNS_INPUT_FIELD) ? interaction.fields.getTextInputValue(NEOPRONOUNS_INPUT_FIELD) : undefined;

            const removeArray = arrayToLowerCase((neopronounsRemove ?? '').split(', '));
            const addArray = removeIntersection(arrayToLowerCase((neopronounsAdd ?? '').split(', ').concat(config.roles.pronouns.neo.name)), removeArray);

            await removeNeopronouns(interaction, removeArray);
            await addNeopronouns(interaction, addArray);
        }

        if (interaction.customId === GSC_MODAL_ID) {
            return await ticketSubmitHandler(interaction);
        }
        return false;
    }
}



