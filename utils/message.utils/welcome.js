const { AttachmentBuilder } = require('discord.js');
const { config } = require('../../client/config.json');
const { getChannelParentName } = require('../utils');
require('dotenv').config();

module.exports = {
    async execute(interaction) {
        const guild_owner = interaction.client.guilds.cache.get(process.env.GUILD_ID).fetchOwner();
        const rules = interaction.guild.channels.cache.find(channel => channel.name === 'rules' && getChannelParentName(channel) === '━━ verification') ?? `\`#rules\``;

        const content = `If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guild_owner} <-- you can click my name here and message\n‎`

        const file = new AttachmentBuilder()
            .setFile(process.env.GSA_BANNER)
            .setName(`gsa_banner.png`)
            .setDescription(`Gender and Sexuality Alliance Banner`);

        const embed_1 = {
            title: `‎\nWelcome to the GSA Discord server!!`,
            description: `‎\n🏳️‍🌈 We are the Gender and Sexuality Alliance; we provide a welcoming and safe space for people of all orientations and points in their journey. Straight cis allies are encouraged to be involved.\n\nMany people are still figuring out their gender and sexuality and we are here to support them through the good and the bad times.`,
            color: parseInt(config.colors.black.hex),
            fields: [
            {
                name: `‎\n🎉 It's so awesome you've shown an interest in joining the Discord`,
                value: `To be clear, this does not constitute joining the organization (which involves registering on ${process.env.REGISTER}), BUT you are more than welcome to talk in the Discord server regardless of whether you're an official member or not :)`
            },
            {
                name: `‎\n❗ Before you can join the fun, we want to make sure you agree to the rules here`,
                value: `This is a very safe space, and it is extremely important to be sensitive. This is NOT a place to argue politics or invalidate someone, so it is vital that you read the rules.`
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
            }
        };

        const embed_2 = {
            title: "",
            description: `‎\n\n**Just make sure you've read through the rules in ${rules}, then click the button at the bottom that you agree to the rules of this server!**\n\n‎If you have ANY questions or concerns about rules, what we're all about, or anything like that, please message ${guild_owner}\n‎`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Posted on`,
                icon_url: config.images.gsa_icon
            },
            color: parseInt(config.colors.light_red.darken[0].hex)
        };

        const welcome = {content: content, embeds: [embed_1, embed_2], files: [file] };
        return welcome;
    }        
};