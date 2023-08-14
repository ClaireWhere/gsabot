const { LoggedMessage } = require('../models/LoggedMessage');
const { MongoClient, ServerApiVersion, Db } = require("mongodb");

const url = '127.0.0.1';
const port = '27017';
const db = 'gsabot';
const uri = `mongodb://${url}:${port}/${db}`;
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
const collection = `logs`;

async function run(cb, ...args) {
    try {
        await client.connect();
        console.log(`connection formed with ${uri}`);
        return await cb(client.db(), args);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log(`connection with ${uri} successfully closed`);
    }
}

/**
 * 
 * @param {LoggedMessage} messageData 
 * @returns 
 */
async function insertMessageLog(messageData) {
    return await run(insert, messageData);
};

/**
 * 
 * @param {number} id 
 * @returns LoggedMessage object with the provided id
 */
async function findMessageLog(id) {
    return await run(find, id);
}

/**
 * 
 * @param {Db} db 
 * @param {LoggedMessage} messageData 
 * @returns 
 */
async function insert(db, messageData) {
    return db.collection(collection).insertOne(messageData[0].messageData)
        .then(() => {
            console.log(`inserted into ${collection}`);
            return true;
        }).catch(err => {
            console.error(err);
            return false;
        });

}

/**
 * 
 * @param {Db} db 
 * @param {number} id 
 * @returns LoggedMessage object with the provided id
 */
async function find(db, id) {
    return await db.collection(collection).findOne({id: id[0]})
        .then((data) => {
            if (isEmpty(data)) {
                console.log(`no data found in ${collection} for ${id}`);
                return null;
            }
            console.log(`retrieved ${id} from ${collection}`);
            return LoggedMessage.logFromJson(data);
        }).catch((err) => {
            console.error(err);
            return null;
        });
}

/**
 * Filters out some invalid message id's. Does not accurately verify message id's as true all of the time.
 * 
 * @param {string} id
 * @returns boolean - false if the provided id is not a valid message id, true if the message is *likely* valid.
 */
function verifyMessageId(id) {
    return (id.match('^[0-9]*$') && id.length >= 17) ?? false;
}

function isEmpty(obj) {
    if (obj === undefined) { return true; }
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}



module.exports = { insertMessageLog, findMessageLog, verifyMessageId }