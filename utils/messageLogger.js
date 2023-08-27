const { LoggedMessage } = require('../models/LoggedMessage');
const { config } = require('../config.json');
const { debug } = require('../utils/debugger');

const db = require('better-sqlite3')(`${config.database.name}.db`, {
    timeout: 2000
});
db.pragma('journal_mode = WAL');

/**
 * 
 * @param {LoggedMessage} message 
 * @returns 
 */
function insertMessageLog(message) {
    try {
        const insert_user = db.prepare('INSERT INTO user (id, name) VALUES (?, ?)');
        insert_user.run(message.author, message.author_name);
        debug('[SQLite] inserted into user');
    } catch (error) {
        debug('[SQLite] did not insert into user', error);
    }
    try {
        const insert_channel = db.prepare(`INSERT INTO channel (id, name) VALUES (?, ?)`);
        insert_channel.run(message.channel, message.channel_name);
        debug('[SQLite] inserted into channel');
    } catch (error) {
        debug('[SQLite] did not insert into channel', error);
    }
    try {
        const insert_message = db.prepare(`INSERT INTO message (id, content, author, channel, date, guild) VALUES (?, ?, ?, ?, ?, ?)`);
        insert_message.run(message.id, message.content, message.author, message.channel, message.date, message.guild);
        debug('[SQLite] inserted into message');
    } catch (error) {
        debug('[SQLite] did not insert into message', error);
    }
    try {
        const insert_deleted = db.prepare(`INSERT INTO deleted_message (id, deleted_on) VALUES (?, ?)`);
        insert_deleted.run(message.id, new Date());
        debug('[SQLite] inserted into deleted_message');
    } catch (error) {
        debug('[SQLite] did not insert into deleted_message', error);
        return false;
    }
    return true;
}

/**
 * 
 * @param {number} message_id - the id property of the deleted_message record to retrieve from
 * @returns {LoggedMessage} LoggedMessage object containing the information from the deleted_message record
 */
function getMessageLog(message_id) {
    const select_log = db.prepare(`
    SELECT 
        message.id, message.content, message.date, deleted_message.deleted_on, user.id, user.name, channel.id, channel.name, message.guild
        FROM deleted_message
        WHERE deleted_message.id = @message_id
            LEFT JOIN message
                ON deleted_message.id = @message_id
            LEFT JOIN user
                ON message.author=user.id
            LEFT JOIN channel
                ON message.channel=channel.id
    `);
    const result = select_log.expand().get({message_id: message_id});
    return new LoggedMessage(result.message.content, result.message.id, result.user.id, result.channel.id, result.channel.name, result.user.name, result.message.date, result.message.guild);
}

}

/**
 * 
 */
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