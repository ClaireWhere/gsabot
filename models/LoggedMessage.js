
/**
 * The **LoggedMessage** class is a class that represents a Discord message for logging purposes. 
 * @public
 * 
 * @example
 * ```js
 * // initialize a sample LoggedMessage
 * const message = new LoggedMessage('Hello world.', 123456789012345678, 000000000000000000, 111111111111111111, 'general', 'discord', 31536000);
 * ```
 */
class LoggedMessage {
        
    /**
     * 
     * @param {string} content - the content of the message
     * @param {number} id - the id of the message
     * @param {number} author - the id of the author of the original message
     * @param {number} channel - the channel id the message was originally sent to
     * @param {string?} channel_name - the name of the channel the message was originally sent to
     * @param {string?} author_name - the username of the author of the original message
     * @param {Date?} date - the date the message was created
     * @param {number?} guild - the guild id the message was originally sent to
     * 
     */
    constructor(content, id, author, channel, channel_name, author_name, date, guild) {
        this.content = content;
        this.id = id;
        this.author = toNum(author) ?? 0;
        this.channel = toNum(channel) ?? 0;
        this.channel_name = channel_name ?? null;
        this.author_name = author_name ?? null;
        this.date = date === typeof(Date) ? date : new Date(toNum(date)) ?? null;
        this.guild = toNum(guild);

    }

    get messageData() {
        return {
            content: this.content,
            id: this.id,
            author: this.author,
            channel: this.channel,
            channel_name: this.channel_name ?? null,
            author_name: this.author_name ?? null,
            date: this.date ?? null,
            guild: this.guild ?? null
        }
    }

    get message() {
        return this.content ?? null;
    }

    /**
     * 
     * @param {JSON} json 
     * @returns new LoggedMessage object created from the provided JSON object
     */
    static logFromJson(json) {
        try {
            return new LoggedMessage(json.content, json.id, json.author, json.channel, json.channel_name ?? null, json.author_name ?? null, json.date ?? null, json.guild ?? null);
        } catch (e) {
            return null;
        }
        
    }
}

/**
 * 
 * @param {string|number} str 
 * @returns integer representation of `str`. null if invalid
 */
function toNum(str) {
    if (!IsNumeric(str)) {
        return null;
    }
    if (typeof(str) === typeof(0)) { 
        return str;
    }
    // const valid = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // return str === undefined || str === null ? null : !str.match('^[0-9]*$') ? null : parseInt(str, 10);
    // !str.split('').every(e => valid.includes(e)) ;
    // if (str === undefined || str === null || !str.split('').every(e => valid.includes(e))) {
    //     return null;
    // }
    return parseInt(str, 10);
}

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

exports.LoggedMessage = LoggedMessage;