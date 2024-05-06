const db = require('../db');

function getChannel(id) {
    const query = `SELECT * FROM channel WHERE id = $1`;
    const values = [id];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

module.exports = getChannel;