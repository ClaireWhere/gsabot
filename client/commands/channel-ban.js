const { SlashCommandBuilder } = require('@discordjs/builders');
const { config } = require('../config.json');
const { logger } = require('../utils/logger');
const { uniqueBanChoices, getBanTypeDisplay } = require('../utils/banTypes');
const { banUser, unbanUser, getBanList, isBanned } = require('../db/queries/insertBan');
const insertGuild = require('../db/queries/insertGuild');
const insertUser = require('../db/queries/insertUser');


/**
 * 
 * @param {[{string: [{reason: string;is_active: boolean;banned_at: string;unbanned_at: string | null;bannee_id: string;banner_id: string;unbanner_id: string | null;}];}]} banList 
 * @param {string} banType The id name of the ban type
 * @returns {import('discord.js').MessageEmbed} an embed containing the ban list
 */
function buildBanListEmbed(banList, banType) {
    
    const embed = {
        "title": banType === 'all' ? "All Bans" : `${getBanTypeDisplay(banType)} Bans`,
        "description": "",
        "color": parseInt(config.colors.light_red.darken[0].hex, 10),
        "fields": [],
        "footer": {
            "text": "Last updated "
        },
        "timestamp": new Date().toISOString()
    };

    let bans;
    if (banType === 'all') {
        banList.forEach(uniqueBanType => {
            bans = bans.concat(banList[uniqueBanType]);
        });
    } else {
        bans = banList[banType];
    }

    if (!bans) {
        embed.description = "No bans found";
        return embed;
    } else if (bans.length === 0) {
        embed.description = "No bans found";
        return embed;
    }

    bans.forEach(banItem => {
        const bannee = banItem.bannee_id;
        const banner = banItem.banner_id;
        const unbanner = banItem.unbanner_id;
        const reason = banItem.reason;
        const isActive = banItem.is_active;
        const MILLISECONDS_IN_SECOND = 1000;
        const SECONDS_IN_HOUR = 60;

        const bannedAtUTC = new Date(banItem.banned_at).valueOf() - SECONDS_IN_HOUR * new Date().getTimezoneOffset() * MILLISECONDS_IN_SECOND;
        const unbannedAtUTC = banItem.unbanned_at ? new Date(banItem.unbanned_at).valueOf() - SECONDS_IN_HOUR * new Date().getTimezoneOffset() * MILLISECONDS_IN_SECOND : null;

        const bannedAt = `<t:${Math.floor(bannedAtUTC/MILLISECONDS_IN_SECOND)}> (<t:${Math.floor(bannedAtUTC/MILLISECONDS_IN_SECOND)}:R>)`;
        const unbannedAt = banItem.unbanned_at ? `<t:${Math.floor(unbannedAtUTC/MILLISECONDS_IN_SECOND)}> (<t:${Math.floor(unbannedAtUTC/MILLISECONDS_IN_SECOND)}:R>)` : undefined;

        embed.fields.push({
            "name": `${isActive ? '🚫 ' : ''}<@${bannee}>`,
            "value": `• Banned By \t<@${banner}> On ${bannedAt}${unbannedAt ? `\n• Unbanned By \t<@${unbanner}> On ${unbannedAt}` : ''}\n• Reason:\n>>> ${reason}`
        });
    });

    return embed;
}

/**
 * 
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').User} user
 * @param {import('discord.js').User} banner
 * @param {string} reason
 * @param {string} type
 * @returns {Promise<boolean>} true if the user was banned, false otherwise
 */
async function ban(interaction, guild, user, banner, reason, type) {
    logger.info(`"${banner.tag}" banning "${user.tag}" from "${type}" with reason: "${reason}"`);

    const isUserBanned = await isBanned(user.id, guild.id, type)
        .catch((error) => {
            logger.error(`Could not check if user (${user.tag}) is banned from "${type}" (${error})`);
            return undefined;
        });

    if (isUserBanned === undefined) {
        logger.debug(`Could not check if "${user.tag}" is banned from "${type}"`);
        await interaction.editReply({content: `Unable to ban <@${user.id}> (${user.tag}) at this time...`, ephemeral: true})
            .catch((editError) => {
                logger.warn(`Could not respond to ${interaction.commandName} interaction (${editError})`);
            });
        return false;
    }

    if (isUserBanned) {
        logger.debug(`"${user.tag}" is already banned from "${type}"`);
        return await interaction.editReply({content: `<@${user.id}> (${user.tag}) is already banned from ${type}!`, ephemeral: true})
            .then(() => {
                return true;
            }).catch((error) => {
                logger.warn(`Could not respond to ${interaction.commandName} interaction (${error})`);
                return false;
            });
    }
    
    logger.debug(`"${user.tag}" is not already banned from "${type}"`);
    return await banUser(user.id, guild.id, reason, banner.id, type)
        .then(async () => {
            logger.debug(`"${user.tag}" has been banned from "${type}"`);
            return await interaction.editReply({content: `<@${user.id}> (${user.tag}) has been banned from ${type}!`, ephemeral: true})
                .catch((editError) => {
                    logger.warn(`Could not respond to ${interaction.commandName} interaction (${editError})`);
                    return false;
                }).then(() => {
                    return true;
                });
        }).catch(async (banError) => {
            logger.error(`Could not ban user (${user.tag}) from "${type}" (${banError})`);
            await interaction.editReply({content: `Unable to ban <@${user.id}> (${user.tag}) at this time... (${banError})`, ephemeral: true})
                .catch((editError) => {
                    logger.warn(`Could not respond to ${interaction.commandName} interaction (${editError})`);
                });
            return false;
        });
}

