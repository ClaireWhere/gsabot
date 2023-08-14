const { announcements } = require('./roles/announcements');
const { minecraft } = require('./roles/minecraft');
const { pronouns } = require('./roles/pronouns');
const { year } = require('./roles/year');
const { identity } = require('./roles/identity');


module.exports = {
    async execute(interaction) {
        const roles = [pronouns, identity, year, announcements, minecraft];
        return roles;
    }
}