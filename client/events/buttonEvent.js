const { Events } = require('discord.js');

const { config } = require('../config.json');
const { colorHandler } = require('../utils/roles.utils/colorRoles.js');
const { handleNeopronouns } = require('../utils/roles.utils/neopronouns');
const { toggleRole } = require('../utils/roles.utils/roles');
const { welcomeMember } = require('../utils/message.utils/welcomeMember');
const { logger } = require('../utils/logger');
const { ticketDisplayHandler } = require('../utils/ticketHandler');
const { isBanned } = require('../db/queries/insertBan.js');

const PRONOUNS_BUTTON_ID = 'pronouns';
const NEOPRONOUNS_BUTTON_ID = 'neo';
const TICKET_BUTTON_ID = 'ticket';
const COLOR_BUTTON_ID = 'color';
const NEW_MEMBER_BUTTON_ID = 'member';

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

        // Categorized button id's take the form parent:child. Eg. pronouns:she_her is part of the pronouns category with the child id being she_her. See more in config.json
        const id = interaction.customId.split(':');
        if (id.length === 0) { 
            logger.warn(`No button id found for the supplied button interaction`);
            await interaction.followUp({ephemeral: true, content: `There was an error! It looks like the button you clicked was invalid 🤔`});
            return false;
        }

        // Handle button events that show modals here before deferUpdate since modals must be shown first
        if (id[0] === PRONOUNS_BUTTON_ID) {
            if (id[1] === NEOPRONOUNS_BUTTON_ID) {
                return await handleNeopronouns(interaction);
            }
        }

        if (id[0] === TICKET_BUTTON_ID) {
            return await ticketDisplayHandler(interaction);
        }

        if (!await interaction.deferUpdate()
                .then(() => {
                    logger.info(`${interaction.customId} interaction deferred`);
                    return true;
                }).catch((error) => {
                    logger.warn(`${interaction.customId} could not be deferred (${error})`);
                    return false;
                })
        ) {
            return false;
        }

        if (interaction.customId === NEW_MEMBER_BUTTON_ID) {
            return await welcomeMember(interaction);
        }

        if (id[0] === COLOR_BUTTON_ID) {
            return await colorHandler(interaction, id[1]);
        }

        // Check if the role id is bannable
        if (config.channel_bans.ban_types.find(banType => {return banType.id_name === id[0]}) !== undefined) {
            // Check if the user is banned
            
            const bannedResponse = await isBanned(interaction.user.id, interaction.guild.id, id[0])
                .then(async (banned) => {
                    if (banned) {
                        logger.info(`${interaction.member.user.username} is banned from adding the role ${interaction.customId}`);
                        await interaction.followUp({ephemeral: true, content: `You are currently banned from this channel. Please contact a moderator for more information.`})
                            .catch((followUpError) => {logger.error(`Could not follow up on add role from ${interaction.member.user.username} for ${interaction.customId} (${followUpError}) - User is banned`)});
                        return false;
                    }
                    return true;
                }).catch(async (isBannedError) => {
                    logger.error(`Could not check if ${interaction.member.user.username} is banned (${isBannedError})`);
                    await interaction.followUp({ephemeral: true, content: `Something went wrong finding the role you selected D:`})
                        .catch((followUpError) => {logger.error(`Could not follow up on add role from ${interaction.member.user.username} for ${interaction.customId} (${followUpError})`)});
                    return false;
                });
            
            // If the user is banned, exit successfully
            if (!bannedResponse) { return true; }
        }

        // Get the role name from the config
        let roleName = "";
        if (id.length === 1) {
            roleName = config.roles[id[0]].name;
        } else {
            roleName = config.roles[id[0]][id[1]].name;
        }

        // Check if the role name is valid
        if (roleName === undefined || roleName.length === 0) { 
            logger.warn(`no role found for button: ${id.toString()}!`);
            await interaction.followUp({ephemeral: true, content: `Something went wrong finding the role you selected D:`})
                .catch((error) => {logger.error(`Could not follow up on add role from ${interaction.member.user.username} for ${interaction.customId} (${error})`)});
            return false;
        }
        
        // Add / Remove the role from the user
        await toggleRole(interaction, roleName, id);
        return true;
    },
};

