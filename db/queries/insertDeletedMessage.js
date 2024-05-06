const db = require('../db');

function insertDeletedMessage(messageID, deletedAt) {
    const query = `INSERT INTO deleted_message (message_id, deleted_at) VALUES ($1, $2)`;
    const values = [messageID, deletedAt];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertDeletedMessage;