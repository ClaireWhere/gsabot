const { config } = require('../../config.json');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    execute() {
        const vcTextMobile = new AttachmentBuilder()
            .setFile(config.images.vc_text_mobile)
            .setName(`vc_text_mobile.png`)
            .setDescription(`Visual instructions for how to access the voice chat text channels on a mobile device. A red circle with a large red arrow pointing at it indicates where to press on screen to access the text chat.`);
        const vcTextPC = new AttachmentBuilder()
            .setFile(config.images.vc_text_pc)
            .setName(`vc_text_pc.png`)
            .setDescription(`Visual instructions for how to access the voice chat text channels on a desktop device. Text overlaying the chat icon saying "Open Chat" indicates where to click on screen to access the text chat.`);

        const vcPC = { content: `# How to Access Voice Text on PC\n`, files: [vcTextPC] };
        const vcMobile = { content: `# How to Access Voice Text on Mobile\n`, files: [vcTextMobile] };
        const vcInfo = { content: `# ❗ Please Use the Text Chat in Voice Channels Feature!! ❗\nHow to access on mobile and pc shown above :)` };
        return [vcPC, vcMobile, vcInfo];
    }
}