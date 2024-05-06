const db = require('../db');

function insertUser(id, username, discriminator, avatar, isBot) {
    const query = `INSERT INTO users (id, username, discriminator, avatar, is_bot) VALUES ($1, $2, $3, $4, $5)`;
    const values = [id, username, discriminator, avatar, isBot];
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