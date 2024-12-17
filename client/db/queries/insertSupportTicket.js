const { client, healthy } = require('../db');
const { logger } = require('../../utils/logger');

/**
 * 
 * @param {string} guildUserID 
 * @param {string} categoryID
 * @param {string} content
 * @param {boolean} isAnonymous
 * @param {boolean} isResponseRequired
 * 
 * @returns {Promise<string>} The UUID of the inserted support ticket
 */
function insertSupportTicket(guildUserID, categoryID) {
    const query = `
        INSERT INTO support_ticket
            (guild_user_id, category_id)
        VALUES
            ($1, $2)
        RETURNING ticket_id;
    `;
    const values = [guildUserID, categoryID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                logger.error(queryError.stack);
                reject(queryError);
            } else {
                const insertID = queryResponse.rows.shift().ticket_id;
                resolve(insertID);
            }
        });
    });
}

/**
 * 
 * @param {string} ticketID 
 * @param {string} content 
 * @param {boolean} isAnonymous 
 * @param {boolean} isResponseRequired 
 * @returns {Promise<void>}
 */
function updateSupportTicket(ticketID, content, isAnonymous, isResponseRequired) {
    const query = `
        UPDATE support_ticket
        SET
            content = $1,
            is_anonymous = $2,
            is_response_required = $3
        WHERE ticket_id = $4
    `;
    const values = [content, isAnonymous, isResponseRequired, ticketID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError) => {
            if (queryError) {
                logger.error(queryError.stack);
                reject(queryError);
            } else {
                logger.info(`Support ticket with ID ${ticketID} updated`);
                resolve();
            }
        });
    });
}

/**
 * 
 * @param {string} ticketID 
 * @returns {Promise<{guild_user_id: string, category_name: string, content: string, is_anonymous: boolean, is_response_required: boolean, ticket_status: string, created_at: string, closed_at: string}>}
 */
function getSupportTicket(ticketID) {
    const query = `
        SELECT
            guild_user_id,
            category_name,
            content,
            is_anonymous,
            is_response_required,
            ticket_status,
            created_at,
            closed_at
        FROM support_ticket
        JOIN support_category
            ON support_ticket.category_id = support_category.category_id
        WHERE ticket_id = $1;
    `;
    const values = [ticketID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                logger.error(queryError.stack);
                reject(queryError);
            } else {
                resolve(queryResponse.rows.shift());
            }
        });
    });
}

module.exports = {insertSupportTicket, updateSupportTicket, getSupportTicket};