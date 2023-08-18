const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const rules = require('../../utils/message.utils/rules.js');
const roles = require('../../utils/message.utils/roles.js');
const agreement = require('../../utils/message.utils/agreement.js');
const welcome = require('../../utils/message.utils/welcome.js');
const vc = require('../../utils/message.utils/vc.js');
const politics = require('../../utils/message.utils/politics.js');
const safe_space = require('../../utils/message.utils/safe_space.js');

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

        await interaction.reply({content: `${interaction.guild.emojis.cache.find(emoji => emoji.name === 'loading')} please wait...`, ephemeral: true});

        const channel = interaction.client.channels.cache.get(interaction.options._hoistedOptions[0].value);

        var output = [];

        console.log(`subcommand ${interaction.options.getSubcommand()}`);

        if (interaction.options.getSubcommand() === 'agreement') {
            output.push(await agreement.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'roles') {
            output = output.concat(await roles.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'rules') {
            output.push(await rules.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'welcome') {
            output.push(await welcome.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'vc') {
            output = output.concat(await vc.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'politics') {
            output.push(await politics.execute(interaction));
        } else if (interaction.options.getSubcommand() === 'safe_space') {
            output.push(await safe_space.execute(interaction));
        } else {
            await interaction.editReply({content: `Error: invalid subcommand specified`});
            return;
        }

        for (let i = 0; i < output.length; i++) {
            await channel.send(output[i])
                .then(console.log(`Successfully sent message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()}`))
                .catch(`There was an error sending message ${i+1} of ${output.length} for ${interaction.options.getSubcommand()} : ${console.error}`);
        }

        await wait(1000);
        
		await interaction.editReply({content: `${interaction.options.getSubcommand()} message successfully sent to ${channel}`, ephemeral: true});
	},
};