const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const rules = require('../utils/message.utils/rules.js');
const roles = require('../utils/message.utils/roles.js');
const agreement = require('../utils/message.utils/agreement.js');
const welcome = require('../utils/message.utils/welcome.js');
const vc = require('../utils/message.utils/vc.js');
const politics = require('../utils/message.utils/politics.js');
const safeSpace = require('../utils/message.utils/safe_space.js');
const ticket = require('../utils/message.utils/ticket.js');
const { getChannelParentName } = require('../utils/utils.js');
const { logger } = require('../utils/logger.js');

function getRulesOutput(interaction, channel) {
    if (getChannelParentName(channel).includes('verification')) {
        return rules.execute(interaction, true)
    }
    return rules.execute(interaction, false);
}

/**
 * 
 * @param {import('discord.js').CommandInteraction} interaction 
 * @returns 
 */
function getOutput(interaction, channel) {
    const subcommand = interaction.options.getSubcommand(false);
    if (!subcommand) { return null; }

    return subcommand === 'agreement' ? agreement.execute(interaction)
         : subcommand === 'politics' ? politics.execute(interaction)     
         : subcommand === 'roles' ? roles.execute(interaction)
         : subcommand === 'rules' ? getRulesOutput(interaction, channel)
         : subcommand === 'safe_space' ? safeSpace.execute(interaction)
         : subcommand === 'vc' ? vc.execute(interaction)
         : subcommand === 'welcome' ? welcome.execute(interaction) 
         : subcommand === 'button' ? null
         : subcommand === 'ticket' ? ticket.execute(interaction)
         : null;
}

module.exports = {
	// eslint-disable-next-line id-denylist
	data: new SlashCommandBuilder()
		.setName('send')
		.setDescription('Sends important server stuff')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommand(subcommand =>
            {return subcommand.setName('roles')
            .setDescription('Sends the reaction roles in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the roles to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('rules')
            .setDescription('Sends the rules in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the rules to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('agreement')
            .setDescription('Sends the rules agreement message in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the rules agreement message to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('safe_space')
            .setDescription('Sends the safe space agreement message in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the safe space agreement message to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('welcome')
            .setDescription('Sends the introductory welcome messasge in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the welcome message to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('vc')
            .setDescription('Sends the vc text guide message in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the vc text guide message to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('politics')
            .setDescription('Sends the politics agreement message in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the politics agreement message to')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('button')
            .setDescription('button?')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('button.')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('ticket')
            .setDescription('Sends a ticket submission button message in the specified channel')
            .addChannelOption(option =>
                {return option.setName('channel')
                .setDescription('The channel to send the ticket submission button to')
                .setRequired(true)})
            .addStringOption(option =>
                {return option.setName('type')
                .setDescription('The type of ticket to send')
                .setRequired(true)
                .addChoices(
                    {name: 'Support', value: 'support_ticket'},
                    {name: 'GSC Announcement', value: 'gsc_announcement'}
                )})
            .addStringOption(option =>
                {return option.setName('title')
                .setDescription('The title of the ticket message')
                .setRequired(true)})
            .addStringOption(option =>
                {return option.setName('description')
                .setDescription('The description of the ticket message')
                .setRequired(true)})
            .addStringOption(option =>
                {return option.setName('label')
                .setDescription('The text to display on the button in the ticket message')
                .setRequired(true)})
            .addStringOption(option =>
                {return option.setName('emoji')
                .setDescription('The emoji to use for the button')
                .setRequired(true)})
            }
        )
        ,
        async execute(interaction) {
            if (interaction.commandName !== 'send') { return false; }

            const channel = interaction.client.channels.cache.get(interaction.options.get('channel').value);

            let output = await getOutput(interaction, channel).catch((error) => {
                logger.warn(`error in retrieving output for ${interaction.commandName} ${interaction.options.getSubcommand()} interaction (${error})`);
            });

            logger.debug(`got output for ${interaction.commandName} ${interaction.options.getSubcommand()} interaction`);

            if (!output) {
                await interaction.editReply({content: `Error: invalid subcommand specified`})
                    .catch((error) => {logger.error(`invalid subcommand specified (${error})`)});
                return false;
            }

            // Convert output to an array if it isn't already (due to inconsistencies in the output sometimes needing to be an array for multiple messages and not otherwise)
            if (!output.length) {
                output = [output];
            }

            logger.debug(`sending ${output.length} messages for ${interaction.options.getSubcommand()}`);

            for (let i = 0; i < output.length; i++) {
                logger.debug(`Sending message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()}`);
                await channel.send(output[i])
                    .then(() => {
                        logger.info(`Successfully sent message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()}`);
                    }).catch((error) => {
                        logger.warn(`There was an error sending message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()} (${error})`);
                    });
            }
            
            return await interaction.editReply({content: `${interaction.options.getSubcommand()} message successfully sent to ${channel}`, ephemeral: true})
                .then(() => {
                    return true;
                }).catch((error) => {
                    logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                    return false;
                });
        }
};
