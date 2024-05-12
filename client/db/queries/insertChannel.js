const { db, healthy } = require('../db');
const MAX_NAME_LENGTH = 256;

/**
 * 
 * @param {string} id 
 * @param {string} name 
 * @returns {Promise<string>} The ID of the inserted channel
 */
function insertChannel(id, name) {
    const query = `
        INSERT INTO channel (id, name) 
        VALUES ($1, $2)
        ON CONFLICT (id) DO 
        UPDATE 
            SET name = $2
        RETURNING id;
    `;
    if (!id || !name || typeof id !== 'string' || typeof name !== 'string') {
        return null;
    }
    if (name.length > MAX_NAME_LENGTH) {
        name = name.substring(0, MAX_NAME_LENGTH);
    }
    const values = [id, name];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        db.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                const insertID = queryResponse.rows.shift().id;
                console.log(`Channel inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertChannel;