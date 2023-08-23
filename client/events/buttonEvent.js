const { Events } = require('discord.js');

const { config } = require('../config.json');
const { color_handler } = require('../../utils/colorRoles.js');
const { toggleRole } = require('../../utils/roles.utils/roles');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) { return false; }
        
        if (config.debug_mode) {
            console.debug('running button event');
        }
        await interaction.deferUpdate()
                .then((res) => {
                    if (config.debug_mode) {
                        console.debug('interaction deferred');
                    }
                }).catch((err) => {
                    console.error(err);
                    return;
                });

        if (interaction.customId == 'member') {
            if (await memberHasRole(interaction, "GSA Member")) {
                await interaction.followUp({ephemeral: true, content: `${await interaction.guild.emojis.cache.find(emoji => emoji.name === 'rich_thinking') ?? '🤔'} There was an error. You are already a member!`});
                return false;
            } else {
                await addRole(interaction, "GSA Member");
                const color = config.colors.rainbow.at(Math.random()*config.colors.rainbow.length).hex;
                const introductions = await interaction.guild.channels.cache.find(channel => channel.name === 'introductions');
                const roles = await interaction.guild.channels.cache.find(channel => channel.name === 'roles');
                const welcome = await interaction.guild.channels.cache.find(channel => channel.name === 'welcome');
                await welcome.send({ content: `${interaction.member}`, embeds: [{title: ``, description: `# Welcome to the GSA Discord Server!\nEveryone say hi to ${interaction.member}! Feel free to introduce yourself in ${introductions} and choose your ${roles}`, color: parseInt(color)}] })
                    .then(message => {
                        message.react('👋');
                        console.log(`Successfully sent welcome message`);
                    })
                    .catch(`There was an error sending message welcome message : ${console.error}`);
                
            }
            return true;
        }

        // categorized button id's take the form parent:child. Eg. pronouns:she_her is part of the pronouns category with the child id being she_her. See more in config.json
        const id = interaction.customId.split(':');
        if (id.length == 0) { 
            console.error(`[ERROR] No button id found for the supplied button interaction`);
            await interaction.followUp({ephemeral: true, content: `There was an error! It looks like the button you clicked was invalid 🤔`});
            return false;
        }

        if (id[0] === 'color') {
            return await color_handler(interaction, id[1]);
        }

        var role_name = "";
        if (id.length == 1) {
            role_name = config.roles[id[0]].name;
        } else {
            role_name = config.roles[id[0]][id[1]].name;
        }

        if (role_name === undefined || role_name.length === 0) { 
            console.error(`[ERROR] no role found for button: ${id.toString()}!`);
            await interaction.followUp({ephemeral: true, content: `Something went wrong finding the role you selected D:`});
            return false;
        }
        
        await toggleRole(interaction, role_name);
        return true;
    },
};

