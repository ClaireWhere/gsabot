const { SlashCommandBuilder } = require('@discordjs/builders');
const { config } = require('../config.json');
const { getPermissionsFromArray, getBotRolePosition, getMaxNeopronounsPosition, getMinNeopronounsPosition, getConfigRoles } = require('../utils/roles.utils/roles');
const { isEmpty, arrayMatch } = require('../utils/utils');
const { logger } = require('../utils/logger');
require('dotenv').config();

const MILLIS_IN_SECOND = 1000;

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns 
 */
async function getGreatestRolePosition(interaction) {
    try {
        // The 'starting' location should be the location of either the president role or one lower than the lowest positioned color role (if any exist), whichever has the smallest position
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
 * @param {{name: string, color: string, permissions: 'string'[] | undefined}} role 
 * @returns {Promise<{created: number | undefined, modify: number | undefined, skip: number | undefined, error: boolean | undefined, positionChange: number | undefined}>}
 */
async function repairRole(interaction, role, position) {
    const existingRole = interaction.guild.roles.cache.find(_role => {return _role.name.toLowerCase() === role.name.toLowerCase()});
    
    if (existingRole) {
        const modify = {}
        if (existingRole.name !== role.name) {
            modify.name = role.name
        }
        if (existingRole.color !== parseInt(Number(role.color), 10)) {
            modify.color = parseInt(Number(role.color), 10);
        }
        if (existingRole.position !== position) {
            console.log(`starting position: ${existingRole.position} | position: ${position}`);
            if (existingRole.position === position-1) {
                modify.position = position-1;
            } else {
                modify.position = position;
            }
        }
        if (!arrayMatch(existingRole.permissions.toArray(), role.permissions ?? [])) {
            modify.permissions = getPermissionsFromArray(role.permissions);
        }
        
        // eslint-disable-next-line capitalized-comments
        //position = existing_role.position <= position ? position-1 : position; // we do not want to change position if the role was moved from above the location it is going to (causing the positions of everything below to remain the same)

        if (isEmpty(modify)) {
            return {skipped: 1, positionChange: -1};
        }
        const previousRole = {
            name: existingRole.name,
            color: existingRole.color,
            permissions: existingRole.permissions,
            position: existingRole.position
        };
        return await existingRole.edit(modify)
        .then(() => {
            logger.info(`updated role ${previousRole.name}... ${modify.name ? `name: ${previousRole.name} -> ${modify.name}${modify.color || modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.color ? `color: ${previousRole.color} -> ${modify.color}${modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.position ? `position: ${previousRole.position} -> ${modify.position}` : `${modify.permissions ? ', ' : ''}`}${modify.permissions ? `permissions: ${previousRole.permissions.toArray() ?? []} -> ${modify.permissions ?? []}` : ''}`);
            // eslint-disable-next-line no-magic-numbers
            return {modified: 1, positionChange: previousRole.position <= position ? -1 : 0};
        }).catch((error) => {
            logger.warn(`error while updating role ${previousRole.name}... ${modify.name ? `name: ${previousRole.name} -> ${modify.name}${modify.color || modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.color ? `color: ${previousRole.color} -> ${modify.color}${modify.position || modify.permissions ? ', ' : ''}` : ''}${modify.position ? `position: ${previousRole.position} -> ${modify.position}` : `${modify.permissions ? ', ' : ''}`}${modify.permissions ? `permissions: ${previousRole.permissions.toArray() ?? []} -> ${modify.permissions ?? []}` : ''} (${error})`);
            return {error: true};
        });
    }
    return await interaction.guild.roles.create({ name: role.name, color: parseInt(Number(role.color), 10) ?? 0, permissions: getPermissionsFromArray(role.permissions), position: position })
    .then(() => {
        logger.info(`created role ${role.name}`);
        return {created: 1, positionChange: -1};
    }).catch((error) => {
        logger.warn(`error in creating role ${role.name} (${error})`);
        return {error: true};
    });
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @returns {Promise<{created: number, modified: number, skipped: number}>}
 */
async function repairRoles(interaction) {
    let rolesCreated = 0;
    let rolesModified = 0;
    let rolesSkipped = 0;
    let position = await getGreatestRolePosition(interaction);
    logger.info(`Repairing roles with starting position ${position}`);

    const configRoles = getConfigRoles();

    for (const role of configRoles) {
        const res = await repairRole(interaction, role, position)
        position += res.positionChange ?? 0;
        rolesSkipped += res.skipped ?? 0;
        rolesCreated += res.created ?? 0;
        rolesModified += res.modified ?? 0;
        
        if (role.name === config.roles.pronouns.neo.name) {
            console.log(`skipping neopronouns... position: ${position}`);
            position = getMinNeopronounsPosition(interaction)-1;
            console.log(`neopronouns skipped position: ${position}`);
        }
    }
    return {
        created: rolesCreated,
        modified: rolesModified,
        skipped: rolesSkipped
    }
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 * 
 * @returns {Promise<{modified: number, skipped: number}>}
 */
async function repairNeopronouns(interaction) {
    const position = getMaxNeopronounsPosition(interaction)-1;
    const minPosition = getMinNeopronounsPosition(interaction);
    let updatedRoles = 0;
    let skippedRoles = 0;
    logger.info(`Repairing neopronoun roles with starting position ${position} and minimum position ${minPosition}`);
    const configRoles = getConfigRoles().map(role => {return role.name});
    for (const [, role] of interaction.guild.roles.cache) {
        if (role.position <= position && role.position >= minPosition) {
            skippedRoles++;
        } else if (!configRoles.includes(role.name) && role.color === parseInt(Number(config.roles.pronouns.neo.color), 10) && !role.name.includes(`'s Color`)) {
            const res = await role.setPosition(position)
                .then(() => {
                    logger.info(`successfully updated neopronoun role ${role.name}... position -> ${position}`);
                    return 1;
                }).catch(() => {
                    logger.warn(`could not update neopronoun role ${role.name} from position ${role.position} to ${position}`);
                    return 0;
                });
            updatedRoles += res;
        }
    }
    return {modified: updatedRoles, skipped: skippedRoles};
}


module.exports = {
	// eslint-disable-next-line id-denylist
	data: new SlashCommandBuilder()
		.setName('repair')
		.setDescription('Repairs important stuff for the server')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommand(subcommand =>
            {return subcommand.setName('roles')
            .setDescription('Repairs all the important roles for the server')}
        ),
        async execute(interaction) {
            if (interaction.commandName !== 'repair') { return; }
            
            logger.info(`Repair function started for ${interaction.options.getSubcommand()}`);

            if (interaction.options.getSubcommand() === 'roles') {
                const timeStarted = new Date();
                let created = 0;
                let modified = 0;
                let skipped = 0;

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

                logger.info(`${created} roles created, ${modified} roles modified, ${skipped} roles unchanged. Took ${(new Date() - timeStarted)/MILLIS_IN_SECOND} seconds`);
                await interaction.followUp({ephemeral: true, content: `${created} roles created, ${modified} roles modified, ${skipped} roles unchanged. Took ${(new Date() - timeStarted)/MILLIS_IN_SECOND} seconds`})
                .catch((error) => {
                    logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                });
            }
            
        }
}