async function unban(interaction, guild, user, unbanner, type) {
    logger.info(`Unbanning "${user.tag}" from channel with type "${type}"`);

    const isUserBanned = await isBanned(user.id, guild.id, type)
        .catch((error) => {
            logger.error(`Could not check if user (${user.tag}) is banned from "${type}" (${error})`);
            return undefined;
        });

    if (isUserBanned === undefined) {
        await interaction.editReply({content: `Unable to unban <@${user.id}> (${user.tag}) at this time...`, ephemeral: true})
            .catch((editError) => {
                logger.warn(`could not respond to ${interaction.commandName} interaction (${editError})`);  
            });
        return false;
    }

    if (!isUserBanned) {
        return await interaction.editReply({content: `<@${user.id}> (${user.tag}) is not banned from ${type}!`, ephemeral: true})
            .then(() => {
                return true;
            }).catch((error) => {
                logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                return false;
            });
    }
    
    return await unbanUser(user.id, guild.id, unbanner.id, type)
        .then(async () => {
            return await interaction.editReply({content: `<@${user.id}> (${user.tag}) has been unbanned from ${type}!`, ephemeral: true})
                .catch((editError) => {
                    logger.warn(`Could not respond to ${interaction.commandName} interaction (${editError})`);
                    return false;
                }).then(() => {
                    return true;
                });
        }).catch(async (unbanError) => {
            logger.error(`Could not unban ${user.tag} from channel with type ${type} (${unbanError})`);
            await interaction.editReply({content: `Unable to unban <@${user.id}> (${user.tag}) at this time... (${unbanError})`, ephemeral: true})
                .catch((editError) => {
                    logger.warn(`Could not respond to ${interaction.commandName} interaction (${editError})`);
                });
            return false;
        });
}

async function view(interaction, guild, type) {
    logger.info(`Viewing bans for channel with type ${type}`);

    const banList = await getBanList(guild.id)
        .catch(async (banListError) => {
            logger.error(`could not get ban list (${banListError})`);
            return await interaction.editReply({content: `Unable to get ban list at this time... (${banListError})`, ephemeral: true})
                .then(() => {
                    return false;
                }).catch((editError) => {
                    logger.warn(`could not respond to ${interaction.commandName} interaction (${editError})`);
                    return false;
                });
        });
    
    
    const embeds = [];
    if (type === 'all') {
        for (const banType of uniqueBanChoices) {
            embeds.push(buildBanListEmbed(banList, banType.value));
        }
    } else {
        embeds.push(buildBanListEmbed(banList, type));
    }

    return await interaction.editReply({embeds: embeds, ephemeral: true})
        .then(() => {
            return true;
        }).catch((editError) => {
            logger.warn(`could not respond to ${interaction.commandName} interaction (${editError})`);
            return false;
        });
}

module.exports = {
	// eslint-disable-next-line id-denylist
	data: new SlashCommandBuilder()
		.setName('channel-ban')
		.setDescription('Ban a user from receiving the role to access a specified channel')
		.setDefaultMemberPermissions(0)
		.setDMPermission(true)
        .addSubcommand(subcommand => { return subcommand
            .setName('ban')
            .setDescription('Prevent a user from accessing a channel until they are unbanned.') 
            .addUserOption(option => { return option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
            })
            .addStringOption(option => { return option
                .setName('type')
                .setDescription('The type of ban')
                .setRequired(true)
                .addChoices(uniqueBanChoices)
            })
            .addStringOption(option => { return option
                .setName('reason')
                .setDescription('The reason for the ban (only visible to moderators)')
                .setRequired(false)
            })
        })
        .addSubcommand(subcommand => { return subcommand
            .setName('unban')
            .setDescription('Allow a user to access a channel again')
            .addUserOption(option => { return option
                .setName('user')
                .setDescription('The user to unban')
                .setRequired(true)
            })
            .addStringOption(option => { return option
                .setName('type')
                .setDescription('The type of ban to remove')
                .setRequired(true)
                .addChoices(uniqueBanChoices)
            })
        })
        .addSubcommand(subcommand => { return subcommand
            .setName('view')
            .setDescription('View the current bans for a channel')
            .addStringOption(option => { return option
                .setName('type')
                .setDescription('The type of ban')
                .setRequired(true)
                .addChoices(uniqueBanChoices.concat({name: 'All', value: 'all'}))
            })
        }),
        
        
        async execute(interaction) {
            if (interaction.commandName !== 'channel-ban') { return false; }

            if (interaction.options.getSubcommand() === 'ban') {
                const banner = interaction.user;
                const guild = interaction.guild;
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') ?? "No reason provided";
                const type = interaction.options.getString('type');

                insertGuild(guild.id, guild.name);
                insertUser(user.id, user.tag, user.displayName ?? user.username, user.avatarURL());
                insertUser(banner.id, banner.tag, banner.displayName ?? banner.username, banner.avatarURL());

                return await ban(interaction, guild, user, banner, reason, type);
            } else if (interaction.options.getSubcommand() === 'unban') {
                const unbanner = interaction.user;
                const guild = interaction.guild;
                const user = interaction.options.getUser('user');
                const type = interaction.options.getString('type');

                insertGuild(guild.id, guild.name);
                insertUser(user.id, user.tag, user.displayName ?? user.username, user.avatarURL());
                insertUser(unbanner.id, unbanner.tag, unbanner.displayName ?? unbanner.username, unbanner.avatarURL());

                return await unban(interaction, guild, user, unbanner, type);
            } else if (interaction.options.getSubcommand() === 'view') {
                const guild = interaction.guild;
                insertGuild(guild.id, guild.name);
                const type = interaction.options.getString('type');
                return await view(interaction, guild, type);
            }
            return false;
        }
}

