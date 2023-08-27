const { toNum } = require("../utils/utils");

/**
 * The **LoggedMessage** class is a class that represents a Discord message for logging purposes. 
 * @public
 * 
 * @example
 * ```js
 * // initialize a sample LoggedMessage
 * const message = new LoggedMessage(123456789012345678, 'Hello world.', 000000000000000000, 'discord', 111111111111111111, 'general', 31536000, new Date());
 * ```
 */
class LoggedMessage {

    /**
     * 
     * @param {number} id - the id of the message
     * @param {string} content - the content of the message
     * @param {number} author_id - the id of the author of the original message
     * @param {string?} author_name - the username of the author of the original message
     * @param {number} channel_id - the channel id the message was originally sent to
     * @param {string?} channel_name - the name of the channel the message was originally sent to
     * @param {number?} guild_id - the guild id the message was originally sent to
     * @param {Date?} date - the date the message was created
     * @param {Date?} deleted_on - the date the message was deleted
     * 
     */
    constructor(id, content, author_id, author_name, channel_id, channel_name, guild_id, date, deleted_on) {
        if (!id || !content || !author_id || !channel_id) {
            return null;
        } else {
            this.id = id;
            this.content = content;
            this.author_id = toNum(author_id);
            this.author_name = author_name ?? null;
            this.channel_id = toNum(channel_id);
            this.channel_name = channel_name ?? null;
            this.guild_id = toNum(guild_id) ?? 0;
            this.date = !date ? null : typeof(date) === 'object' ? date : new Date(toNum(date)) ?? null;
            this.deleted_on = !deleted_on ? null : typeof(deleted_on) === 'object' ? deleted_on : new Date(toNum(deleted_on)) ?? null;
        }
    }

    /**
     * @returns {{id, content, author_id, author_name?, channel_id, channel_name?, guild?, date?, deleted_on}} the raw data of the LoggedMessage as an object
     */
    get messageData() {
        return {
            id: this.id,
            content: this.content,
            author_id: this.author_id,
            author_name: this.author_name ?? null,
            channel_id: this.channel_id,
            channel_name: this.channel_name ?? null,
            guild_id: this.guild_id ?? null,
            date: this.date ?? null,
            deleted_on: this.deleted_on ?? null
        }
    }

    /**
     * @returns {string?}
     */
    get message() {
        return this.content ?? null;
    }

    /**
     * 
     * @param {JSON} json 
     * @returns {LoggedMessage?} new LoggedMessage object created from the provided JSON object
     */
    static logFromJson(json) {
        try {
            return new LoggedMessage(json.content, json.id, json.author, json.channel, json.channel_name ?? null, json.author_name ?? null, json.date ?? null, json.guild ?? null);
        } catch (e) {
            return null;
        }
        
    // }
}



exports.LoggedMessage = LoggedMessage;