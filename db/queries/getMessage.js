const db = require('../db');

function getMessage(id) {
    const query = `SELECT * FROM message WHERE id = $1`;
    const values = [id];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

module.exports = getMessage;