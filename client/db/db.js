const { Client } = require('pg')

const client = new Client();
let healthy = true;

client.connect().then(() => {
    console.log(`Successfully connected to ${process.env.PGDATABASE} database`);
}).catch((connectionError) => {
    console.log(`Failed to connect to database (host: ${process.env.PGHOST}, name: ${process.env.PGDATABASE})`)
    console.error(connectionError.stack);
    healthy = false;
});

// Verify that the client is healthy
client.query('SELECT NOW()', (queryError, queryResponse) => {
    if (queryError) {
        console.error('Error executing query', queryError.stack);
        healthy = false;
    } else {
        console.log('Successfully executed query', queryResponse.rows);
    }
});

module.exports = {
    client,
    healthy
};