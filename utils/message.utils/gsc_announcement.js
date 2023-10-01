const { config } = require('../../client/config.json');

module.exports = {
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @param {{ping: boolean, content: string}} data
     * @returns 
     */
    async execute(interaction, data) {
        const gsc_role = data.ping ? interaction.guild.roles.cache.find(role => role.name === config.roles.gsc.name) : '';
        const nickname = interaction.member.nickname ?? interaction.member.displayName ?? interaction.user.username;

        const embed_1 = {
            title: ``,
            description: `# GSC Announcement\n‎\n>>> ${data.content}`,
            color: parseInt(config.colors.light_red.darken[0].hex),
            timestamp: new Date().toISOString(),
            footer: {
                text: `Announcement created by ${nickname}\nPosted on`,
                icon_url: interaction.member.displayAvatarURL()
            },
            author: {
                name: `Gender & Sexuality Alliance`,
                icon_url: config.images.gsa_icon
            },
        };
        
        const gsc_announcement = { content: `${gsc_role}`, embeds: [embed_1] }
        return gsc_announcement;
    }
}