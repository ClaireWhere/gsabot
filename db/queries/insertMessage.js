const db = require('../db');

function insertMessage(id, content, createdAt, userID, channelID, guildID, attachment) {
    const query = `INSERT INTO message (id, content, created_at, user_id, channel_id, guild_id, attachment) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const values = [id, content, createdAt, userID, channelID, guildID, attachment];
    db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        } 
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertMessage;