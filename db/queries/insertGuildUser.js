const db = require('../db');

function insertGuildUser(guildID, userID, nickname, displayHexColor) {
    const query = `INSERT INTO guild_user (guild_id, user_id, nickname, display_hex_color) VALUES ($1, $2, $3, $4)`;
    const values = [guildID, userID, nickname, displayHexColor];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertGuildUser;