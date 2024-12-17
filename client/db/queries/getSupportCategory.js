const { client, healthy } = require('../db');
const { logger } = require('../../utils/logger');

const SupportCategory = {
    Question: 'Question',
    Request: 'Request',
    Suggestion: 'Suggestion',
    Idea: 'Idea',
    Information: 'Information',
    Feedback: 'Feedback',
    Report: 'Report',
    Other: 'Other'
};

/**
 * 
 * @param {string} category
 * @returns 
 */
function getSupportCategoryID(category) {
    if (!Object.values(SupportCategory).includes(category.toString())) {
        throw new Error(`Invalid support category: ${category}`);
    }
    
    const query = `
        SELECT id
        FROM support_category
        WHERE category_name = $1;
    `;
    const values = [category.toString()];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                logger.error(queryError.stack);
                reject(queryError);
            } else {
                const categoryID = queryResponse.rows.shift().id;
                resolve(categoryID);
            }
        });
    });
}

module.exports = { SupportCategory, getSupportCategoryID };