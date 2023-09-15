const { Events } = require('discord.js');

const { config } = require('../config.json');
const { colorHandler } = require('../../utils/roles.utils/colorRoles.js');
const { handleNeopronouns } = require('../../utils/roles.utils/neopronouns');
const { toggleRole } = require('../../utils/roles.utils/roles');
const { welcomeMember } = require('../../utils/message.utils/welcomeMember');
const { logger } = require('../../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (!interaction.isButton()) { return false; }

        logger.info(`received ${this.name.toString()} interaction with id ${interaction.customId} from ${interaction.member.user.username}`);

        // Handle button events that show modals here before deferUpdate since modals must be shown first
        if (interaction.customId === 'pronouns:neo') {
            return await handleNeopronouns(interaction);
        }

        if (!await interaction.deferUpdate()
                .then((res) => {
                    logger.info(`${interaction.customId} interaction deferred`);
                    return true;
                }).catch((error) => {
                    logger.warn(`${interaction.customId} could not be deferred (${error})`);
                    return false;
                })
        ) {
            return false;
        }

        if (interaction.customId === 'member') {
            return await welcomeMember(interaction);
        }

        // categorized button id's take the form parent:child. Eg. pronouns:she_her is part of the pronouns category with the child id being she_her. See more in config.json
        const id = interaction.customId.split(':');
        if (id.length === 0) { 
            logger.warn(`No button id found for the supplied button interaction`);
            await interaction.followUp({ephemeral: true, content: `There was an error! It looks like the button you clicked was invalid 🤔`});
            return false;
        }

        if (id[0] === 'color') {
            return await colorHandler(interaction, id[1]);
        }

        var role_name = "";
        if (id.length == 1) {
            role_name = config.roles[id[0]].name;
        } else {
            role_name = config.roles[id[0]][id[1]].name;
        }

        if (role_name === undefined || role_name.length === 0) { 
            logger.warn(`no role found for button: ${id.toString()}!`);
            await interaction.followUp({ephemeral: true, content: `Something went wrong finding the role you selected D:`})
                .catch((error) => {logger.error(`could not follow up on add role from ${interaction.member.user.username} for ${interaction.customId} (${error})`)});
            return false;
        }
        
        await toggleRole(interaction, role_name, id);
        return true;
    },
};

