const { client, healthy } = require('../db');

/**
 * Retrieves a message edit with the specified ID
 * 
 * @param {number} editID - The ID of the message edit to retrieve
 * @returns {Promise<{
 *      message_id: number,
 *      content: string,
 *      edited_at: Date,
 *      original_content: string,
 *      created_at: Date,
 *      author_nickname: string | null,
 *      author_username: string,
 *      author_display_name: string | null,
 *      author_avatar: string,
 *      channel_name: string,
 *      guild_name: string
 * }>} - The message edit with the specified ID
 */
function getMessageEdit(editID) {
    const query = `
        SELECT 
            message_edit.message_id AS message_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_username,
            user.display_name AS author_display_name,
            user.avatar AS author_avatar,
            channel.name AS channel_name,
            guild.name AS guild_name,
        FROM message_edit
        LEFT JOIN message ON message_edit.message_id = message.id
        LEFT JOIN channel ON message.channel_id = channel.id
        LEFT JOIN guild_user ON message.guild_user_id = guild_user.id
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE message_edit.id = $1
    `
    const values = [editID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows);
            }
        });
    });
}

/**
 * Retrieves the most recent edit of a message. This is effectively the most current state of the message.
 * 
 * @param {string} messageID - The ID of the message to retrieve the most recent edit of 
 * @returns {Promise<{
 *      edit_id: number,
 *      content: string,
 *      edited_at: Date,
 *      original_content: string,
 *      created_at: Date,
 *      author_nickname: string | null,
 *      author_username: string,
 *      author_display_name: string | null,
 *      author_avatar: string,
 *      channel_name: string,
 *      guild_name: string
 * }>} - The most recent edit and content of the message. If there are no edits, this will be the original message content.
 */
function getMostRecentEdit(messageID) {
    const query = `
        SELECT 
            message_edit.id AS edit_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_username,
            user.display_name AS author_display_name,
            user.avatar AS author_avatar,
            channel.name AS channel_name,
            guild.name AS guild_name,
        FROM message_edit
        LEFT JOIN message ON message_edit.message_id = message.id
        LEFT JOIN channel ON message.channel_id = channel.id
        LEFT JOIN guild_user ON message.guild_user_id = guild_user.id
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE message_edit.message_id = $1
        ORDER BY message_edit.edited_at DESC
        LIMIT 1
    `;
    const values = [messageID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows);
            }
        });
    });
}

/**
 * Retrieves all edits of a message, ordered by most recent edit first.
 * 
 * @param {string} messageID 
 * @returns {Promise<{
 *      edit_id: number,
 *      content: string,
 *      edited_at: Date,
 *      original_content: string,
 *      created_at: Date,
 *      author_nickname: string | null,
 *      author_username: string,
 *      author_display_name: string | null,
 *      author_avatar: string,
 *      channel_name: string,
 *      guild_name: string
 * }[]>} - All edits of the message, ordered by most recent edit first
 */
function getEdits(messageID) {
    const query = `
        SELECT 
            message_edit.id AS edit_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_username,
            user.display_name AS author_display_name,
            user.avatar AS author_avatar,
            channel.name AS channel_name,
            guild.name AS guild_name,
        FROM message_edit
        LEFT JOIN message ON message_edit.message_id = message.id
        LEFT JOIN channel ON message.channel_id = channel.id
        LEFT JOIN guild_user ON message.guild_user_id = guild_user.id
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE message_edit.message_id = $1
        ORDER BY message_edit.edited_at DESC
    `;
    const values = [messageID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows);
            }
        });
    });
}

module.exports = {
    getMessageEdit,
    getMostRecentEdit,
    getEdits
};