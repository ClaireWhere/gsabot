const { Events } = require('discord.js');
const { removeNeopronouns, addNeopronouns } = require('../../utils/roles.utils/pronouns');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        if (!interaction.isModalSubmit()) { return false; }
        await interaction.deferUpdate()
            .catch((error) => {
                console.error(error.message);
                return;
            });
        
        // neopronounsModal
        if (interaction.customId === 'neopronounsModal') {
            // Remove neopronouns
            let neopronounsRemove = interaction.fields.getTextInputValue('removeNeopronouns');
            if (neopronounsRemove) {
                await removeNeopronouns(interaction, neopronounsRemove.split(', '));
            }
            
            // Add neopronouns
            let neopronounsAdd = interaction.fields.getTextInputValue('neopronounsInput');
            if (neopronounsAdd) {
                await addNeopronouns(interaction, neopronounsAdd.split(', '));
            }
        }
    }
}



