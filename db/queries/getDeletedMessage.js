const db = require('../db');

function getDeletedMessage(id) {
    const query = `
        SELECT 
            COALESCE(most_recent_edit.content, message.content) AS most_recent_content,
            most_recent_edit.edited_at AS most_recent_edit_at,
            deleted_message.deleted_at AS deleted_at,
            message.created_at AS created_at,
            message.user_id AS author_id,
            guild_user.nickname AS author_nickname,
            user.username AS author_name,
            user.display_name AS author_display_name,
            user.avatar AS author_avatar,
            channel.name AS channel_name,
            message.attachment AS attachment,
            guild.name AS guild_name,
        FROM deleted_message
        LEFT JOIN (
            SELECT message_edit.id, message_edit.message_id
            FROM message_edit
            WHERE message_edit.message_id = (SELECT message_id FROM deleted_message WHERE id = $1)
            ORDER BY message_edit.edited_at DESC
            LIMIT 1
        ) AS most_recent_edit ON deleted_message.message_id = most_recent_edit.message_id
        LEFT JOIN message ON deleted_message.message_id = message.id
        LEFT JOIN channel ON message.channel_id = channel.id
        LEFT JOIN guild_user ON message.guild_user_id = guild_user.id
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE deleted_message.id = $1
    `;
    const values = [id];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

function getOriginalDeletedMessage(id) {
    const query = `
        SELECT 
            message.content AS original_content,
            deleted_message.deleted_at AS deleted_at,
            message.created_at AS created_at,
            message.user_id AS author_id,
            guild_user.nickname AS author_nickname,
            user.username AS author_name,
            user.display_name AS author_display_name,
            user.avatar AS author_avatar,
            channel.name AS channel_name,
            message.attachment AS attachment,
            guild.name AS guild_name,
        FROM deleted_message
        LEFT JOIN message ON deleted_message.message_id = message.id
        LEFT JOIN channel ON message.channel_id = channel.id
        LEFT JOIN guild_user ON message.guild_user_id = guild_user.id
        LEFT JOIN user ON guild_user.user_id = user.id
        LEFT JOIN guild ON guild_user.guild_id = guild.id
        WHERE deleted_message.id = $1
    `;
    const values = [id];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        return queryResponse.rows;
    });
}

module.exports = {
    getDeletedMessage,
    getOriginalDeletedMessage
};