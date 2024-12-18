const { logger } = require('../logger');
const { getBotRolePosition } = require('./roles');
const { isValidHexColor } = require('../utils);


/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns 
 */
async function getGreatestRolePosition(interaction) {
    const maxPosition = await getBotRolePosition(interaction);
    let position = 1;
    
    // Find the highest positioned role with the 'Administrator' permissions that also has a color
    interaction.guild.roles.cache.forEach((role) => {
        if (role.position !== 0 && role.color !== 0 && role.permissions.toArray().includes('Administrator') && role.position < maxPosition && role.position+1 > position) {
            position = role.position+1;
        }
    });
    return position;
}

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

    if (!isValidHexColor(id)) {
        return await.editReply({content: 'There was an error! The hex color specified is not a valid color...\nTry `/set color` again'});
    }
    
    // Color value of 0 specifies no/default color in discord, but we want it to be fully black (like #000000), so we make it like #000001 instead
    const hex = parseInt(id, 16) === 0 ? 1 : parseInt(id, 16);

    const roleName = `${interaction.member.nickname ?? interaction.member.displayName ?? interaction.member.id}'s Color`;

    const memberRole = await interaction.member.roles.cache.find(role => {return role.name.endsWith(`'s Color`)});

    if (memberRole === undefined) {
        await interaction.guild.roles.create( {name: roleName, color: hex, permissions: [], position: await getGreatestRolePosition(interaction)} )
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
    
    await memberRole.setName(roleName)
        .catch(logger.error);
    await memberRole.setColor(hex)
        .catch(logger.error);
    await interaction.editReply({content: `#${id.toUpperCase()}`, embeds: [{title: 'Your color has been updated!', description: `${memberRole} is now your color`, color: hex}], components: []});
    return true;
}




module.exports = { colorHandler }
