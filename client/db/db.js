const { Client } = require('pg')
const { logger } = require('../utils/logger');

const client = new Client();
let healthy = true;

client.connect().then(() => {
    logger.info(`Successfully connected to "${process.env.PGDATABASE}" database`);
}).catch((connectionError) => {
    logger.error(`Failed to connect to database (host: ${process.env.PGHOST}, name: ${process.env.PGDATABASE})`)
    console.error(connectionError.stack);
    healthy = false;
});

// Verify that the client is healthy
client.query('SELECT NOW()', (queryError, queryResponse) => {
    if (queryError) {
        logger.error('Error executing query', queryError.stack);
        healthy = false;
    } else {
        logger.info(`Successfully executed query ${queryResponse.rows(0)}`);
    }
});

module.exports = {
    client,
    healthy
};