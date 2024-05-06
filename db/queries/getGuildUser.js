const db = require('../db');

function getGuildUser(id) {
    const query = `
        SELECT 
            guild_user.user_id AS user_id,
            guild_user.nickname AS nickname,
            user.username AS username,
            user.display_name AS display_name,
            user.avatar AS avatar,
            guild.name AS guild_name
        FROM guild_user
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE guild_user.id = $1
    `;
    const values = [id];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

module.exports = getGuildUser;