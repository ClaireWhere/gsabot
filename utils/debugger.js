const { version, name } = require('../package.json');
const { getDate } = require('./utils');
const config = require('../config.json').config.debug;

/**
 * 
 * @param {string} message 
 * @param {Error | null} error 
 */
function debug(message, error) {
    if (!config.enabled) { return; }
    console.log(`[${name}@${version}] ${config.include_datetime ? `[${getDate()}] ` : ''}${message}${Object.hasOwn(error ?? {}, 'message') ? ` : ${error.message}` : ''}`);
}

module.exports = { debug }