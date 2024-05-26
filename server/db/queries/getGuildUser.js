const { client, healthy } = require('../db');

/**
 * Retrieves a guild_user by id
 * 
 * @param {string} id  - The id of the guild_user to retrieve
 * @returns {Promise<{
 *      user_id: string,
 *      nickname: string | null,
 *      username: string,
 *      display_name: string | null,
 *      avatar: string,
 *      guild_name: string
 * }>} - The guild_user with the specified id
 */
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
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows);
            }
        });
    });
}

module.exports = getGuildUser;