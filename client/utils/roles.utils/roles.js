const { PermissionsBitField } = require('discord.js');
const { config } = require('../../config.json');
const { logger } = require('../logger');

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {import("discord.js").Role | null} the role if found, null otherwise
 */
function findRole(interaction, roleName) {
    const role = interaction.guild.roles.cache.find(_role => {return _role.name.toLowerCase() === roleName.toLowerCase()});
    if (!role) {
        return null;
    }
    return role;
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {Promise<boolean>} true if the member has the role, false otherwise
 */
async function memberHasRoleName(interaction, roleName) {
    return await interaction.member.roles.cache.some(role => {return role.name === roleName});
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {import("discord.js").Role} role
 * @returns {Promise<boolean>} true if the role was removed successfully, false otherwise
 */
async function removeRole(interaction, role) {
    return await interaction.member.roles.remove(role)
        .then(() => { return true; })    
        .catch(async (removeRoleError) => {
            logger.error(`Unable to remove role ${role.name} from ${interaction.member.user.username} (${removeRoleError})`);
            await interaction.followUp({ephemeral: true, content: `Something went wrong removing your ${role ?? ''} role!`})
                .catch((followUpError) => { logger.error(`Unable to respond to remove role interaction ${followUpError}`); });
            return false;
        })
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {Promise<boolean>} true if the role was removed successfully, false otherwise
 */
async function removeFormatRole(interaction, roleName) {
    const role = interaction.guild.roles.cache.find(_role => {return _role.name === roleName});
    if (!role) { return false; }
    const res = await removeRole(interaction, role);
    if (!res) { return false; }
    return await interaction.followUp({ephemeral: true, content: `You no longer have the ${role} role!`})
        .then(() => { return true; })
        .catch((followUpError) => {
            logger.error(`Unable to respond to remove role interaction (${followUpError})`);
            return false;
        });
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns {Promise<boolean>} true if all exclusive roles were removed successfully, false otherwise
 */
async function removeExclusive(interaction, id) {
    if (id.length === 0) { return false; }
    
    let roleId = id[0];
    let rootElement = config.roles;
    if (id.length > 1) {
        roleId = id[1];
        rootElement = config.roles[id[0]];
    }

    const exclusive = rootElement[roleId].exclusion;
    if (exclusive === undefined || exclusive.length === 0) {
        return true;
    }

    let success = true;
    for (const element of exclusive) {
        try {
            if (await memberHasRoleName(interaction, rootElement[element].name)) {
                const res = await removeFormatRole(interaction, rootElement[element].name);
                if (!res) {
                    success = false;
                }
            }
        } catch (error) {
            logger.error(`error while removing exclusive roles for ${id} at ${element} (${error})`);
        }
    }
    return success;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {import('discord.js').Role} role 
 * @returns {Promise<boolean>} true if the member has the role, false otherwise
 */
async function memberHasRole(interaction, role) {
    return await interaction.member.roles.cache.some(_role => {return _role.id === role.id});
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {import("discord.js").Role} role 
 * @returns {Promise<boolean>} true if the role was added successfully, false otherwise
 */
async function addRole(interaction, role) {
    return await interaction.member.roles.add(role)
        .then(() => {
            return true;
        })
        .catch(async (roleAddError) => {
            logger.error(`Unable not add role ${role ?? ''} (${roleAddError})`);
            await interaction.followUp({
                ephemeral: true,
                content: `Something went wrong adding your ${role ?? ''} role!` 
            }).catch((followUpError) => {
                logger.error(`Unable to respond to add role interaction from ${interaction.member.user.username} for ${role ?? ''} (${followUpError})`); 
            });
            return false;
        });
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {Promise<boolean>} true if the role was added successfully, false otherwise
 */
async function addRoleByName(interaction, roleName) {
    const role = interaction.guild.roles.cache.find(_role => {return _role.name === roleName});
    if (!role) { 
        await interaction.followUp({
            ephemeral: true,
            content: `Something went wrong adding your ${roleName} role!`
        }).catch((error) => {
            logger.error(`Unable to respond to add role by name interaction from ${interaction.member.user.username} for ${roleName} (${error})`);
        });
        return false; 
    }
    return await addRole(interaction, role);
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {Promise<boolean>} true if the role was added successfully, false otherwise
 */
async function addFormatRole(interaction, roleName) {
    const role = interaction.guild.roles.cache.find(_role => {return _role.name === roleName});
    if (!role) { return false; }
    const res = await addRole(interaction, role);
    if (!res) { return false; }
    
    if (roleName === 'GSA Member') {
        return await interaction.followUp({ephemeral: true, content: `🥳🥳 You are now a officially a part of the GSA Discord server!`})
            .then(() => { return true; })
            .catch((error) => {
                logger.error(`Unable to respond to Welcome Agreement interaction for ${interaction.member.user.username} (${error})`); 
                return false;
            });
    }
    return await interaction.followUp({ephemeral: true, content: `You now have the ${role} role!`})
        .then(() => { return true; })
        .catch((error) => {
            logger.error(`Unable to respond to add role interaction from ${interaction.member.user.username} for ${role} (${error})`);
            return false;
        });
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName 
 * @returns {Promise<boolean>} true if the role was removed successfully, false otherwise
 */
async function removeRoleByName(interaction, roleName) {
    const role = interaction.guild.roles.cache.find(_role => {return _role.name === roleName});
    if (!role) { 
        await interaction.followUp({
            ephemeral: true,
            content: `Something went wrong removing your ${roleName} role!`
        }).catch((error) => {
            logger.error(`Unable to respond to remove role by name interaction (${error})`);
        });
        return false; 
    }
    return await removeRole(interaction, role);
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} roleName - the name of the role to toggle
 * @param {string} id - the role id of the role to toggle
 * @returns {Promise<boolean>} true if the role was toggled successfully, false otherwise
 */
async function toggleRole(interaction, roleName, id) {
    if (await memberHasRoleName(interaction, roleName)) {
        return await removeFormatRole(interaction, roleName);
    }
    await addFormatRole(interaction, roleName);
    await removeExclusive(interaction, id);
    return true;
}

/**
 * 
 * @param {*} array 
 * @returns
 */
function getPermissionsFromArray(array) {
    if (array === undefined || array.length === 0) {
        return [];
    }
    const permissions = [];
    array.forEach(permission => {
        permissions.push(PermissionsBitField.Flags[permission]);
    });
    return permissions;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {number} the position of the highest neopronoun role. If no neopronoun roles are found, returns 1
 */
function getMaxNeopronounsPosition(interaction) {
    try {
        const role = interaction.guild.roles.cache.find(_role => {return _role.name === config.roles.pronouns.neo.name});
        return role.position;
    } catch (error) {
        logger.error(error);
        return 1;
    }
}

/**
 * 
 * @param {object | undefined} root the starting root position - config.roles if unspecified
 * @param {object[] | undefined} roles the starting array of roles - empty if unspecified
 * @returns {{name: string, color: string, id: string | undefined, permissions: string[] | undefined, exclusion: string[] | undefined}[]} array of all roles specified in config.roles
 */
function getConfigRoles(root, roles) {
    if (!root) { 
        root = require('../../config.json').config.roles;
        roles = [];
    }
    for (const [, value] of Object.entries(root)) {
        if (value.name) {
            roles.push(value);
        } else {
            getConfigRoles(value, roles);
        }
    }
    return roles;
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {number} the position of the lowest neopronoun role. If no neopronoun roles are found, returns 1
 */
function getMinNeopronounsPosition(interaction) {
    const maxPos = getMaxNeopronounsPosition(interaction);
    let minPos = 0;
    const pronounRoles = getConfigRoles().map(role => {return role.name});
    try {
        interaction.guild.roles.cache.forEach((role) => {
            if ((role.color !== parseInt(Number(config.roles.pronouns.neo.color), 10) || pronounRoles.includes(role.name)) && (role.position < maxPos && role.position > minPos)) {
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
 * Gets the interacting member's neopronoun roles
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<Collection<string, import('discord.js').Role>} An array containing the interacting member's neopronoun roles
 */
async function getNeopronounRoles(interaction) {
    const maxPos = getMaxNeopronounsPosition(interaction);
    const minPos = getMinNeopronounsPosition(interaction);
    const memberRoles = await interaction.member.roles.cache;
    const roles = interaction.guild.roles.cache.filter((role) => {return role.position <= maxPos && role.position >= minPos && memberRoles.some((r) => {return r.id === role.id} )});
    return roles.map((role) => {return role.name});
}

/**
 * Gets the highest role position of the bot
 * @param {import('discord.js').Interaction} interaction
 * @returns {number} the position of the bot's highest role in the guild
 */
function getBotRolePosition(interaction) {
    return interaction.guild.members.me.roles.highest.position;
}



module.exports = { removeExclusive, memberHasRoleName, memberHasRole, addRole, addRoleByName, addFormatRole, removeRole, removeRoleByName, removeFormatRole, toggleRole, findRole, getPermissionsFromArray, getMaxNeopronounsPosition, getMinNeopronounsPosition, getNeopronounRoles, getBotRolePosition, getConfigRoles };
