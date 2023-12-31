const { PermissionsBitField } = require('discord.js');
const { config } = require('../../client/config.json');
const { logger } = require('../logger');

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
function findRole(interaction, role_name) {
    var role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === role_name.toLowerCase());
    if (!role) {
        return false;
    }
    return role;
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function removeExclusive(interaction, id) {
    if (id.length == 0) { return false; }
    
    var role_id = id[0];
    var root_element = config.roles;
    if (id.length > 1) {
        role_id = id[1];
        root_element = config.roles[id[0]];
    }

    const exclusive = root_element[role_id].exclusion;
    if (exclusive == undefined || exclusive.length == 0) {
        return true;
    }

    for (const element of exclusive) {
        try {
            if (await memberHasRoleName(interaction, root_element[element].name)) {
                await removeFormatRole(interaction, root_element[element].name);
            }
        } catch (error) {
            logger.error(`error while removing exclusive roles for ${id} at ${element} (${error})`);
        }
    }
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function memberHasRoleName(interaction, role_name) {
    return await interaction.member.roles.cache.some(role => role.name === role_name);
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {import('discord.js').Role} role 
 * @returns 
 */
async function memberHasRole(interaction, role) {
    return await interaction.member.roles.cache.some(r => r.id === role.id);
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {import("discord.js").Role} role 
 * @returns 
 */
async function addRole(interaction, role) {
    return await interaction.member.roles.add(role)
        .then((res) => {
            return true;
        })
        .catch(async (error) => {
            logger.error(`Unable not add role ${role ?? ''} (${error})`);
            await interaction.followUp({
                ephemeral: true,
                content: `Something went wrong adding your ${role ?? ''} role!` 
            }).catch((error) => {
                logger.error(`Unable to respond to add role interaction from ${interaction.member.user.username} for ${role ?? ''} (${error})`); 
            });
            return false;
        });
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function addRoleByName(interaction, role_name) {
    var role = interaction.guild.roles.cache.find(role => role.name === role_name);
    if (!role) { 
        await interaction.followUp({
            ephemeral: true,
            content: `Something went wrong adding your ${role_name} role!`
        }).catch((error) => {
            logger.error(`Unable to respond to add role by name interaction from ${interaction.member.user.username} for ${role_name} (${error})`);
        });
        return false; 
    }
    return await addRole(interaction, role);
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function addFormatRole(interaction, role_name) {
    var role = interaction.guild.roles.cache.find(role => role.name === role_name);
    if (!role) { return false; }
    const res = await addRole(interaction, role);
    if (!res) { return false; }
    
    if (role_name == 'GSA Member') {
        return await interaction.followUp({ephemeral: true, content: `🥳🥳 You are now a officially a part of the GSA Discord server!`})
            .then((res) => { return true; })
            .catch((error) => {
                logger.error(`Unable to respond to Welcome Agreement interaction for ${interaction.member.user.username} (${error})`); 
                return false;
            });
    } else {
        return await interaction.followUp({ephemeral: true, content: `You now have the ${role} role!`})
            .then((res) => { return true; })
            .catch((error) => {
                logger.error(`Unable to respond to add role interaction from ${interaction.member.user.username} for ${role} (${error})`);
                return false;
            });
    }
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {import("discord.js").Role} role
 * @returns 
 */
async function removeRole(interaction, role) {
    return await interaction.member.roles.remove(role)
        .then((res) => { return true; })    
        .catch(async (error) => {
            logger.error(`Unable to remove role ${role.name} from ${interaction.member.user.username} (${error})`);
            await interaction.followUp({ephemeral: true, content: `Something went wrong removing your ${role ?? ''} role!`})
                .catch((error) => { logger.error(`Unable to respond to remove role interaction ${error}`); });
            return false;
        })
}


/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function removeRoleByName(interaction, role_name) {
    var role = interaction.guild.roles.cache.find(role => role.name === role_name);
    if (!role) { 
        await interaction.followUp({
            ephemeral: true,
            content: `Something went wrong removing your ${role_name} role!`
        }).catch((error) => {
            logger.error(`Unable to respond to remove role by name interaction (${error})`);
        });
        return false; 
    }
    return await removeRole(interaction, role);
}

async function removeFormatRole(interaction, role_name) {
    var role = interaction.guild.roles.cache.find(role => role.name === role_name);
    if (!role) { return false; }
    const res = await removeRole(interaction, role);
    if (!res) { return false; }
    return await interaction.followUp({ephemeral: true, content: `You no longer have the ${role} role!`})
        .then((res) => { return true; })
        .catch((error) => {
            logger.error(`Unable to respond to remove role interaction (${error})`);
            return false;
        });
}



/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name - the name of the role to toggle
 * @param {string} id - the role id of the role to toggle
 * @returns 
 */
async function toggleRole(interaction, role_name, id) {
    if (await memberHasRoleName(interaction, role_name)) {
        return await removeFormatRole(interaction, role_name);
    } else {
        await addFormatRole(interaction, role_name);
        await removeExclusive(interaction, id);
    }
    return true;
}


function getPermissionsFromArray(array) {
    if (array === undefined || array.length === 0) {
        return [];
    }
    var permissions = [];
    array.forEach(permission => {
        permissions.push(PermissionsBitField.Flags[permission]);
    });
    return permissions;
}


/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns 
 */
function getMaxNeopronounsPosition(interaction) {
    try {
        const r = interaction.guild.roles.cache.find(role => role.name === config.roles.pronouns.neo.name);
        return r.position;
    } catch (error) {
        logger.error(error);
        return 1;
    }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns 
 */
function getMinNeopronounsPosition(interaction) {
    var maxPos = getMaxNeopronounsPosition(interaction);
    var minPos = 0;
    var pronoun_roles = getConfigRoles().map(role => role.name);
    try {
        interaction.guild.roles.cache.forEach((role) => {
            if ((role.color != parseInt(config.roles.pronouns.neo.color) || pronoun_roles.includes(role.name)) && (role.position < maxPos && role.position > minPos)) {
                minPos = role.position;
            }
        });
        return minPos+1;
    } catch (error) {
        logger.error(error);
        return 1;
    }
}

/**
 * gets the interacting member's neopronoun roles
* @param {import('discord.js').Interaction} interaction
 * @returns {Promise<Collection<string, import('discord.js').Role>} an array containing the interacting member's neopronoun roles
 * 
 */
async function getNeopronounRoles(interaction) {
    const maxPos = getMaxNeopronounsPosition(interaction);
    const minPos = getMinNeopronounsPosition(interaction);
    const memberRoles = await interaction.member.roles.cache;
    const roles = interaction.guild.roles.cache.filter((role) => role.position <= maxPos && role.position >= minPos && memberRoles.some((r) => r.id === role.id ));
    return roles.map((role) => role.name);
}

/**
 * gets the role position of the bot's role
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<number>}
 */
async function getBotRolePosition(interaction) {
    const botUser = await interaction.guild.members.fetch(interaction.client.user.id);
    return interaction.guild.roles.cache.find( role => botUser.roles.cache.has(role.id) ).position-1;
}

/**
 * 
 * @param {object | undefined} root the starting root position - config.roles if unspecified
 * @param {object[] | undefined} roles the starting array of roles - empty if unspecified
 * @returns {{name: string, color: string, id: string | undefined, permissions: string[] | undefined, exclusion: string[] | undefined}[]} array of all roles specified in config.roles
 */
function getConfigRoles(root, roles) {
    if (!root) { 
        root = require('../../client/config.json').config.roles;
        var roles = [];
    }
    for (const [key, value] of Object.entries(root)) {
        if (!value.name) {
            getConfigRoles(value, roles);
        } else {
            roles.push(value);
        }
    }
    return roles;
}

module.exports = { removeExclusive, memberHasRoleName, memberHasRole, addRole, addRoleByName, addFormatRole, removeRole, removeRoleByName, removeFormatRole, toggleRole, findRole, getPermissionsFromArray, getMaxNeopronounsPosition, getMinNeopronounsPosition, getNeopronounRoles, getBotRolePosition, getConfigRoles };