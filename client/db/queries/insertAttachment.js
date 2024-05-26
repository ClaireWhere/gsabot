const { client, healthy } = require('../db');

/**
 * 
 * @param {string} messageID 
 * @param {string} url 
 * @param {string} contentType 
 * @param {string} name 
 * @param {string} description 
 * @returns {Promise<number>} The ID of the inserted attachment
 */
function insertAttachment(messageID, url, contentType, name, description) {
    const query = `
        INSERT INTO attachments (message_id, url, content_type, name, description) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;
    const values = [messageID, url, contentType, name, description];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                console.error(queryError.stack);
                reject(queryError);
            } else {
                const insertID = queryResponse.rows.shift().id;
                console.log(`Attachment inserted with ID: ${insertID}`);
                resolve(insertID);
            }
        });
    });
}

/**
 * 
 * @param {[{url: string, contentType: string, name: string, description: string}]} attachments
 * @param {string} messageID The ID of the message to attach the attachments to
 * @returns {Promise<number[]>} The IDs of the inserted attachments
 */
async function insertAttachments(attachments, messageID) {
    const attachmentIDs = [];
    for (const attachment of attachments) {
        attachmentIDs.push(await insertAttachment(messageID, attachment.url, attachment.contentType, attachment.name, attachment.description));
    }
    return attachmentIDs;
}

module.exports = {
    insertAttachment,
    insertAttachments
};