const { addRole, findRole, getMinNeopronounsPosition, getPermissionsFromArray, removeRole, memberHasRole } = require('./roles');
const { config } = require('../../client/config.json');
const { formatList, isEmpty } = require('../utils');

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {Array<string>} roles 
 */
async function addNeopronouns(interaction, roles) {
    if (roles.length === 0) { return; }

    var addedRoles = [];

    for (const element of roles) {
        if (element.length > 40 || element.length < 4 || !element.includes('/') || isPronounRole(element)) {
            console.log(`skipping invalid neopronouns: ${element}`);
            continue;
        }
        var role = findRole(interaction, element);
        if (!role) {
            let pos = getMinNeopronounsPosition(interaction);
            await interaction.guild.roles.create({ name: formatPronouns(element), color: parseInt(config.roles.pronouns.neo.color) ?? 0, permissions: getPermissionsFromArray(config.roles.pronouns.neo.permissions), position: pos })
                .then((res) => {
                    role = res;
                    console.log(`${element} role created at position ${pos}`);
                })
                .catch((error) => {
                    console.error(error.message);
                });
        } else {
            if (await memberHasRole(interaction, role)) { 
                console.log(`skipping assignment of neopronouns: user already has ${role.name} role`);
                continue;
             }
        }
        await addRole(interaction, role)
            .then((res) => { addedRoles.push(role) });
    }

    // add the 'Neopronouns' role
    var neopronouns_role = findRole(interaction, config.roles.pronouns.neo.name);
    if (!(await memberHasRole(interaction, neopronouns_role))) {
        await addRole(interaction, neopronouns_role)
            .then((res) => { addedRoles.push(neopronouns_role) });
    }
    if (isEmpty(addedRoles)) { return; }

    const pluralize = addedRoles.length>1 ? 's' : '';
    await interaction.followUp({ephemeral: true, content: `You now have the ${formatList(addedRoles)} role${pluralize}!`})
        .catch((error) => { console.error(error.message); });
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {Array<string>} roles 
 */
async function removeNeopronouns(interaction, roles) {
    var removedRoles = [];
    for (const element of roles) {
        if (element.length < 4 || (!element.includes('/') && element.toLowerCase() != config.roles.pronouns.neo.name.toLowerCase())) {
            continue;
        }
        var role = findRole(interaction, element);
        if (!role) {
            continue;
        }
        if (!(await memberHasRole(interaction, role))) { 
            console.log(`skipping removal of neopronouns: user does not have ${role.name} role`);
            continue;
        }
        await removeRole(interaction, role)
            .then((res) => { removedRoles.push(role)} );
    }
    if (isEmpty(removedRoles)) { return; }
    
    await interaction.followUp({ephemeral: true, content: `You no longer have the ${formatList(removedRoles)} role${removedRoles.length>1 ? 's' : ''}!`})
        .catch((error) => { console.error(error.message); })
}


/**
 * 
 * @param {string} pronouns
 * @returns pronouns formatted with capitalization
 * @example
 * ```js
 * formatPronouns('she/HER/herS'); // returns 'She/Her/Hers'
 * ```
 * 
 */
function formatPronouns(pronouns) {
    const lowercase = pronouns.toLowerCase();
    var formatted = lowercase.at(0).toUpperCase();
    for (let i = 1; i < lowercase.length; i++) {
        if (lowercase.at(i-1) === '/') {
            formatted += lowercase.at(i).toUpperCase();
        } else {
            formatted += lowercase.at(i);
        }
    }
    return formatted;
}

/**
 * 
 * @param {string} role_name 
 * @returns {boolean}
 */
function isPronounRole(role_name) {
    root = config.roles.pronouns;
    if (root == null || root == undefined) { return false; }

    for (const [key, value] of Object.entries(root)) {
        if (value.name.toLowerCase().includes(role_name.toLowerCase())) {
            return true;
        }
    }
    return false;
}

module.exports = { addNeopronouns, removeNeopronouns }