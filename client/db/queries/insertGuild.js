const { client, healthy } = require('../db');
const { logger } = require('../../utils/logger');

/**
 * 
 * @param {string} id 
 * @param {string} name 
 * @returns {Promise<string>} The ID of the inserted guild
 */
function insertGuild(id, name) {
    const query = `
        INSERT INTO guild (
            id, 
            name
        ) VALUES ($1, $2) ON CONFLICT (id) DO 
        UPDATE 
            SET name = $2
        RETURNING id;
    `;
    const values = [id, name];
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
                logger.info(`Guild inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertGuild;