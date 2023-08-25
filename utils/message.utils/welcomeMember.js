const { memberHasRoleName } = require("../roles.utils/roles");


async function welcomeMember(interaction) {
    if (await memberHasRoleName(interaction, "GSA Member")) {
        await interaction.followUp({ephemeral: true, content: `${await interaction.guild.emojis.cache.find(emoji => emoji.name === 'rich_thinking') ?? '🤔'} There was an error. You are already a member!`});
        return false;
    } else {
        await addFormatRole(interaction, "GSA Member");
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


module.exports = { welcomeMember }