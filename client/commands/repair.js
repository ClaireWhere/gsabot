const { SlashCommandBuilder } = require('@discordjs/builders');
const { config } = require('../config.json');
const { getPermissionsFromArray, getBotRolePosition, getMaxNeopronounsPosition, getMinNeopronounsPosition, getConfigRoles } = require('../../utils/roles.utils/roles');
const { isEmpty, arrayMatch } = require('../../utils/utils');
const { logger } = require('../../utils/logger');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repair')
		.setDescription('Repairs important stuff for the server')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('roles')
            .setDescription('Repairs all the important roles for the server')
        ),
        async execute(interaction) {
            if (interaction.commandName != 'repair') { return; }

            await interaction.deferReply({ephemeral: true})
            .catch((error) => {
                logger.warn(`could not defer ${interaction.commandName} interaction (${error})`);
            });
            
            logger.info(`Repair function started for ${interaction.options.getSubcommand()}`);

            if (interaction.options.getSubcommand() === 'roles') {
                const time_started = new Date();
                var created = 0;
                var modified = 0;
                var skipped = 0;

                await repairRoles(interaction)
                    .then((res) => {
                        created += res.created;
                        modified += res.modified;
                        skipped += res.skipped;
                    });

                await repairNeopronouns(interaction)
                    .then((res) => {
                        modified += res.modified;
                        skipped += res.skipped;
                    });

                logger.info(`${created} roles created, ${modified} roles modified, ${skipped} roles unchanged. Took ${(new Date() - time_started)/1000} seconds`);
                await interaction.followUp({ephemeral: true, content: `${created} roles created, ${modified} roles modified, ${skipped} roles unchanged. Took ${(new Date() - time_started)/1000} seconds`})
                .catch((error) => {
                    logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                });
            }
            
        }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<{created: number, modified: number, skipped: number}>}
 */
