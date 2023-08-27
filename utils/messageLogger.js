const { LoggedMessage } = require('../models/LoggedMessage');
const { config } = require('../config.json');
const { debug } = require('../utils/debugger');
/**
 * 
 * @param {LoggedMessage} message 
 * @returns 
 */
function insertMessageLog(message) {
    if (!message) { return; }
    const db = open({
        timeout: 2000,
        fileMustExist: true
    });

    if (!db) { return false; }

    try {
        const insert_user = db.prepare('INSERT INTO user (id, name) VALUES (?, ?)');
        insert_user.run(message.author_id, message.author_name);
        debug('[SQLite] inserted into user');
    } catch (error) {
        debug('[SQLite] did not insert into user', error);
    }
    try {
        const insert_channel = db.prepare(`INSERT INTO channel (id, name) VALUES (?, ?)`);
        insert_channel.run(message.channel_id, message.channel_name);
        debug('[SQLite] inserted into channel');
    } catch (error) {
        debug('[SQLite] did not insert into channel', error);
    }
    try {
        const insert_message = db.prepare(`INSERT INTO message (id, content, author, channel, date, guild) VALUES (?, ?, ?, ?, ?, ?)`);
        insert_message.run(message.id, message.content, message.author_id, message.channel_id, !message.date ? null : message.date.getTime(), message.guild_id);
        debug('[SQLite] inserted into message');
    } catch (error) {
        debug('[SQLite] did not insert into message', error);
    }
    try {
        const insert_deleted = db.prepare(`INSERT INTO deleted_message (message_id, deleted_on) VALUES (?, ?)`);
        insert_deleted.run(message.id, new Date().getTime());
        debug('[SQLite] inserted into deleted_message');
    } catch (error) {
        debug('[SQLite] did not insert into deleted_message', error);
        db.close();
        return false;
    }
    db.close();
    return true;
}

/**
 * 
 * @param {number} message_id - the id property of the deleted_message record to retrieve from
 * @returns {LoggedMessage | null} LoggedMessage object containing the information from the deleted_message record
 */
function getMessageLog(message_id) {
    if (!verifyMessageId(message_id)) { return null; }

    const db = open({
        timeout: 2000,
        fileMustExist: true,
        readonly: true
    });

    if (!db) { return false; }
    
    try {
        const select_log = db.prepare(`
        SELECT 
            message.id, message.content, message.guild, message.date, deleted_message.deleted_on, user.id, user.name, channel.id, channel.name
            FROM message
                LEFT JOIN deleted_message
                    ON deleted_message.message_id = message.id
                LEFT JOIN user
                    ON message.author=user.id
                LEFT JOIN channel
                    ON message.channel=channel.id
            WHERE message.id = @message_id;
        `);
        const result = select_log.expand().get({message_id: message_id});
        db.close();
        return new LoggedMessage(result.message.id, result.message.content, result.user.id, result.user.name, result.channel.id, result.channel.name, result.message.guild, result.message.date, result.deleted_message.deleted_on);
    } catch (error) {
        console.error(error);
    }
    db.close();
    return null;
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
        debug(`${config.database.name}.db does not exist! Run "npm run initialize" to initialize the database`);
        return undefined;
    }
}



module.exports = { insertMessageLog, getMessageLog, verifyMessageId }

/**
 * Filters out some invalid message id's. Does not accurately verify message id's as true all of the time.
 * 
 * @param {string} id
 * @returns boolean - false if the provided id is not a valid message id, true if the message is *likely* valid.
 */
function verifyMessageId(id) {
    return (id.match('^[0-9]*$') && id.length >= 17) ?? false;
}

function getDbDirectory() {
    return __dirname.slice(0, __dirname.lastIndexOf('utils'));
}