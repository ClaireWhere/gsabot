const { LoggedMessage } = require('../models/LoggedMessage');
const { config } = require('../config.json');

const db = require('better-sqlite3')(`${config.database.name}.db`, {
    timeout: 2000
});
db.pragma('journal_mode = WAL');

/**
 * 
 * @param {LoggedMessage} message 
 * @returns 
 */
function insertLog(message) {
    try {
        const insert_user = db.prepare('INSERT INTO user (id, name) VALUES (?, ?)');
        insert_user.run(message.author, message.author_name);
    } catch (error) {
        console.log('did not insert into user');
    }
    try {
        const insert_channel = db.prepare(`INSERT INTO channel (id, name) VALUES (?, ?)`);
        insert_channel.run(message.channel, message.channel_name);
    } catch (error) {
        console.log('did not insert into channel');
    }
    try {
        const insert_message = db.prepare(`INSERT INTO message (id, content, author, channel, date, guild) VALUES (?, ?, ?, ?, ?, ?)`);
        insert_message.run(message.id, message.content, message.author, message.channel, message.date, message.guild);
    } catch (error) {
        console.log('did not insert into message');
    }
    try {
        const insert_deleted = db.prepare(`INSERT INTO deleted_message (id, deleted_on) VALUES (?, ?)`);
        insert_deleted.run(message.id, new Date());
    } catch (error) {
        console.error(error.message);
        return false;
    }
    return true;
}

/**
 * 
 * @param {number} message_id - the id property of the deleted_message record to retrieve from
 * @returns {LoggedMessage} LoggedMessage object containing the information from the deleted_message record
 */
function getLog(message_id) {
    const select_log = db.prepare(`
    SELECT 
        message.id, message.content, message.date, deleted_message.deleted_on, user.id, user.name, channel.id, channel.name, message.guild
        FROM deleted_message
        WHERE deleted_message.id = @message_id
            LEFT JOIN message
                ON deleted_message.id = @message_id
            LEFT JOIN user
                ON message.author=user.id
            LEFT JOIN channel
                ON message.channel=channel.id
    `);
    const result = select_log.expand().get({message_id: message_id});
    return new LoggedMessage(result.message.content, result.message.id, result.user.id, result.channel.id, result.channel.name, result.user.name, result.message.date, result.message.guild);
}

/**
 * 
 * @param {*} table - the table to select from
 * @param {*} query - the SQL query
 * @param {*} property - the property to search for
 * @returns the value of the property found in the query. 
 * @returns undefined if property is null
 */
function select(query, property) {
    if (!property) { return undefined; }
    return select(query).get(property);
}

/**
 * 
 * @param {*} table - the table to select from
 * @param {*} query - the SQL query
 * @returns the element found from the query.
 */
function select(query) {
    return db.prepare(query);
}

module.exports = { insertLog, getLog }

// async function run(cb, ...args) {
//     try {
//         await client.connect();
//         console.log(`connection formed with ${uri}`);
//         return await cb(client.db(), args);
//     } catch (err) {
//         console.error(err);
//     } finally {
//         await client.close();
//         console.log(`connection with ${uri} successfully closed`);
//     }
// }

// /**
//  * 
//  * @param {LoggedMessage} messageData 
//  * @returns 
//  */
// async function insertMessageLog(messageData) {
//     return await run(insert, messageData);
// };

// /**
//  * 
//  * @param {number} id 
//  * @returns LoggedMessage object with the provided id
//  */
// async function findMessageLog(id) {
//     return await run(find, id);
// }

// /**
//  * 
//  * @param {Db} db 
//  * @param {LoggedMessage} messageData 
//  * @returns 
//  */
// async function insert(db, messageData) {
//     return db.collection(collection).insertOne(messageData[0].messageData)
//         .then(() => {
//             console.log(`inserted into ${collection}`);
//             return true;
//         }).catch(err => {
//             console.error(err);
//             return false;
//         });

// }

// /**
//  * 
//  * @param {Db} db 
//  * @param {number} id 
//  * @returns LoggedMessage object with the provided id
//  */
// async function find(db, id) {
//     return await db.collection(collection).findOne({id: id[0]})
//         .then((data) => {
//             if (isEmpty(data)) {
//                 console.log(`no data found in ${collection} for ${id}`);
//                 return null;
//             }
//             console.log(`retrieved ${id} from ${collection}`);
//             return LoggedMessage.logFromJson(data);
//         }).catch((err) => {
//             console.error(err);
//             return null;
//         });
// }

// /**
//  * Filters out some invalid message id's. Does not accurately verify message id's as true all of the time.
//  * 
//  * @param {string} id
//  * @returns boolean - false if the provided id is not a valid message id, true if the message is *likely* valid.
//  */
// function verifyMessageId(id) {
//     return (id.match('^[0-9]*$') && id.length >= 17) ?? false;
// }

// function isEmpty(obj) {
//     if (obj === undefined) { return true; }
//     for(var prop in obj) {
//         if(obj.hasOwnProperty(prop))
//             return false;
//     }
//     return true;
// }



// module.exports = { insertMessageLog, findMessageLog, verifyMessageId }