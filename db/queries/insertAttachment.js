const db = require('../db');

function insertAttachment(messageID, url, contentType, name, description) {
    const query = `INSERT INTO attachments (message_id, url, content_type, name, description) VALUES ($1, $2, $3, $4, $5)`;
    const values = [messageID, url, contentType, name, description];
    return db.query(query, values, (queryError, queryResponse) => {
        if (queryError) {
            console.error(queryError.stack);
            return null;
        }
        console.log(queryResponse.rows);
        return queryResponse.rows;
    });
}

function insertAttachments(attachments, messageID) {
    attachments.forEach((attachment) => {
        insertAttachment(messageID, attachment.url, attachment.contentType, attachment.name, attachment.description);
    });
}

module.exports = {
    insertAttachment,
    insertAttachments
};