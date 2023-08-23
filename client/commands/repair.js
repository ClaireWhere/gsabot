const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { config } = require('../config.json');
const { getPermissionsFromArray } = require('../../utils/roles.utils/roles');
const { isEmpty, arrayMatch } = require('../../utils/utils');
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

            await interaction.deferReply({ephemeral: true});
            console.info(`Repair function started for ${interaction.options.getSubcommand()}`);

            await interaction.guild.fetch(process.env.GUILD_ID);

            if (interaction.options.getSubcommand() === 'roles') {
                roles_created = 0;
                roles_modified = 0;
                roles_skipped = 0;
                const time_started = new Date();
                position = getGreatestRolePosition(interaction);

                await iterateRoles(interaction, config.roles);
                console.info(`${roles_created} roles created, ${roles_modified} roles modified, ${roles_skipped} roles unchanged. Took ${(new Date() - time_started)/1000} seconds`);
                await interaction.followUp({ephemeral: true, content: `${roles_created} roles created, ${roles_modified} roles modified, ${roles_skipped} roles unchanged. Took ${(new Date() - time_started)/1000} seconds`});
            }
            
        }
}

var roles_created ;
var roles_modified;
var roles_skipped;
var position = 0;

async function iterateRoles(interaction, root) {
    if (root == null || root == undefined) { return; }

    for (const [key, value] of Object.entries(root)) {
        if (await value.name === undefined) {
            await iterateRoles(interaction, value);
        } else {
            await repairRole(interaction, value);
        }
    }
}

async function repairRole(interaction, role) {
    const existing_role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === role.name.toLowerCase());
    if (existing_role === undefined || existing_role === null) {
        await interaction.guild.roles.create({ name: role.name, color: parseInt(role.color) ?? 0, permissions: getPermissionsFromArray(role.permissions), position: position });
        console.log(`role ${role.name} created`);
        roles_created++;
        return true;
    } else {
        var modify = {}
        if (existing_role.name != role.name) {
            modify.name = role.name
        }
        if (existing_role.color != parseInt(role.color)) {
            modify.color = parseInt(role.color);
        }
        if (existing_role.position != position) {
            console.log(`${existing_role.position} | ${position}`);
            modify.position = position;
        }
        if (!arrayMatch(existing_role.permissions.toArray(), role.permissions ?? [])) {
            modify.permissions = getPermissionsFromArray(role.permissions);
        }
        
        position <= existing_role.position ? position-- : position; // we do not want to change position if the role was moved from above the location it is going to (causing the positions of everything below to remain the same)

        if (isEmpty(modify)) {
            //console.log(`role ${role.name} skipped, no changes necessary`);
            roles_skipped++;
            return true;
        }
        await existing_role.edit(modify);
        console.log(`role ${role.name} updated`);
        roles_modified++;
    }
}


function getGreatestRolePosition(interaction) {
    try {
        const r = interaction.guild.roles.cache.reverse().find(role => role.name === config.roles.president.name || role.name.endsWith(`'s Color`));
        return r.position; 
    } catch (error) {
        return 1;
    }
}