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
    await interaction.editReply({content: `Interaction cancelled ${message}`, embeds: [], components: []});
    return false;
}

async function colorHandler(interaction, id) {
    if (id.length === 0) { 
        return await cancelInteraction(interaction, '. There was an error! It looks like the button you clicked was invalid 🤔\nTry `/set color` again');
    }
    if (id === 'no') {
        await cancelInteraction(interaction, '');
        return true;
    }
    
    // Color value of 0 specifies no/default color in discord, but we want it to be fully black (like #000000), so we make it like #000001 instead
    const hex = parseInt(id, 16) === 0 ? 1 : parseInt(id, 16);

    const roleName = `${interaction.member.nickname ?? interaction.member.displayName ?? interaction.member.id}'s Color`;

    const memberRole = await interaction.member.roles.cache.find(role => {return role.name.endsWith(`'s Color`)});

    if (memberRole === undefined) {
        return await interaction.guild.roles.create( {name: roleName, color: hex, permissions: [], position: getNewRolePosition(interaction)} )
            .then(async role => {
                    await interaction.member.roles.add(role);
                    await interaction.editReply({content: `#${id.toUpperCase()}`, embeds: [{title: 'Your color has been set!', description: `${role} is your color\nUse \`/color set\` again to change it`, color: hex}], components: []});
                })
            .catch(async error => {
                logger.error(error);
                return await error(interaction, '. There was an error creating your role. Try again and if the issue persists, please contact a moderator');
            });
        return true;
    }
    
    let response;
    response = await memberRole.setName(roleName)
        .catch(logger.error)
        .then(() => {return true});
    if (!response) {
        return await cancelInteraction(interaction, '. There was an error updating your role. Try again and if the issue persists, please contact a moderator');
    }
    response = await memberRole.setColor(hex)
        .catch(logger.error)
        .then(() => {return true});
    if (!response) {
        return await cancelInteraction(interaction, '. There was an error updating your role. Try again and if the issue persists, please contact a moderator');
    }

    await interaction.editReply({content: `#${id.toUpperCase()}`, embeds: [{title: 'Your color has been updated!', description: `${memberRole} is now your color`, color: hex}], components: []});
    return true;
}




module.exports = { colorHandler }
