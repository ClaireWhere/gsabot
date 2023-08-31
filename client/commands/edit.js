const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const rules = require('../../utils/message.utils/rules.js');
const agreement = require('../../utils/message.utils/agreement.js');
const welcome = require('../../utils/message.utils/welcome.js');
const vc = require('../../utils/message.utils/vc.js');
const politics = require('../../utils/message.utils/politics.js');
const safe_space = require('../../utils/message.utils/safe_space.js');
const { debug } = require('../../utils/debugger.js');
const announcements = require('../../utils/message.utils/roles/announcements.js');
const identity = require('../../utils/message.utils/roles/identity.js');
const minecraft = require('../../utils/message.utils/roles/minecraft.js');
const pronouns = require('../../utils/message.utils/roles/pronouns.js');
const year = require('../../utils/message.utils/roles/year.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('Edits important server messages')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('roles')
            .setDescription('Edits the specified message to be the specified updated reaction roles message')
            .addStringOption(option =>
                option.setName('type')
                .setDescription('The specific roles message to edit')
                .setRequired(true)
                .addChoices(
                    {name: 'Announcements', value: 'announcements'},
                    {name: 'Identity', value: 'identity'},
                    {name: 'Minecraft', value: 'minecraft'},
                    {name: 'Pronouns', value: 'pronouns'},
                    {name: 'Year', value: 'year'},
                ))
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('rules')
            .setDescription('Edits the specified message to be the updated rules message')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option =>
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
            .addStringOption(option =>
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
            .addStringOption(option =>
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
            .addStringOption(option =>
                option.setName('message')
                .setDescription('The message to edit')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('vc')
            .setDescription('Edits the specified message to be the updated vc text guide message')
            .addStringOption(option => 
                option.setName('type')
                .setDescription('The specific piece of vc information to edit')
                .setRequired(true)
                .addChoices(
                    {name: 'Info', value: '2'},
                    {name: 'Mobile', value: '1'},
                    {name: 'PC', value: '0'}
                ))
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to search for the message in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option =>
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
            .addStringOption(option =>
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
            .addStringOption(option =>
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

        const channel = interaction.client.channels.cache.get(interaction.options.get('channel').value);

        const message_id = interaction.options.get('message').value;

        const message = await channel.messages.fetch({cache: false, around: message_id, limit: 1})
            .then((m) => { 
                debug(`found message for /${interaction.commandName} interaction`);
                return m.first();
            }).catch(async (error) => {
                debug(`message not found for /${interaction.commandName} interaction`, error);
                await interaction.editReply({content: `⚠️ Error: A message with the specified id \`${message_id}\` was not able to be found in the channel ${channel}`})
                    .catch((error) => {debug('', error)});
            });

        if (!message) { return; }

        const output = await getOutput(interaction);
        if (!output) {
            await interaction.editReply({content: `⚠️ Error: invalid subcommand specified`})
                .catch((error) => {debug('', error)});
            return;
        }

        return await message.edit(output)
            .then(async (res) => {
                debug(`${interaction.options.getSubcommand()} message successfully edited`);
        
		        await interaction.editReply({content: `The \`${interaction.options.getSubcommand()}\` message in ${channel} has been successfully updated!`, ephemeral: true})
                    .catch((error) => {debug('', error)});
                return true;
            }).catch(async (error) => {
                debug(`unable to edit ${interaction.options.getSubcommand()} message`, error);

                await interaction.editReply({content: `⚠️ Error: The message with id \`${message_id}\` was not able to be edited. Double check the original message was sent by this bot and try again.`})
                    .catch((error) => {debug('', error)});
                return false;
            });
	},
};

/**
 * 
 * @param {import('discord.js').CommandInteraction} interaction 
 * @returns 
 */
function getOutput(interaction) {
    const subcommand = interaction.options.getSubcommand(false);
    if (!subcommand) { return null; }

    return subcommand === 'agreement' ? agreement.execute(interaction)
         : subcommand === 'politics' ? politics.execute(interaction)
         : subcommand === 'roles' ? getRoleOutput(interaction)
         : subcommand === 'rules' ? rules.execute(interaction)
         : subcommand === 'safe_space' ? safe_space.execute(interaction)
         : subcommand === 'vc' ? getVcOutput(interaction)
         : subcommand === 'welcome' ? welcome.execute(interaction)
         : subcommand === 'button' ? null
         : null;
}

/**
 * 
 * @param {import('discord.js').CommandInteraction} interaction 
 * @returns 
 */
function getRoleOutput(interaction) {
    const type = interaction.options.get('type').value;
    console.log(`type: ${type}`);
    return type === 'announcements' ? announcements.execute(interaction)
         : type === 'identity' ? identity.execute(interaction)
         : type === 'minecraft' ? minecraft.execute(interaction)
         : type === 'pronouns' ? pronouns.execute(interaction)
         : type === 'year' ? year.execute(interaction)
         : null;
}

/**
 * 
 * @param {import('discord.js').CommandInteraction} interaction 
 * @returns 
 */
async function getVcOutput(interaction) {
    return new Promise((res) => res(vc.execute(interaction).then((res) => res[parseInt(interaction.options.get('type').value)])));
}