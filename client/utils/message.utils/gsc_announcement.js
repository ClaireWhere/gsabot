const { config } = require('../../config.json');

module.exports = {
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @param {{ping: boolean, content: string}} announcementData
     * @returns 
     */
    execute(interaction, announcementData) {
        const gscRole = announcementData.ping ? interaction.guild.roles.cache.find(role => {return role.name === config.roles.gsc.name}) : '';
        const nickname = interaction.member.nickname ?? interaction.member.displayName ?? interaction.user.username;

        const embed1 = {
            title: ``,
            description: `# GSC Announcement\n‎\n>>> ${announcementData.content}`,
            color: parseInt(Number(config.colors.light_red.darken[0].hex), 10),
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
        
        const gscAnnouncement = { content: `${gscRole}`, embeds: [embed1] }
        return gscAnnouncement
    }
}