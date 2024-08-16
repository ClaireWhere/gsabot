const { LoggedMessage } = require('../../models/LoggedMessage');
const { config } = require('../../config.json');
const { logger } = require('../logger');

const ID_LENGTH = 17;

/**
 * Filters out some invalid message id's. Does not accurately verify message id's as true all of the time.
 * 
 * @param {string} id
 * @returns boolean - false if the provided id is not a valid message id, true if the message is *likely* valid.
 */
function verifyMessageId(id) {
    return (id.match('^[0-9]*$') && id.length >= ID_LENGTH) ?? false;
}

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

/**
 * 
 * @param {LoggedMessage} message 
 * @returns {boolean} - true if the message was successfully inserted into the database, false if the message already exists in the database.
 */
function insertMessageLog(message) {
    if (!message) { return false; }
    const db = open({
        timeout: 2000,
        fileMustExist: true
    });

    if (!db) { return true; }

    try {
        const insertUser = db.prepare('INSERT INTO user (id, name) VALUES (?, ?)');
        insertUser.run(message.author_id, message.author_name);
        logger.info('[SQLite] inserted into user');
    } catch (error) {
        logger.debug(`[SQLite] did not insert (${message.author_name}) into user: ${error}`);
    }
    try {
        const insertChannel = db.prepare(`INSERT INTO channel (id, name) VALUES (?, ?)`);
        insertChannel.run(message.channel_id, message.channel_name);
        logger.info('[SQLite] inserted into channel');
    } catch (error) {
        logger.debug(`[SQLite] did not insert (${message.channel_name}) into channel: ${error}`);
    }
    try {
        const insertMessage = db.prepare(`INSERT INTO message (id, content, author, channel, date, guild) VALUES (?, ?, ?, ?, ?, ?)`);
        insertMessage.run(message.id, message.content, message.author_id, message.channel_id, message.date ? message.date.getTime() : null, message.guild_id);
        logger.info('[SQLite] inserted into message');
    } catch (error) {
        logger.warn(`[SQLite] did not insert message by ${message.author_name} - already exists in ${config.database.name}`);
    }
    try {
        const insertDeleted = db.prepare(`INSERT INTO deleted_message (message_id, deleted_on) VALUES (?, ?)`);
        insertDeleted.run(message.id, new Date().getTime());
        logger.info('[SQLite] inserted into deleted_message');
    } catch (error) {
        logger.warn(`[SQLite] did not insert into deleted_message (${error})`);
        db.close();
        logger.warn(`[SQLite] failed to log message by ${message.author_name} - already exists in ${config.database.name}`);
        return false;
    }
    db.close();
    return true;
}

/**
 * 
 * @param {number} messageID - the id property of the deleted_message record to retrieve from
 * @returns {LoggedMessage | null} LoggedMessage object containing the information from the deleted_message record
 */
function getMessageLog(messageID) {
    if (!verifyMessageId(messageID)) { return null; }

    const db = open({
        timeout: 2000,
        fileMustExist: true,
        readonly: true
    });

    if (!db) { return false; }
    
    try {
        const selectLog = db.prepare(`
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
        const result = selectLog.expand().get({message_id: messageID});
        db.close();
        return new LoggedMessage(result.message.id, result.message.content, result.user.id, result.user.name, result.channel.id, result.channel.name, result.message.guild, result.message.date, result.deleted_message.deleted_on);
    } catch (error) {
        logger.error(error);
    }
    db.close();
    return null;
}





module.exports = { insertMessageLog, getMessageLog, verifyMessageId }

