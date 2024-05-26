const { client, healthy } = require('../db');

/**
 * 
 * @param {string} id 
 * @param {string} content 
 * @param {string} createdAt 
 * @param {string} guildUserID 
 * @param {string} channelID 
 * @returns {Promise<string>} The ID of the inserted message
 */
function insertMessage(id, content, createdAt, guildUserID, channelID) {
    const query = `
        INSERT INTO message (
            id, 
            content, 
            created_at, 
            guild_user_id, 
            channel_id
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) 
        DO NOTHING
        RETURNING id;
    `;
    const values = [id, content, createdAt, guildUserID, channelID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                const insertID = queryResponse.rows.shift().id;
                console.log(`Message inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertMessage;