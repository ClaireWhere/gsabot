const { db, healthy } = require('../db');

/**
 * 
 * @param {string} messageID 
 * @returns
 */
function getAttachments(messageID) {
    const query = `SELECT * FROM attachments WHERE message_id = $1`;
    const values = [messageID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        db.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows);
            }
        });
    });
}

module.exports = getAttachments;