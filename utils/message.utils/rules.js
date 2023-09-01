const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { config } = require('../../client/config.json');
require('dotenv').config()

module.exports = {
    async execute(interaction) {
        const embed_1 = new EmbedBuilder()
            .setTitle(`‎\n📣 REMEMBER THIS IS A SAFE AND POSITIVE SPACE FOR THE LGBTQ+ COMMUNITY AT ${process.env.SCHOOL.toUpperCase()}, AND THE POSTS MADE IN THIS DISCORD ARE REPRESENTATIVE OF OUR ORGANIZATION AS A WHOLE.`)
            .setDescription('‎\nThere is **ABSOLUTELY NO TOLERANCE** for homophobia, transphobia, sexism, racism, or any type of hate speech. If you are unfamiliar with a certain topic that comes up in conversation, ask and be open and respectful.')
            .setColor(parseInt(config.colors.light_red.darken[0].hex))
            .setAuthor({ name: 'Gender & Sexuality Alliance', iconURL: config.images.gsa_icon })
            .setThumbnail(config.images.rules_thmb);

        const safe_space = await interaction.guild.channels.cache.find(channel => channel.name === 'safe-space') ?? `#safe-space`;
        const safe_space_entrance = await interaction.guild.channels.cache.find(channel => channel.name === 'safe-space-entrance') ?? `#safe-space-entrance`;
        const general = await interaction.guild.channels.cache.find(channel => channel.name === 'general') ?? `#general`;


        const embed_2 = new EmbedBuilder()
            .setColor(parseInt(config.colors.black.hex))
            .addFields(
                {
                    "name": `1️⃣ Be respectful and welcoming of others`,
                    "value": `Homophobia, transphobia, sexism, racism, or any type of hate speech, discriminatory, or toxic behavior is **not** tolerated.`
                },
                {
                    "name": `‎\n2️⃣ Use an appropriate and identifiable nickname`,
                    "value": `Avoid slurs, obscenities, and inappropriate phrases and references in your nickname. Pick something identifiable and do not impersonate others.`
                },
                {
                    "name": "How to change nickname on mobile 📱",
                    "value": `>>> Click the 3 bars on the top left of your screen, then click the 3 vertical dots next to GSA @ OU, then click \`\`\`Edit Server Profile\`\`\` and set your nickname.`,
                    "inline": true
                },
                {
                    "name": "How to change nickname on PC 💻",
                    "value": `>>> Click the dropdown menu on the top left where it says GSA @ ${process.env.SCHOOL_CODE} and click \`\`\`Edit Server Profile\`\`\` and set your nickname.`,
                    "inline": true
                },
                {
                    "name": `‎\n3️⃣ Keep the server safe for work`,
                    "value": `We do not want sexual or otherwise explicit content here. Feel free to talk about sexuality, but refrain from being explicit. Many people have different comfort levels when it comes to talking about sex so please be mindful and use spoiler tags and warnings when necessary.`
                },
                {
                    "name": `‎\n4️⃣ Don’t disrupt the peace.`,
                    "value": `Please use your manners, and don't (rudely) interrupt conversations or spam the chats or spam ping users.`
                },
                {
                    "name": `‎\n5️⃣ \`\`\`#general\`\`\` is the main chat and should be used for casual discussions`,
                    "value": `Please keep topics of politics, trauma, mental health, and any sensitive topics in ${safe_space}. Topics of politics should be talked about very carefully here. Please be respectful.`
                },
                {
                    "name": `‎\n6️⃣ Use channels as intended`,
                    "value": `Try to post in the correct channels as much as possible. We will direct you to the right place if you're unsure.`
                },
                {
                    "name": `‎\n7️⃣ Use spoiler tags when needed`,
                    "value": `❗ For the ${safe_space} rules and how to gain access to it, head over to ${safe_space_entrance}`,
                },
                {
                    "name": `✨ When to use spoiler tags`,
                    "value": `>>> Spoiler tags may be helpful outside of ${safe_space} if you are mentioning something that could potentially be seen as a sensitive topic. Once again, keep heavily sensitive topics such as trauma, mental health, etc. out of ${general}`,
                    "inline": true
                },
                {
                    "name": `✨ How to use spoiler tags`,
                    "value": `>>> To use spoiler tags, surround your text with two pipe bar characters (\\||) on each side \\||like this\\||. Your message will appear ||like this||! People will have to click on it before reading. It is also very helpful to include a warning along with your spoiler.\n(Example: Trigger warning: mental health)`,
                    "inline": true
                },
                {
                    "name": `‎\n8️⃣ Eboard may moderate at their discretion`,
                    "value": `If there are loopholes in the rules, it is up to Eboard how to moderate based on what they deem appropriate. Eboard holds the final discretion.`
                }
            )
            .setTimestamp()
            .setFooter({ text: `Posted on`, iconURL: config.images.gsa_icon });

            const file = new AttachmentBuilder()
            .setFile(process.env.GSA_BANNER)
            .setName(`gsa_banner.png`)
            .setDescription(`Gender and Sexuality Alliance Banner`);

        const rules = { embeds: [embed_1, embed_2], files: [file] };
        return rules;
    }
}