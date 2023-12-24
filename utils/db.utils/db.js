const { LoggedMessage } = require('../../models/LoggedMessage');
const { config } = require('../../config.json');
const { logger } = require('../logger');

function getDbDirectory() {
    return __dirname.slice(0, __dirname.indexOf('utils'));
}

/**
 * 
 * @param {import('better-sqlite3').Options} options 
 * @returns 
 */
function open(options) {
    try {
        const db = require('better-sqlite3')(`${getDbDirectory()}${config.database.name}.db`, options);
        db.pragma('journal_mode = WAL');
        return db;
    } catch (error) {
        logger.warn(`${config.database.name}.db does not exist at ${getDbDirectory()}! Run "npm run initialize" to initialize the database`);
        return undefined;
    }
}

function addUser(db, user_id, user_name) {
    try {
        const insert_user = db.prepare('INSERT INTO user (id, name) VALUES (?, ?)');
        insert_user.run(user_id, user_name);
        logger.info('[SQLite] inserted into user');
        return true;
    } catch (error) {
        logger.warn(`[SQLite] did not insert into user (${error})`);
        return false;
    }
}

function addChannel(db, channel_id, channel_name) {
    try {
        const insert_channel = db.prepare(`INSERT INTO channel (id, name) VALUES (?, ?)`);
        insert_channel.run(channel_id, channel_name);
        logger.info('[SQLite] inserted into channel');
        return true;
    } catch (error) {
        logger.warn(`[SQLite] did not insert into channel (${error})`);
        return false;
    }
}

function addMessage(db, id, content, author_id, channel_id, date, guild_id) {
    try {
        const insert_message = db.prepare(`INSERT INTO message (id, content, author, channel, date, guild) VALUES (?, ?, ?, ?, ?, ?)`);
        insert_message.run(id, content, author_id, channel_id, date, guild_id);
        logger.info('[SQLite] inserted into message');
        return true;
    } catch (error) {
        logger.warn(`[SQLite] did not insert into message (${error})`);
        return false;
    }
}

function addDeleted(db, message_id, deleted_on) {
    try {
        const insert_deleted = db.prepare(`INSERT INTO deleted_message (message_id, deleted_on) VALUES (?, ?)`);
        insert_deleted.run(message.id, new Date().getTime());
        logger.info('[SQLite] inserted into deleted_message');
        return true;
    } catch (error) {
        logger.warn(`[SQLite] did not insert into deleted_message (${error})`);
        return false;
    }
}

function addAppreciation(db, day, time, user_id, initiator_id, guild_id) {
    try {
        const insert_appreciation = db.prepare('INSERT INTO appreciation (day, time_started, appreciated, initiator, guild) VALUES (?, ?, ?, ?, ?)');
        insert_appreciation.run(day, time, user_id, initiator_id, guild_id)
        logger.info(`[SQLite] inserted into 'appreciation' table`)
        return true;
    } catch (error) {
        logger.warn(`[SQLite] ran into an error adding a new row to the 'appreciation' table (${error})`);
        logger.info(`oh no!`)
        return false;
    }
}

module.exports = { open, addUser, addChannel, addMessage, addDeleted, addAppreciation }