const { AttachmentBuilder } = require('discord.js');
const { config } = require('../../config.json');
const { getChannelParentName } = require('../utils');
require('dotenv').config();

module.exports = {
    async execute(interaction, isEdit = false) {
        const guildOwner = await interaction.guild.fetchOwner();
        const rules = await interaction.guild.channels.cache.find(channel => {return channel.name === 'rules' && getChannelParentName(channel).includes('verification')}) ?? `\`#rules\``;

        const content = `If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guildOwner} <-- you can click my name here and message\n‎`;

        const file = new AttachmentBuilder()
            .setFile(process.env.GSA_BANNER)
            .setName(`sage_banner.png`)
            .setDescription(`SAGE Banner`);

        const embed1 = {
            title: `‎\nWelcome to the SAGE Discord server!!`,
            description: `‎\n🏳️‍🌈 We are the Sexuality And Gender E... wait what does the E mean? We provide a welcoming and safe space for people of all orientations and points in their journey. Straight cis allies are encouraged to be involved.\n\nMany people are still figuring out their gender and sexuality and we are here to support them through the good and the bad times.`,
            color: parseInt(Number(config.colors.black.hex), 10),
            fields: [
            {
                name: `‎\n🎉 It's so awesome you've shown an interest in joining the Discord`,
                value: `To be clear, this does not constitute joining the organization (which involves registering on ${process.env.REGISTER} and/or attending our in-person events/meetings), BUT you are more than welcome to talk in the Discord server regardless of whether you're an official member or not :)`
            },
            {
                name: `‎\n❗ Before you can join the fun, we want to make sure you agree to the rules here`,
                value: `This is a very safe space, and it is extremely important to be sensitive. This is NOT a place to argue politics or invalidate someone, so it is vital that you read the rules.`
            }
            ],
            author: {
                name: `Sexuality And Gender Etc.`,
                icon_url: config.images.gsa_icon
            },
            thumbnail: {
                url: config.images.agreement_thmb,
                height: 0,
                width: 0
            }
        };

        const embed2 = {
            title: "",
            description: `‎\n\n**Just make sure you've read through the rules in ${rules}, then click the button at the bottom that you agree to the rules of this server!**\n\n‎If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guildOwner}\n‎`,
            timestamp: new Date().toISOString(),
            footer: {
                text: isEdit ? `Updated` : `Posted`,
                icon_url: config.images.gsa_icon
            },
            color: parseInt(Number(config.colors.light_red.darken[0].hex), 10)
        };

        const welcome = {content: content, embeds: [embed1, embed2], files: [file] };
        return welcome;
    }
};
