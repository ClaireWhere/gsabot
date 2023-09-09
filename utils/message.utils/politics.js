const { config } = require('../../client/config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getChannelParentName } = require('../utils');

module.exports = {
    async execute(interaction) {
        const politics = await interaction.guild.channels.cache.find(channel => channel.name === 'politics' && !getChannelParentName(channel).includes('archive')) ?? `\`#politics\``;
        const rules = await interaction.guild.channels.cache.find(channel => channel.name === 'rules' && !getChannelParentName(channel).includes('archive') && !getChannelParentName(channel).includes('verification')) ?? `\`#rules\``;

        const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setLabel(`I agree to the politics rules`)
                        .setCustomId(`politics`)
                        .setDisabled(false)
                );

        const embed_1 = {
            title: ``,
            description: `# ‎\n# ❗Politics Rules❗\nTo gain access to the ${politics} channel, please press the button below. This channel contains political content that may be upsetting to some, but please note that all the rules of the server still apply on top of the following.\n\n### Disclaimer:\nThe ${politics} channel is the place to talk about political issues. This is **NOT** a place to argue politics, but rather to inform and discuss with others current and historical political events/issues. Please respect the following rules for ${politics} as well as the ${rules} of the server.`,
            color: parseInt(config.colors.light_red.darken[0].hex),
            author: {
            name: `Gender & Sexuality Alliance`,
            icon_url: config.images.gsa_icon
            },
            thumbnail: {
            url: config.images.politics_thmb,
            }
        };
        const embed_2 = {
            title: ``,
            description: ``,
            color: parseInt(config.colors.black.hex),
            fields: [
                {
                    "name": `1️⃣  Be respectful and welcoming of others`,
                    "value": `Homophobia, transphobia, sexism, racism, or any type of hate speech, discriminatory, or toxic behavior is **not** tolerated.\nBe welcoming of other people's political views even if they differ from your own. Anyone with harmful views will be dealt with by the eBoard, please refrain from interacting with trolls and anyone trying to cause issues.`
                },
                {
                    "name": `‎\n2️⃣ Do not participate in arguments`,
                    "value": `Be calm and understanding of other people's political views. If you disagree, kindly share why you disagree. This is not the place for heated arguments or unproductive back-and-forth disagreements.`
                },
                {
                    "name": `‎\n3️⃣ No name-calling, insulting, or threatening`,
                    "value": `No matter how extreme someone's views are, please refrain from using slurs or demeaning language toward them. Do not insinuate violence. Instead, share what bothers you. Try not to get heated.`
                },
                {
                    "name": `‎\n4️⃣ Avoid escalating fear and distress to your peers`,
                    "value": `Queer people are greatly affected by politics and it can be extremely upsetting, we understand the anger, fear, and pain. Spiraling fear can make it even more upsetting for some, so we ask that you stay composed in discussions. None of us are mental health professionals and there are limits to the amount and type of support you should be receiving in this channel.`
                },
                {
                    "name": `‎\n5️⃣ Eboard may moderate at their discretion`,
                    "value": `If there are loopholes in the rules, it is up to Eboard how to moderate based on what they deem appropriate. The Eboard holds the final discretion.`
                }
            ]
        };
        const embed_3 = {
            title: ``,
            description: `# ❗ By agreeing below, you acknowledge that you have read the rules and understand the purpose and appropriate use of the ${politics} channel.\n\nYou agree that you will continue to be respectful to others and sensitive to everyone's feelings regarding political issues. Please keep the things discussed in the ${politics} channel in this channel only. \n\nThis role may be removed at any time if you are not using this space appropriately and you will be messaged about it. Please note if you are removed, you are not in trouble, we will just not issue warnings for ${politics} as it is a highly sensitive place.\n\n### Click this button again to remove ${politics} from your view at any time\n`,
            color: parseInt(config.colors.light_red.darken[0].hex),
            timestamp: new Date().toISOString(),
            footer: {
                text: `Posted on`,
                icon_url: config.images.gsa_icon
            }
        };

        const politics_agreement = { content: ``, embeds: [embed_1, embed_2, embed_3], components: [row] }
        return politics_agreement;
    }
}