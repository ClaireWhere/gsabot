const { config } = require('../../client/config.json');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getChannelParentName } = require('../utils');

module.exports = {
    async execute(interaction) {
        const safe_space = await interaction.guild.channels.cache.find(channel => channel.name === 'safe-space' && !getChannelParentName(channel).includes('archive')) ?? `\`#safe_space\``;
        const rules = await interaction.guild.channels.cache.find(channel => channel.name === 'rules' && !getChannelParentName(channel).includes('archive')) ?? `\`#rules\``;

        const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setLabel(`I agree to the safe space rules`)
                        .setCustomId(`safe_space`)
                        .setDisabled(false)
                );

        const embed_1 = {
            title: ``,
            description: `‎\n# ❗ Safe Space Rules ❗\nTo gain access to the ${safe_space} channel, please press the button below. This channel contains heavier topics such as mental health and venting but please note that all the rules of the server still apply on top of the following rules. \n\n### Disclaimer:\nThis is not a space to argue or talk politics, disagreements should be respectful and absolutely no harassment is tolerated.`,
            color: parseInt(config.colors.red.darken[0].hex),
            author: {
                name: `Gender & Sexuality Alliance`,
                icon_url: config.images.gsa_icon
            },
            thumbnail: {
                url: config.images.safe_space_thmb
            }
        };

        const embed_2 = {
            title: ``,
            description: ``,
            color: parseInt(config.colors.black.hex),
            fields: [
                {
                    "name": `1️⃣  Use Spoiler Tags!!`,
                    "value": `Even though this is the dedicated safe space channel, remember that you still have to be mindful of what others in the safe space are comfortable reading. \n\n>>> **To use spoiler tags**, surround your text with two pipe bar characters (\\|\\|) on each side \\|\\|like this\\|\\|. Your message will appear ||like this||! People will have to click on it before reading. It is also very helpful to include a warning along with your spoiler. \n(Example: Trigger warning: mental health)`
                },
                {
                    "name": `‎\n2️⃣ Please do not include names without permission`,
                    "value": `If a person attends or is affiliated with Oakland University, please do not name them in any negative context unless you have asked permission. Include in the message that you got permission. Do not name any GSA member or anyone otherwise involved in the GSA in a negative context. Otherwise, the message may be deleted and you'll be messaged to post it again with the name removed. Referring to someone as "my friend", "my brother", "somebody" etc. is completely acceptable unless they are in this server or otherwise involved with the GSA.`
                },
                {
                    "name": `‎\n3️⃣ As always, be respectful and welcoming of others`,
                    "value": `Make sure to read and follow the ${rules}. Homophobia, transphobia, sexism, racism, or any type of hate speech, discriminatory, or toxic behavior is **not** tolerated (talking about your experiences with these things is allowed).`
                },
                {
                    "name": `‎\n4️⃣ Please refrain from sharing heavy emotional or mental health crises`,
                    "value": `${safe_space} is not a place for mental health crises. Please understand this is not because we don't want you to talk about your mental health, but none of us are mental health professionals and there is only so much we can help. As much as we want to offer you support, there are limits to the type and amount of support you should be receiving. Please call or text 988, chat 988lifeline.org or call 911 if you are having a mental heath crisis\n>>> Additionally, keep in mind there may be mandated reporters (i.e. GSC Coordinator, GSC Graduate Assistant, GSC Peer Mentors, etc.) in this space. While they are encouraged to remove themselves from ${safe_space}, they are required by law to report mental health emergencies to the university.`
                }
            ],
        };

        const embed_3 = {
            title: ``,
            description: `## ❗ By agreeing below, you acknowledge that you have read the rules and understand the purpose and appropriate use of the ${safe_space} channel.\nYou agree that you will continue to be respectful to others and sensitive to everyone's feelings. Please keep the things discussed in the ${safe_space} channel private and avoid discussing things outside. \n\nThis role may be removed at any time if you are not using this space appropriately and you will be messaged about it. Please note if you are removed, you are not in trouble, we will just not issue warnings for ${safe_space} as it is a highly sensitive place.\n\n### Click this button again to remove ${safe_space} from your view\n‎`,
            color: parseInt(config.colors.red.darken[0].hex),
            timestamp: new Date().toISOString(),
            footer: {
                text: `Posted on`,
                icon_url: config.images.gsa_icon
            }
        };

        const safe_space_agreement = { content: ``, embeds: [embed_1, embed_2, embed_3], components: [row] }
        return safe_space_agreement;
    }
}