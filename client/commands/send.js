const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const rules = require('../../utils/message.utils/rules.js');
const roles = require('../../utils/message.utils/roles.js');
const agreement = require('../../utils/message.utils/agreement.js');
const welcome = require('../../utils/message.utils/welcome.js');
const vc = require('../../utils/message.utils/vc.js');
const politics = require('../../utils/message.utils/politics.js');
const safe_space = require('../../utils/message.utils/safe_space.js');
const { debug } = require('../../utils/debugger.js');
const { getChannelParentName } = require('../../utils/utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('send')
		.setDescription('Sends important server stuff')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('roles')
            .setDescription('Sends the reaction roles in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the roles to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('rules')
            .setDescription('Sends the rules in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the rules to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('agreement')
            .setDescription('Sends the rules agreement message in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the rules agreement message to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('safe_space')
            .setDescription('Sends the safe space agreement message in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the safe space agreement message to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('welcome')
            .setDescription('Sends the introductory welcome messasge in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the welcome message to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('vc')
            .setDescription('Sends the vc text guide message in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the vc text guide message to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('politics')
            .setDescription('Sends the politics agreement message in the specified channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to send the politics agreement message to')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('button')
            .setDescription('button?')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('button.')
                .setRequired(true)
            )
        )
        ,
	async execute(interaction) {
        if (interaction.commandName != 'send') { return; }

        await interaction.reply({content: `${interaction.guild.emojis.cache.find(emoji => emoji.name === 'loading')} please wait...`, ephemeral: true});

        const channel = interaction.client.channels.cache.get(interaction.options.get('channel').value);

        var output = await getOutput(interaction, channel);

        if (!output) {
            await interaction.editReply({content: `Error: invalid subcommand specified`})
                .catch((error) => {debug('', error)});
            return;
        }

        // convert output to an array if it isn't already (due to inconsistencies in the output sometimes needing to be an array for multiple messages and not otherwise)
        if (!output.length) {
            output = [output];
        }

        for (let i = 0; i < output.length; i++) {
            await channel.send(output[i])
                .then((res) => {
                    debug(`Successfully sent message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()}`);
                }).catch((error) => {
                    debug(`There was an error sending message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()}`, error);
                });
        }
        
		await interaction.editReply({content: `${interaction.options.getSubcommand()} message successfully sent to ${channel}`, ephemeral: true});
	},
};

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
         : subcommand === 'safe_space' ? safe_space.execute(interaction)
         : subcommand === 'vc' ? vc.execute(interaction)
         : subcommand === 'welcome' ? welcome.execute(interaction) 
         : subcommand === 'button' ? null
         : null;
}

function getRulesOutput(interaction, channel) {
    if (getChannelParentName(channel).includes('verification')) {
        return rules.execute(interaction, true)
    }
    return rules.execute(interaction, false);
}