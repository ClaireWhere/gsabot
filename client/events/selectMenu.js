const { Events, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const { logger } = require('../utils/logger');

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