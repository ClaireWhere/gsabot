const db = require('../db');

function insertGuild(id, name) {
    const query = `INSERT INTO guild (id, name) VALUES ($1, $2)`;
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

module.exports = insertGuild;