const { logger } = require('../logger');
const { getBotRolePosition } = require('./roles');
const { isValidHexColor } = require('../utils');

/**
 * Get the lowest positioned defined color role
 * @param {import('discord.js').Interaction} interaction 
 * @returns {number | undefined} The position of the lowest color role or undefined if no color roles exist
 */
function getLowestColorRolePosition(interaction) {
    let pos;
    interaction.guild.roles.cache.forEach((role) => {
        if (role.name.endsWith(`'s Color`) && (role.position < pos || pos === undefined)) {
            pos = role.position;
        }
    });
    return pos;
}

/**
 * Get the highest positioned role with a color set
 * @param {import('discord.js').Interaction} interaction 
 * @returns {number | undefined} The position of the highest role with a color set or undefined if no roles with colors exist
 */
function getHighestColoredRolePosition(interaction) {
    let pos;
    interaction.guild.roles.cache.forEach((role) => {
        if (role.color !== 0 && (role.position > pos || pos === undefined)) {
            pos = role.position;
        }
    });
    return pos;
}



/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {number} The position to set the new role
 */
function getNewRolePosition(interaction) {
    const absoluteMaxPosition = getBotRolePosition(interaction);
    const preferredPosition = getLowestColorRolePosition(interaction);
    const highestColoredPosition = getHighestColoredRolePosition(interaction);

    logger.debug(`preferredPosition: ${preferredPosition} | highestColoredPosition: ${highestColoredPosition} | absoluteMaxPosition: ${absoluteMaxPosition}`);
    logger.debug(`New role position: ${preferredPosition ?? highestColoredPosition ?? absoluteMaxPosition}`);

    return preferredPosition ?? highestColoredPosition ?? absoluteMaxPosition;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} message
 * @returns 
 */
async function cancelInteraction(interaction, message) {
    await interaction.editReply({content: `Interaction cancelled. ${message}`, embeds: [], components: []});
    return false;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction
 * @param {string} id 
 * @returns 
 */
async function colorHandler(interaction, id) {
    if (id.length === 0) { 
        return await interaction.editReply({content: 'There was an error! It looks like the button you clicked was invalid 🤔\nTry `/set color` again'});
    }
    if (id === 'no') {
        await cancelInteraction(interaction, '');
        return true;
    }

    if (!isValidHexColor(id)) {
        return await interaction.editReply({content: 'There was an error! The hex color specified is not a valid color...\nTry `/set color` again'});
    }
    
    // Color value of 0 specifies no/default color in discord, but we want it to be fully black (like #000000), so we make it like #000001 instead
    const hex = parseInt(id, 16) === 0 ? 1 : parseInt(id, 16);

    const roleName = `${interaction.member.nickname ?? interaction.member.displayName ?? interaction.member.id}'s Color`;

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const memberRole = member.roles.cache.find(role => {return role.name.endsWith(`'s Color`)});

    if (memberRole === undefined) {
        return await interaction.guild.roles.create( {name: roleName, color: hex, permissions: [], position: getNewRolePosition(interaction)} )
            .then(async role => {
                return await interaction.member.roles.add(role)
                    .then(async () => {
                        logger.info(`Added role ${roleName} to ${interaction.member.displayName}`);
                        await interaction.editReply({content: `#${id.toUpperCase()}`, embeds: [{title: 'Your color has been set!', description: `${role} is your color\nUse \`/color set\` again to change it`, color: hex}], components: []});
                        return true;
                    }).catch(async (error) => {
                        logger.error(error);
                        await interaction.editReply({content: 'There was an error adding your role. Try again and if the issue persists, please contact a moderator'});
                        return false;
                    });
            }).catch(async (error) => {
                logger.error(error);
                await interaction.editReply({content: 'There was an error creating your role. Try again and if the issue persists, please contact a moderator'});
                return false;
            });
    }
    
    await memberRole.setName(roleName)
        .then(() => {
            logger.info(`Updated role name to ${roleName}`);
        }).catch(error => {
            logger.error(error);
        });
    return await memberRole.setColor(hex)
        .then(async () => {
            return await interaction.editReply({content: `#${id.toUpperCase()}`, embeds: [{title: 'Your color has been updated!', description: `${memberRole} is now your color`, color: hex}], components: []});
        }).catch(async (error) => {
            logger.error(error);
            return await interaction.editReply({content: 'There was an error updating your color. Try again and if the issue persists, please contact a moderator'});
        });
}




module.exports = { colorHandler }
