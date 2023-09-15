const { Events } = require('discord.js');
const { removeNeopronouns, addNeopronouns } = require('../../utils/roles.utils/pronouns');
const { removeIntersection, arrayToLowerCase } = require('../../utils/utils');
const { config } = require('../config.json');
const { logger } = require('../../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        if (!interaction.isModalSubmit()) { return false; }
        
        logger.info(`received ${this.name.toString()} interaction with id ${interaction.customId} from ${interaction.member.user.username}`);

        if (!await interaction.deferUpdate()
                .then((res) => {
                    logger.info(`${this.name.toString()} interaction deferred`);
                    return true;
                }).catch((error) => {
                    logger.warn(`Unable to defer modal submit interaction from ${interaction.member.user.username} (${error})`);
                    return false;
                })
        ) {
            return false;
        }
        
        // neopronounsModal
        if (interaction.customId === 'neopronounsModal') {
            let neopronounsRemove;
            let neopronounsAdd;

            // Remove neopronouns
            if (interaction.fields.fields.has('removeNeopronouns')) {
                neopronounsRemove = interaction.fields.getTextInputValue('removeNeopronouns');
            }
            if (interaction.fields.fields.has('neopronounsInput')) {
                neopronounsAdd = interaction.fields.getTextInputValue('neopronounsInput');
            }

            const removeArray = arrayToLowerCase((neopronounsRemove ?? '').split(', '));
            const addArray = removeIntersection(arrayToLowerCase((neopronounsAdd ?? '').split(', ').concat(config.roles.pronouns.neo.name)), removeArray);

            await removeNeopronouns(interaction, removeArray);
            await addNeopronouns(interaction, addArray);
        }
    }
}



