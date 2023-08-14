const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { config } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('color')
		.setDescription('Set, remove, or view the color of your name in the server!')
		.setDefaultMemberPermissions(0)
		.setDMPermission(true)
        .addSubcommand(subcommand =>
            subcommand.setName('set')
            .setDescription('Sets (or updates) your current color')
            .addStringOption(option =>
                option.setName('color')
                .setDescription('(example: #FFFFFF) The hex code of your color (# optional) lowercase and uppercase both work')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
            .setDescription('Removes the current color of your name (you can set it again)')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('view')
            .setDescription('View the current color of your name (this is only visible to you)')
        ),
        async execute(interaction) {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.options.getSubcommand() === 'set') {
                return await set(interaction);
            } 
            if (interaction.options.getSubcommand() === 'remove') {
                return await remove(interaction);
            }
            if (interaction.options.getSubcommand() === 'view') {
                return await view(interaction);
            }

            return false;
        }
}

async function set(interaction) {
    const colorString = interaction.options._hoistedOptions[0].value;

    const hex = colorString.toLowerCase().at(0).replace('#', '').concat(colorString.toLowerCase().substring(1));
    if (hex.length != 6 || !isHex(hex)) {
        return await error(interaction, colorString);
    }

    const color = parseInt(hex, 16);
    if (color === undefined) {
        await error(interaction, colorString);
    }

    const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Yes`)
                    .setCustomId(`color:${hex}`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`No`)
                    .setCustomId(`color:no`)
                    .setDisabled(false)
            );

    await interaction.editReply({embeds: [{title: `#${hex.toUpperCase()}`, description: 'Is this the color you would like?', color: color, image: {url: `https://color-hex.org/colors/${hex}.png`}}], components: [row]});
    return true;
}

async function remove(interaction) {
    const role = await interaction.member.roles.cache.find(role => role.name.endsWith(`'s Color`));
    if (role === undefined) {
        await interaction.editReply({embeds: [{title: 'You have no color to remove!', description: `use \`/color set\` to set your color!`, color: parseInt(config.colors.red.darken[2].hex)}]});
        return true;
    }

    await role.delete();
    await interaction.editReply({embeds: [{title: 'Your color role has been removed!', description: `use \`/color set\` to set a new color!`, color: parseInt(config.colors.red.darken[2].hex)}]});
}

async function view(interaction) {
    const role = await interaction.member.roles.cache.find(role => role.name.endsWith(`'s Color`));
    if (role === undefined) {
        await interaction.editReply({embeds: [{title: 'You have no color to view!', description: `use \`/color set\` to set your color!`, color: parseInt(config.colors.red.darken[2].hex)}]});
        return true;
    }

    const color_display = role.color === 1 ? '#000000' : role.hexColor.toUpperCase();

    await interaction.editReply({content: `${color_display}`, embeds: [{title: `${color_display}`, description: `This is ${role}!\nUse \`/color set\` to change it`, color: role.color, image: {url: `https://color-hex.org/colors/${role.hexColor.slice(1)}.png`}}]})
}


async function error(interaction, colorString) {
    await interaction.editReply({embeds: [
        {
          title: `The provided color is not valid structure!`,
          description: `\`\`\`${colorString}\`\`\` was your input\n\nThere should be 6 characters (0-9 and a-f)\nTry out [Google Color Picker](https://www.google.com/search?q=color+picker) and copy the HEX`,
          color: parseInt(config.colors.red.darken[2].hex),
        }
      ]});
      return true;
}

function isHex(hex) {
    for (let i = 0; i < hex.length; i++) {
        let code = hex.charCodeAt(i);
        if ((code < '0'.charCodeAt(0) || code > '9'.charCodeAt(0)) && (code < 'a'.charCodeAt(0) || code > 'f'.charCodeAt(0))) {
          return false;
        }
    }
    return true;
}