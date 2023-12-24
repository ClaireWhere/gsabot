const { LoggedMessage } = require('../../models/LoggedMessage');
const { config } = require('../../config.json');
const { logger } = require('../logger');
const { open, addUser, addChannel, addMessage, addDeleted } = require('./db.js')

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

    addUser(db, message.author_id, message.author_name);
    addChannel(db, message.channel_id, message.channel_name);
    addMessage(db, message.id, message.content, message.author_id, message.channel_id, !message.date ? null : message.date.getTime(), message.guild_id);
    
    const success = addDeleted(db, message.id, new Date().getTime());
    if (!success) {
        logger.info(`[SQLite] unable to log message by ${message.author_name} - already exists in ${config.database.name}`);
    } 
    db.close();
    return success;
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
        logger.error(error);
    }
    db.close();
    return null;
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