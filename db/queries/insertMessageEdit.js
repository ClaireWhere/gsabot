const db = require('../db');

function insertMessageEdit(messageID, content, editedAt) {
    const query = `INSERT INTO message_edit (message_id, content, edited_at) VALUES ($1, $2, $3)`;
    const values = [messageID, content, editedAt];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertMessageEdit;