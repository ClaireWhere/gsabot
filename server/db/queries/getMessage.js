const { db, healthy } = require('../db');

function getMessage(id) {
    const query = `SELECT * FROM message WHERE id = $1`;
    const values = [id];
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

module.exports = getMessage;