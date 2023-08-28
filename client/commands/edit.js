const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const rules = require('../../utils/message.utils/rules.js');
const agreement = require('../../utils/message.utils/agreement.js');
const welcome = require('../../utils/message.utils/welcome.js');
const vc = require('../../utils/message.utils/vc.js');
const politics = require('../../utils/message.utils/politics.js');
const safe_space = require('../../utils/message.utils/safe_space.js');
const { debug } = require('../../utils/debugger.js');
const announcements = require('../../utils/message.utils/roles/announcements.js')
const identity = require('../../utils/message.utils/roles/identity.js')
const minecraft = require('../../utils/message.utils/roles/minecraft.js')
const pronouns = require('../../utils/message.utils/roles/pronouns.js')
const year = require('../../utils/message.utils/roles/year.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('Edits important server messages')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommandGroup(group => 
            group.setName('roles')
            .setDescription('Edits the specified message to be the specified updated reaction roles message')
            .addSubcommand(subcommand =>
                subcommand.setName('announcements')
                .setDescription('announcements')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to search for the message in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option =>
                    option.setName('message')
                    .setDescription('The message to edit')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('identity')
                .setDescription('identity')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to search for the message in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option =>
                    option.setName('message')
                    .setDescription('The message to edit')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('minecraft')
                .setDescription('minecraft')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to search for the message in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option =>
                    option.setName('message')
                    .setDescription('The message to edit')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('pronouns')
                .setDescription('pronouns')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to search for the message in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option =>
                    option.setName('message')
                    .setDescription('The message to edit')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('year')
                .setDescription('year')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to search for the message in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option =>
                    option.setName('message')
                    .setDescription('The message to edit')
                    .setRequired(true)))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('rules')
            .setDescription('Edits the specified message to be the updated rules message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('agreement')
            .setDescription('Edits the specified message to be the updated rules agreement message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('safe_space')
            .setDescription('Edits the specified message to be the updated safe space agreement message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('welcome')
            .setDescription('Edits the specified message to be the updated introductory welcome messasge')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('vc')
            .setDescription('Edits the specified message to be the updated vc text guide message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('politics')
            .setDescription('Edits the specified message to be the updated politics agreement message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('button')
            .setDescription('button?')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('button?')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option =>
                option.setName('message')
                .setDescription('button.')
                .setRequired(true))
        ),
        /**
         * 
         * @param {import('discord.js').CommandInteraction} interaction 
         * @returns 
         */
	async execute(interaction) {
        if (interaction.commandName != 'edit') { return; }

        await interaction.reply({content: `${interaction.guild.emojis.cache.find(emoji => emoji.name === 'loading')} please wait...`, ephemeral: true});

        const channel = interaction.client.channels.cache.get(interaction.options._hoistedOptions[0].value);
        const filter = m => m.id === interaction.options._hoistedOptions[1].value;
        /**
         * @param {Collection<Snowflake, import('discord.js').Message>} messages
         */
        const messages = await channel.awaitMessages({ filter, max: 10, time: 10_000, errors: ['time']})
            .then(collected => { return collected })
            .catch(collected => console.log(`Message not found`));
        console.log(collected);
        var output;

        if (interaction.options.getSubcommand(false) === 'agreement') {
            output = await agreement.execute(interaction);
        } else if (interaction.options.getSubcommandGroup(false) === 'roles') {
            if (interaction.options.getSubcommand() === 'announcements') {
                output = await announcements.execute(interaction);
            } else if (interaction.options.getSubcommand() === 'identity') {
                output = await identity.execute(interaction);
            } else if (interaction.options.getSubcommand() === 'minecraft') {
                output = await minecraft.execute(interaction);
            } else if (interaction.options.getSubcommand() === 'pronouns') {
                output = await pronouns.identity.execute(interaction);
            } else if (interaction.options.getSubcommand() === 'year') {
                output = await year.execute(interaction);
            }
        } else if (interaction.options.getSubcommand(false) === 'rules') {
            output = await rules.execute(interaction);
        } else if (interaction.options.getSubcommand(false) === 'welcome') {
            output = await welcome.execute(interaction);
        } else if (interaction.options.getSubcommand(false) === 'vc') {
            //output = output.concat(await vc.execute(interaction));
        } else if (interaction.options.getSubcommand(false) === 'politics') {
            output = await politics.execute(interaction);
        } else if (interaction.options.getSubcommand(false) === 'button') {
            // to be implemented
            await interaction.editReply({content: `feature coming soon...`}).catch((error) => {console.log(error.message)});
            return;
        } else if (interaction.options.getSubcommand(false) === 'safe_space') {
            output = await safe_space.execute(interaction);
        } else {
            await interaction.editReply({content: `Error: invalid subcommand specified`}).catch((error) => {console.log(error.message)});
            return;
        }

        await messages.at(0).edit(output)
            .then((res) => {
                
            })
            .catch((error) => {

            });

        await wait(1000);
        
		await interaction.editReply({content: `${interaction.options.getSubcommand()} message successfully sent to ${channel}`, ephemeral: true});
	},
};