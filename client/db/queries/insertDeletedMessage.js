const { client, healthy } = require('../db');

/**
 * 
 * @param {string} messageID 
 * @param {string} deletedAt 
 * @returns {Promise<number>} The ID of the inserted deleted message
 */
function insertDeletedMessage(messageID, deletedAt) {
    const query = `
        INSERT INTO deleted_message (
            message_id, 
            deleted_at
        ) 
        VALUES ($1, $2) ON CONFLICT (message_id) 
        DO NOTHING
        RETURNING id;
    `;
    const values = [messageID, deletedAt];
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
                console.log(`Deleted message inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertDeletedMessage;