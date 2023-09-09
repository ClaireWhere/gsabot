const { memberHasRoleName, addFormatRole } = require("../roles.utils/roles");
const { debug } = require('../debugger');
const { config } = require('../../client/config.json');
const { getChannelParentName } = require("../utils");


async function welcomeMember(interaction) {
    if (await memberHasRoleName(interaction, "GSA Member")) {
        await interaction.followUp({ephemeral: true, content: `${await interaction.guild.emojis.cache.find(emoji => emoji.name === 'rich_thinking') ?? '🤔'} There was an error. You are already a member!`});
        return false;
    } else {
        await addFormatRole(interaction, "GSA Member");
        const color = config.colors.rainbow.at(Math.random()*config.colors.rainbow.length).hex;
        const introductions = await interaction.guild.channels.cache.find(channel => channel.name === 'introductions' && !getChannelParentName(channel).includes('archive')) ?? `\`#introductions\``;
        const roles = await interaction.guild.channels.cache.find(channel => channel.name === 'roles' && !getChannelParentName(channel).includes('archive')) ?? `\`#roles\``;
        const welcome = await interaction.guild.channels.cache.find(channel => channel.name === 'welcome' && !getChannelParentName(channel).includes('archive') && !getChannelParentName(channel).includes('verification')) ?? `\`#welcome\``;
        await welcome.send({ content: `${interaction.member}`, embeds: [{title: ``, description: `# Welcome to the GSA Discord Server!\nEveryone say hi to ${interaction.member}! Feel free to introduce yourself in ${introductions} and choose your ${roles}`, color: parseInt(color)}] })
            .then(message => {
                message.react('👋');
                debug(`Successfully sent welcome message for ${interaction.member}`);
            })
            .catch((error) => {
                debug(`There was an error sending message welcome message`, error);
            });
        
    }
    return true;
}


module.exports = { welcomeMember }