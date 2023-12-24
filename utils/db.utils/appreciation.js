const serverConfig = ({ config } = require('../../config.json')).config;
const { logger } = require('../logger');
const { open, addUser, addAppreciation } = require('./db.js')

function checkAppreciation() {
    const today = formatDate(new Date());
    const appreciationToday = retrieveAppreciationDay(today);

    console.log(appreciationToday)
    if (appreciationToday) {
        return true;
    }
    return false;
}

function retrieveAppreciationDay(day) {
    const db = open({
        timeout: 2000,
        fileMustExist: true
    });

    let result;
    try {
        const sql = `
            SELECT day 
                FROM appreciation
                WHERE day = ?
        `;
        result = db.prepare(sql).get(day);
    } catch (error) {
        logger.warn(`[SQLite] ran into an error retrieving data from the 'appreciation' table (${error})`);
    } finally {
        db.close();
        return result;
    }
}

function startAppreciation(user_id, user_name, initiator_id, initiator_name, guild_id) {
    const db = open({
        timeout: 2000,
        fileMustExist: true
    });

    if (!db) { return true; }
    
    const dateNow = new Date()
    const today = formatDate(dateNow);
    const time = formatTime(dateNow);
    
    addUser(db, user_id, user_name);
    addUser(db, initiator_id, initiator_name);
    
    const success = addAppreciation(db, today, time, user_id, initiator_id, guild_id);
    logger.info(`1`)
    db.close();
    logger.info('2')
    if (!success) {
        logger.info(`[SQLite] ${initiator_name} was unable to start appreciation day for ${user_name} - an appreciation day already exists for ${today} in ${serverConfig.database.name}`);
    }
    logger.info(`[SQLite] ${initiator_name} started appreciation day for ${user_name} on ${today} at ${time} - success: ${success}`)
    return success;
}

function removeAppreciation(day) {
    const db = open({
        timeout: 2000,
        fileMustExist: true
    });

    try {
        const sql = `
            DELETE FROM appreciation
                WHERE day = ?;
        `;
        db.prepare(sql).run(day)
    } catch (error) {
        logger.warn(`[SQLite] ran into an error deleting row from the 'appreciation' table (${error})`);
    } finally {
        db.close();
    }
}

module.exports = { startAppreciation, checkAppreciation }

/**
 * 
 * @param {Date} date 
 */
function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
/**
 * 
 * @param {Date} date
 * @returns {}
 */
function formatTime(date) {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

// addAppreciation(1, "test_user", 2, "test_user_2", 0)
// console.log(checkAppreciation());

// const today = formatDate(new Date());
// removeAppreciation(today)