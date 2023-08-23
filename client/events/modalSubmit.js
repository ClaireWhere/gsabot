const { Events } = require('discord.js');

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
        
    }
}



