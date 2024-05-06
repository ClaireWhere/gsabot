const db = require('../db');

function insertUser(id, username, displayName, avatar) {
    const query = `INSERT INTO users (id, username, display_name, avatar) VALUES ($1, $2, $3, $4)`;
    const values = [id, username, displayName, avatar];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

module.exports = insertUser;