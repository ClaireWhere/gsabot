const { Client } = require('pg')
require('dotenv').config()


const client = new Client({
    user: 'gsabot',
    host: 'db',
    database: 'gsabot',
    password: process.env.DATABASE_PASSWORD,
    port: 5432,
});

client.connect();

module.exports = client;