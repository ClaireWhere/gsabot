const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder, GuildMember } = require('discord.js');
const { config } = require('../config.json');
const { logger } = require('../../utils/logger');
const { checkAppreciation, startAppreciation } = require('../../utils/db.utils/appreciation');
const { getChannelParentName } = require('../../utils/utils');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('appreciate')
		.setDescription("Start an appreciation day for someone in the server!")
		.setDefaultMemberPermissions(0)
		.setDMPermission(true)
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to appreciate today')
            .setRequired(true)
        ),
        /**
         * 
         * @param {import('discord.js').CommandInteraction} interaction 
         * @returns 
         */
        async execute(interaction) {
            if (interaction.commandName != 'appreciate') { 
                logger.warn(`/${interaction.commandName} is not a valid command name!`);
                return; 
            }
            
            const option = interaction.options.get('user');
            const user_option = option.user;

            function getUserName() {
                if (option.member) {
                    let memberName = option.member.displayName;
                    if (typeof memberName === "string") {
                        return memberName;
                    }
                }
                let memberName = user_option.username;
                return memberName;
            }
            const user_name = getUserName();

            const initiator_name = interaction.member.displayName ?? interaction.user.username;

            if (!interaction.guild.members.cache.has(user_option.id)) {
                logger.info(`${initiator_name} (${interaction.user}) is unable to start appreciation day for ${user_name} (${user_option})!\n\t${user_name} (${user_option}) is not a member of this server!`);
                await interaction.editReply({
                    content: `Unable to start appreciation day for ${user_option}!\n${user_option} is not a member of this server!`
                });
                return;
            }

            if (user_option.id === interaction.user.id) {
                logger.info(`${user_option} is unable to start appreciation day for ${user_name} (${user_option})! ${user_name} (${user_option}) is the initiator!`);
                await interaction.editReply({
                    content: `Self love is great! You are awesome, ${user_option} 💖`
                });
                logger.info(`Self love message sent to ${user_name} (${user_option})`);
                return;
            } else {
                logger.info(`'/appreciate' Initiator: ${initiator_name} (${interaction.user}) is not the same user as ${user_name} (${user_option}) - appreciation may proceed`);
            }

            if (user_option.bot) {
                logger.info(`${initiator_name} (${interaction.user}) is unable to start appreciation day for ${user_name} (${user_name})!\n\t${user_name} (${user_name}) is a bot!`);
                await interaction.editReply({
                    content: `Unable to start appreciation day for ${user_option}!\n${user_option} is a bot!`
                })
                return;
            } else {
                logger.info(`${user_name} (${user_name}) is not a bot - appreciation may proceed`);
            }

            if (checkAppreciation()) {
                logger.info(`${initiator_name} (${interaction.user}) is unable to start appreciation day for ${user_name} (${user_name})! An appreciation day is already in progress!`);
                await interaction.editReply({
                    content: `Unable to start appreciation day for ${user_option}! An appreciation day is already in progress!`
                })
                return;
            } else {
                logger.info(`no appreciation day is in progress - appreciation may proceed`);
            }
            
            startAppreciation(user_option.id, user_name, interaction.user.id, initiator_name, interaction.guild.id);
            logger.info(`${initiator_name} (${interaction.user}) started appreciation day for ${user_name} (${user_name})!`);

            let pronouns = getPronouns(option.member)[1];
            logger.info(`${user_name} (${user_option})'s pronouns are ${pronouns}`);
            let color = parseInt(config.colors.rainbow[Math.floor(Math.random() * config.colors.rainbow.length)].hex);
            logger.info(`color for appreciation day is ${color}`);
            let button = new ButtonBuilder()
                .setCustomId('appreciate')
                .setLabel('Appreciate')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🤩');
            logger.info(`button created`);
            let actionRow = new ActionRowBuilder()
                .addComponents(button);
            logger.info(`action row created`);

            const channel = interaction.guild.channels.cache.find(channel => channel.name.includes('general') && !getChannelParentName(channel).includes('archive'))
            if (!channel) {
                logger.warn(`'general' channel not found in ${interaction.guild.name}!`);
                await interaction.editReply({
                    content: `Unable to start appreciation day for ${user_option}!\n'general' channel not found in ${interaction.guild.name}!`
                });
                return;
            }
            await channel.send({
                embeds: [
                    {
                        title: `📣 HEY EVERYONE ❗`,
                        description: `## ✨ It's ${user_option} appreciation day!!! ✨\n\nmake sure to show ${pronouns} some love! 🌈🤩`,
                        color: color
                    }
                ],
                components: [actionRow]
            })
            logger.info(`interaction replied`);

            await interaction.followUp({
                content: `It is now ${user_option}'s appreciation day!`,
                ephemeral: true
            })
        },
}

/**
 * 
 * @param {import('discord.js').GuildMember} member
 * @returns {string[]} a random set of pronouns selected from the pronoun roles the interacting user has set
 */
function getPronouns(member) {
    let pronounList = [];
    const color = parseInt(config.roles.pronouns.neo.color);
    const pronounRoles = member.roles.cache.filter(role => (role.name.includes('/') && role.color === color));
    let role_name = [];
    pronounRoles.forEach(role => {
        role_name = role.name.toLowerCase().split('/');
        if (role_name.includes('she') || role_name.includes('any')) {
            pronounList.push(['she', 'her', 'hers', 'herself']);
        }
        if (role_name.includes('he') || role_name.includes('any')) {
            pronounList.push(['he', 'him', 'his', 'himself']);
        }
        if (role_name.includes('they') || role_name.includes('any')) {
            pronounList.push(['they', 'them', 'their', 'themselves']);
        }
    });
    if (pronounList.length === 0) {
        pronounList.push(['they', 'them', 'their', 'themselves']);
    }

    let pronouns = pronounList[Math.floor(Math.random() * pronounList.length)];
    return pronouns;
}