async function repairRoles(interaction) {
    var roles_created = 0;
    var roles_modified = 0;
    var roles_skipped = 0;
    var position = await getGreatestRolePosition(interaction);
    logger.info(`Repairing roles with starting position ${position}`);

    const config_roles = getConfigRoles();

    for (const role of config_roles) {
        await repairRole(interaction, role, position)
            .then((res) => {
                position += res.positionChange ?? 0;
                roles_skipped += res.skipped ?? 0;
                roles_created += res.created ?? 0;
                roles_modified += res.modified ?? 0;
            });
        if (role.name === config.roles.pronouns.neo.name) {
            console.log(`skipping neopronouns... position: ${position}`);
            position = getMinNeopronounsPosition(interaction)-1;
            console.log(`neopronouns skipped position: ${position}`);
        }
    }
    return {
        created: roles_created,
        modified: roles_modified,
        skipped: roles_skipped
    }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 */
async function iterateRoles(interaction) {
    if (!root) { return; }

    const config_roles = getConfigRoles();

    for (const role of config_roles) {
        await repairRole(interaction, role);
    }
    // for (const [key, value] of Object.entries(root)) {
    //     if (await value.name === undefined) {
    //         await iterateRoles(interaction, value);
    //     } else {
    //         await repairRole(interaction, value);
    //     }
    // }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {{name: string, color: string, permissions: 'string'[] | undefined}} role 
 * @returns {Promise<{create: number | undefined, modify: number | undefined, skip: number | undefined, error: boolean | undefined, positionChange: number | undefined}>}
 */
async function repairRole(interaction, role, position) {
    const existing_role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === role.name.toLowerCase());
    if (!existing_role) {
        return await interaction.guild.roles.create({ name: role.name, color: parseInt(role.color) ?? 0, permissions: getPermissionsFromArray(role.permissions), position: position })
        .then((res) => {
            logger.info(`created role ${role.name}`);
            return {created: 1, positionChange: -1};
        }).catch((error) => {
            logger.warn(`error in creating role ${role.name} (${error})`);
            return {error: true};
        });
    } else {
        var modify = {}
        if (existing_role.name != role.name) {
            modify.name = role.name
        }
        if (existing_role.color != parseInt(role.color)) {
            modify.color = parseInt(role.color);
        }
        if (existing_role.position != position) {
            console.log(`starting position: ${existing_role.position} | position: ${position}`);
            if (existing_role.position === position-1) {
                modify.position = position-1;
            } else {
                modify.position = position;
            }
        }
        if (!arrayMatch(existing_role.permissions.toArray(), role.permissions ?? [])) {
            modify.permissions = getPermissionsFromArray(role.permissions);
        }
        
        //position = existing_role.position <= position ? position-1 : position; // we do not want to change position if the role was moved from above the location it is going to (causing the positions of everything below to remain the same)

        if (isEmpty(modify)) {
            return {skipped: 1, positionChange: -1};
        }
        const previous_role = {
            name: existing_role.name,
            color: existing_role.color,
            permissions: existing_role.permissions,
            position: existing_role.position
        };
        return await existing_role.edit(modify)
        .then((res) => {
            logger.info(`updated role ${previous_role.name}... ${modify.name ? `name: ${previous_role.name} -> ${modify.name}${modify.color || modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.color ? `color: ${previous_role.color} -> ${modify.color}${modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.position ? `position: ${previous_role.position} -> ${modify.position}` : `${modify.permissions ? ', ' : ''}`}${modify.permissions ? `permissions: ${previous_role.permissions.toArray() ?? []} -> ${modify.permissions ?? []}` : ''}`);
            return {modified: 1, positionChange: previous_role.position <= position ? -1 : 0};
        }).catch((error) => {
            logger.warn(`error while updating role ${previous_role.name}... ${modify.name ? `name: ${previous_role.name} -> ${modify.name}${modify.color || modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.color ? `color: ${previous_role.color} -> ${modify.color}${modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.position ? `position: ${previous_role.position} -> ${modify.position}` : `${modify.permissions ? ', ' : ''}`}${modify.permissions ? `permissions: ${previous_role.permissions.toArray() ?? []} -> ${modify.permissions ?? []}` : ''} (${error})`);
            return {error: true};
        });
    }
}
/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns 
 */
async function getGreatestRolePosition(interaction) {
    try {
        // the 'starting' location should be the location of either the president role or one lower than the lowest positioned color role (if any exist), whichever has the smallest position
        let pos = await getBotRolePosition(interaction);
        interaction.guild.roles.cache.forEach((role) => {
            if ((role.name === config.roles.president.name || role.name.endsWith(`'s Color`)) && role.position < pos) {
                pos = role.position;
            }
        });
        return pos;
    } catch (error) {
        console.error(error);
        return 1;
    }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * 
 * @returns {Promise<{modified: number, skipped: number}>}
 */
async function repairNeopronouns(interaction) {
    var position = getMaxNeopronounsPosition(interaction)-1;
    var minPosition = getMinNeopronounsPosition(interaction);
    var updated_roles = 0;
    var skipped_roles = 0;
    logger.info(`Repairing neopronoun roles with starting position ${position} and minimum position ${minPosition}`);
    const config_roles = getConfigRoles().map(r => r.name);
    for (const [key, role] of interaction.guild.roles.cache) {
        if (role.position <= position && role.position >= minPosition) {
            skipped_roles++;
        } else if (!config_roles.includes(role.name) && role.color === parseInt(config.roles.pronouns.neo.color) && !role.name.includes(`'s Color`)) {
            await role.setPosition(position)
            .then((res) => {
                logger.info(`successfully updated neopronoun role ${role.name}... position -> ${position}`);
                updated_roles++;
            }).catch((error) => {
                logger.warn(`could not update neopronoun role ${role.name} from position ${role.position} to ${position}`);
            });
        }
    }
    return {modified: updated_roles, skipped: skipped_roles};
}

