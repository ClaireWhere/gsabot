const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { config } = require('../config.json');
const { logger } = require('../utils/logger');

function isHex(hex) {
    for (let i = 0; i < hex.length; i++) {
        const code = hex.charCodeAt(i);
        if ((code < '0'.charCodeAt(0) || code > '9'.charCodeAt(0)) && (code < 'a'.charCodeAt(0) || code > 'f'.charCodeAt(0))) {
          return false;
        }
    }
    return true;
}

async function sendError(interaction, colorString) {
    logger.info(`${interaction.member.user.username} provided invalid structure (${colorString}) for ${interaction.commandName} interaction`);
    return await interaction.editReply({embeds: [
        {
          title: `The provided color is not valid structure!`,
          description: `\`\`\`${colorString}\`\`\` was your input\n\nThere should be 6 characters (0-9 and a-f)\nTry out [Google Color Picker](https://www.google.com/search?q=color+picker) and copy the HEX`,
          // eslint-disable-next-line no-magic-numbers
          color: parseInt(config.colors.red.darken[2].hex, 10),
        }
    ]}).then(() => {
        return true;
    }).catch((error) => {
        logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
        return false;
    });
}

async function sendSetColor(interaction) {
    // eslint-disable-next-line no-underscore-dangle
    const colorString = interaction.options._hoistedOptions[0].value;

    const hex = colorString.toLowerCase().at(0).replace('#', '').concat(colorString.toLowerCase().substring(1));
    const HEX_LENGTH = 6;
    if (hex.length !== HEX_LENGTH || !isHex(hex)) {
        return await sendError(interaction, colorString);
    }

    const color = parseInt(hex, 16);
    if (color === undefined) {
        await sendError(interaction, colorString);
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

    return await interaction.editReply({embeds: [{title: `#${hex.toUpperCase()}`, description: 'Is this the color you would like?', color: color, image: {url: `https://color-hex.org/colors/${hex}.png`}}], components: [row]})
        .then(() => {
            return true;
        }).catch((error) => {
            logger.info(`could not respond to ${interaction.commandName} interaction (${error})`);
            return false;
        })
}

async function sendRemoveColor(interaction) {
    const role = await interaction.member.roles.cache.find(_role => {return _role.name.endsWith(`'s Color`)});
    if (role === undefined) {
        logger.info(`${interaction.member.user.username} has no color to remove`);
        // eslint-disable-next-line no-magic-numbers
        return await interaction.editReply({embeds: [{title: 'You have no color to remove!', description: `use \`/color set\` to set your color!`, color: parseInt(config.colors.red.darken[2].hex, 10)}]})
            .then(() => {
                return true;
            }).catch((error) => {
                logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                return false;
            });
    }

    logger.info(`deleting ${interaction.member.user.username}'s color`);
    return await role.delete()
    .catch((error) => {
        logger.error(`could not delete ${interaction.member.user.username}'s color for ${interaction.commandName} interaction (${error})`);
        return false;
    }).then(async () => {
        logger.info(`deleted ${interaction.member.user.username}'s color`);
        // eslint-disable-next-line no-magic-numbers
        return await interaction.editReply({embeds: [{title: 'Your color role has been removed!', description: `use \`/color set\` to set a new color!`, color: parseInt(config.colors.red.darken[2].hex, 10)}]})
            .then(() => {
                return true;
            }).catch((error) => {
                logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                return false;
            });
    });
}

async function sendViewColor(interaction) {
    const role = await interaction.member.roles.cache.find(_role => {return _role.name.endsWith(`'s Color`)});
    if (role === undefined) {
        logger.info(`${interaction.member.user.username} has no color to view`);
        // eslint-disable-next-line no-magic-numbers
        return await interaction.editReply({embeds: [{title: 'You have no color to view!', description: `use \`/color set\` to set your color!`, color: parseInt(config.colors.red.darken[2].hex, 10)}]})
            .then(() => {
                return true;
            }).catch((error) => {
                logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
                return false;
            });
    }

    const colorDisplay = role.color === 1 ? '#000000' : role.hexColor.toUpperCase();

    logger.info(`displaying ${role.name} color ${colorDisplay}`);
    return await interaction.editReply({content: `${colorDisplay}`, embeds: [{title: `${colorDisplay}`, description: `This is ${role}!\nUse \`/color set\` to change it`, color: role.color, image: {url: `https://color-hex.org/colors/${role.hexColor.slice(1)}.png`}}]})
        .then(() => {
            return true;
        }).catch((error) => {
            logger.warn(`could not respond to ${interaction.commandName} interaction (${error})`);
            return false;
        });
}

module.exports = {
	// eslint-disable-next-line id-denylist
	data: new SlashCommandBuilder()
		.setName('color')
		.setDescription('Set, remove, or view the color of your name in the server!')
		.setDefaultMemberPermissions(0)
		.setDMPermission(true)
        .addSubcommand(subcommand =>
            {return subcommand.setName('set')
            .setDescription('Sets (or updates) your current color')
            .addStringOption(option =>
                {return option.setName('color')
                .setDescription('(example: #FFFFFF) The hex code of your color (# optional) lowercase and uppercase both work')
                .setRequired(true)}
            )}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('remove')
            .setDescription('Removes the current color of your name (you can set it again)')}
        )
        .addSubcommand(subcommand =>
            {return subcommand.setName('view')
            .setDescription('View the current color of your name (this is only visible to you)')}
        ),
        async execute(interaction) {
            if (interaction.commandName !== 'color') { return; }

            if (interaction.options.getSubcommand() === 'set') {
                await sendSetColor(interaction);
            } 
            if (interaction.options.getSubcommand() === 'remove') {
                await sendRemoveColor(interaction);
            }
            if (interaction.options.getSubcommand() === 'view') {
                await sendViewColor(interaction);
            }
        }
}
