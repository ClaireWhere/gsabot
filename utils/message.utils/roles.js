const announcements = require('./roles/announcements.js');
const minecraft = require('./roles/minecraft.js');
const pronouns = require('./roles/pronouns.js');
const year = require('./roles/year.js');
const identity = require('./roles/identity.js');

module.exports = {
    async execute(interaction) {
        const roles = [await pronouns.execute(interaction), await identity.execute(interaction), await year.execute(interaction), await announcements.execute(interaction), await minecraft.execute(interaction)];
        return roles;
    }
}