const express = require('express');
const getMessage = require('./db/queries/getMessage');
const { getEdits } = require('./db/queries/getMessageEdit');
const { getDeletedMessage } = require('./db/queries/getDeletedMessage');
const { logger } = require('./utils/logger');

const DEFAULT_PORT = 8080;
const PORT = DEFAULT_PORT;

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the gsabot API!');
});

app.get('/deleted/*/raw', (req, res) => {
    const id = req.query.id;
    const m = getDeletedMessage(id);
    logger.info(`[RESPONSE] ${m ? `retrieved deleted_message data for ${id}` : `no record found in deleted_message for ${id}`}`);
    
    if (!m) {
        res.send(`no log found for ${id}.`);
        return;
    }

    const {
        most_recent_content: mostRecentContent,
    } = m;

    res.send(mostRecentContent);
});

app.get('/deleted/*', (req, res) => {
    const id = req.query.id;
    const m = getDeletedMessage(id);
    logger.info(`[RESPONSE] ${m ? `retrieved deleted_message data for ${id}` : `no record found in deleted_message for ${id}`}`);
    
    if (!m) {
        res.send(`no log found for ${id}.`);
        return;
    }

    const {
        most_recent_content: mostRecentContent,
        most_recent_edit_at: mostRecentEditAt,
        deleted_at: deletedAt,
        created_at: createdAt,
        author_id: authorId,
        author_nickname: authorNickname,
        author_name: authorName,
        author_display_name: authorDisplayName,
        author_avatar: authorAvatar,
        channel_name: channelName,
        guild_name: guildName
    } = m;

    const responseString = `
        most_recent_content: ${mostRecentContent}
        most_recent_edit_at: ${mostRecentEditAt}
        deleted_at: ${deletedAt}
        created_at: ${createdAt}
        author_id: ${authorId}
        author_nickname: ${authorNickname}
        author_name: ${authorName}
        author_display_name: ${authorDisplayName}
        author_avatar: ${authorAvatar}
        channel_name: ${channelName}
        guild_name: ${guildName}
    `;
    res.send(responseString);
});

app.get('/message/*/raw', (req, res) => {
    const id = req.query.id;
    const m = getMessage(id);
    logger.info(`[RESPONSE] ${m ? `retrieved message data for ${id}` : `no record found in message for ${id}`}`);
    
    if (!m) {
        res.send(`no log found for ${id}.`);
        return;
    }

    const {
        content,
    } = m;

    res.send(content);
});

app.get('/message/*', (req, res) => {
    const id = req.query.id;
    const m = getMessage(id);
    logger.info(`[RESPONSE] ${m ? `retrieved message data for ${id}` : `no record found in message for ${id}`}`);

    if (!m) {
        res.send(`no log found for ${id}.`);
        return;
    }

    const {
        content,
        created_at: createdAt,
        author_id: authorId,
        author_nickname: authorNickname,
        author_name: authorName,
        author_display_name: authorDisplayName,
        author_avatar: authorAvatar,
        channel_name: channelName,
        guild_name: guildName
    } = m;

    const responseString = `
        content: ${content}
        created_at: ${createdAt}
        author_id: ${authorId}
        author_nickname: ${authorNickname}
        author_name: ${authorName}
        author_display_name: ${authorDisplayName}
        author_avatar: ${authorAvatar}
        channel_name: ${channelName}
        guild_name: ${guildName}
    `;
    res.send(responseString);
});

app.get('/message/*/edit', (req, res) => {
    const id = req.query.id;
    const m = getEdits(id);
    logger.info(`[RESPONSE] ${m ? `retrieved message_edit data for ${id}` : `no record found in message_edit for ${id}`}`);

    if (!m) {
        res.send(`no log found for ${id}.`);
        return;
    }

    const responseMessage = [];
    m.array.forEach(element => {
        const {
            content,
            edited_at: editedAt,
            original_content: originalContent,
            attachment,
            created_at: createdAt,
            author_nickname: authorNickname,
            author_name: authorName,
            author_display_name: authorDisplayName,
            author_avatar: authorAvatar,
            channel_name: channelName,
            guild_name: guildName
        } = element;

        responseMessage.push(`
            content: ${content}
            edited_at: ${editedAt}
            original_content: ${originalContent}
            attachment: ${attachment}
            created_at: ${createdAt}
            author_nickname: ${authorNickname}
            author_name: ${authorName}
            author_display_name: ${authorDisplayName}
            author_avatar: ${authorAvatar}
            channel_name: ${channelName}
            guild_name: ${guildName}
        `);
    });

    res.send(responseMessage.join('\n'));
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});

process.send('ready');