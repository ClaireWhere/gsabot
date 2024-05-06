const db = require('../db');

function getMessageEdit(editID) {
    const query = `
        SELECT 
            message_edit.message_id AS message_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.attachment AS attachment
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_name,
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
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

function getMostRecentEdit(messageID) {
    const query = `
        SELECT 
            message_edit.id AS edit_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.attachment AS attachment
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_name,
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
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

function getEdits(messageID) {
    const query = `
        SELECT 
            message_edit.id AS edit_id,
            message_edit.content AS content,
            message_edit.edited_at AS edited_at,
            message.content AS original_content,
            message.attachment AS attachment
            message.created_at AS created_at,
            guild_user.nickname AS author_nickname,
            user.username AS author_name,
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
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

module.exports = {
    getMessageEdit,
    getMostRecentEdit,
    getEdits
};