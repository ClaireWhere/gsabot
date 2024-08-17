const { client, healthy } = require('../db');
const { logger } = require('../../utils/logger');

/**
 * 
 * @param {string} messageID 
 * @param {string} content 
 * @param {string} editedAt 
 * @returns {Promise<number>} The ID of the inserted message edit
 */
function insertMessageEdit(messageID, content, editedAt) {
    const query = `
        INSERT INTO message_edit (
            message_id, 
            content, 
            edited_at
        ) VALUES ($1, $2, $3)
        RETURNING id;
    `;
    const values = [messageID, content, editedAt];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                logger.error(queryError.stack);
                reject(queryError);
            } else {
                const insertID = queryResponse.rows.shift().id;
                logger.info(`Message edit inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertMessageEdit;