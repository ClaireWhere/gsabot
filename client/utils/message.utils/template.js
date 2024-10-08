const { config } = require('../../config.json');
const { ButtonStyle, ActionRowBuilder, AttachmentBuilder, ButtonBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  async execute(interaction) {
    const file = new AttachmentBuilder()
        .setFile(process.env.GSA_BANNER)
        .setName(`gsa_banner.png`)
        .setDescription(`Gender and Sexuality Alliance Banner`);

    const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(``)
                    .setCustomId(``)
                    .setDisabled(false)
            );

    const embed = {
        title: ``,
        description: ``,
        color: parseInt(Number(config.colors.black.hex), 10),
        fields: [
          {
            name: ``,
            value: ``
          }
        ],
        author: {
          name: `Gender & Sexuality Alliance`,
          icon_url: config.images.gsa_icon
        },
        thumbnail: {
          url: config.images.agreement_thmb,
          height: 0,
          width: 0
        },
        timestamp: new Date().toISOString(),
        footer: {
            text: `Posted on`,
            icon_url: config.images.gsa_icon
        }
    };

    const template = { content: ``, embeds: [embed], components: [row], files: [file] }
    return template;
  }
}