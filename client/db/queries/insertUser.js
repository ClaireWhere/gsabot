const { db, healthy } = require('../db');

/**
 * 
 * @param {string} id 
 * @param {string} username 
 * @param {string} displayName 
 * @param {string} avatar 
 * @returns {Promise<string>} The ID of the inserted user
 */
function insertUser(id, username, displayName, avatar) {
    const query = `
        INSERT INTO "user" (
            id, 
            username, 
            display_name, 
            avatar
        ) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO 
        UPDATE
            SET username = $2, 
                display_name = $3, 
                avatar = $4
        RETURNING id;
    `;
    const values = [id, username, displayName, avatar];
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
                console.log(`User inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

module.exports = insertUser;