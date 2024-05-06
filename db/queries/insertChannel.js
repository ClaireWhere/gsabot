const db = require('../db');
const MAX_NAME_LENGTH = 256;

function insertChannel(id, name) {
    const query = `INSERT INTO channel (id, name) VALUES ($1, $2)`;
    if (!id || !name || typeof id !== 'number' || typeof name !== 'string') {
        return null;
    }
    if (name.length > MAX_NAME_LENGTH) {
        // eslint-disable-next-line no-magic-numbers
        name = name.substring(0, MAX_NAME_LENGTH);
    }
    const values = [id, name];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertChannel;