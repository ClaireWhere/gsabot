const { config } = require('../../client/config.json');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const vc_text_mobile = new AttachmentBuilder()
            .setFile(config.images.vc_text_mobile)
            .setName(`vc_text_mobile.png`)
            .setDescription(`Visual instructions for how to access the voice chat text channels on a mobile device. A red circle with a large red arrow pointing at it indicates where to press on screen to access the text chat.`);
        const vc_text_pc = new AttachmentBuilder()
            .setFile(config.images.vc_text_pc)
            .setName(`vc_text_pc.png`)
            .setDescription(`Visual instructions for how to access the voice chat text channels on a desktop device. Text overlaying the chat icon saying "Open Chat" indicates where to click on screen to access the text chat.`);

        const vc_pc = { content: `# How to Access Voice Text on PC\n`, files: [vc_text_pc] };
        const vc_mobile = { content: `# How to Access Voice Text on Mobile\n`, files: [vc_text_mobile] };
        const vc_info = { content: `# ❗ Please Use the Text Chat in Voice Channels Feature!! ❗\nHow to access on mobile and pc shown above :)` };
        return [vc_pc, vc_mobile, vc_info];
    }
}