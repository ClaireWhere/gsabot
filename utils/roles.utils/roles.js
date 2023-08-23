const { config } = require('../../client/config.json');

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

    await exclusive.forEach(async element => {
        try {
            if (await memberHasRole(interaction, root_element[element].name)) {
                await removeFormatRole(interaction, root_element[element].name);
            }
        } catch (error) {
            console.error(error);
        }
    });
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function memberHasRole(interaction, role_name) {
    return await interaction.member.roles.cache.some(role => role.name === role_name);
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
            console.error(error.message);
            await interaction.followUp({
                ephemeral: true,
                content: `Something went wrong adding your ${role ?? ''} role!` 
            }).catch((error) => {
                console.error(error.message); 
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
            console.error(error.message);
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
                console.error(error.message); 
                return false;
            });
    } else {
        return await interaction.followUp({ephemeral: true, content: `You now have the ${role} role!`})
            .then((res) => { return true; })
            .catch((error) => {
                console.error(error.message); 
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
            console.error(error.message);
            await interaction.followUp({ephemeral: true, content: `Something went wrong removing your ${role ?? ''} role!`})
                .catch((error) => { console.error(error.message); });
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
            console.error(error.message);
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
            console.error(error.message); 
            return false;
        });
}



/**
 * 
 * @param {import("discord.js").Interaction} interaction
 * @param {string} role_name 
 * @returns 
 */
async function toggleRole(interaction, role_name) {
    if (await memberHasRole(interaction, role_name)) {
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

module.exports = { removeExclusive, memberHasRole, addRole, addRoleByName, addFormatRole, removeRole, removeRoleByName, removeFormatRole, toggleRole, findRole, getPermissionsFromArray };