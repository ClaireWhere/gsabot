const { client, healthy } = require('../db');

/**
 * 
 * @param {string} guildID 
 * @param {string} userID 
 * @param {string} nickname 
 * @param {string} displayHexColor 
 * @returns {Promise<number>} The ID of the inserted guild user
 */
function insertGuildUser(guildID, userID, nickname, displayHexColor) {
    const query = `
        INSERT INTO guild_user (
            guild_id, 
            user_id, 
            nickname, 
            display_hex_color
        ) 
        VALUES ($1, $2, $3, $4) ON CONFLICT (guild_id, user_id) DO 
        UPDATE 
            SET nickname = $3, 
                display_hex_color = $4
        RETURNING id;
    `;
    const values = [guildID, userID, nickname, displayHexColor];
    
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
                console.log(`Guild user inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertGuildUser;