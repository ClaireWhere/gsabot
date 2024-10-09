const { memberHasRoleName, addFormatRole } = require("../roles.utils/roles");
const { config } = require('../../config.json');
const { getChannelParentName } = require("../utils");
const { logger } = require("../logger");


async function welcomeMember(interaction) {
    if (await memberHasRoleName(interaction, "GSA Member")) {
        await interaction.followUp({ephemeral: true, content: `${await interaction.guild.emojis.cache.find(emoji => {return emoji.name === 'rich_thinking'}) ?? '🤔'} There was an error. You are already a member!`});
        return false;
    }
    await addFormatRole(interaction, "GSA Member");
    const color = config.colors.rainbow.at(Math.random()*config.colors.rainbow.length).hex;
    const introductions = await interaction.guild.channels.cache.find(channel => {return channel.name === 'introductions' && !getChannelParentName(channel).includes('archive')}) ?? `\`#introductions\``;
    const roles = await interaction.guild.channels.cache.find(channel => {return channel.name === 'roles' && !getChannelParentName(channel).includes('archive')}) ?? `\`#roles\``;
    const welcome = await interaction.guild.channels.cache.find(channel => {return channel.name === 'welcome' && !getChannelParentName(channel).includes('archive') && !getChannelParentName(channel).includes('verification')}) ?? `\`#welcome\``;
    await welcome.send({ content: `${interaction.member}`, embeds: [{title: ``, description: `# Welcome to the GSA Discord Server!\nEveryone say hi to ${interaction.member}! Feel free to introduce yourself in ${introductions} and choose your ${roles}`, color: parseInt(Number(color), 10)}] })
        .then(message => {
            message.react('👋');
            logger.info(`Successfully sent welcome message for ${interaction.member}`);
        })
        .catch((error) => {
            logger.error(`There was an error sending message welcome message (${error})`);
        });
    return true;
}


module.exports = { welcomeMember }