const { config } = require('../../config.json');

const db = require('better-sqlite3')(`${config.database.name}.db`, {
    timeout: 2000
});
db.pragma('journal_mode = WAL');

try {
    db.prepare(`
        CREATE TABLE channel(
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT
        )
    `).run();
    console.log('[SQLite] channel table created');
} catch (error) {
    console.error(error.message);
}
try {
    db.prepare(`
        CREATE TABLE user(
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT
        )
    `).run();
    console.log('[SQLite] user table created');
} catch (error) {
    console.error(error.message);
}
try {
    db.prepare(`
        CREATE TABLE message(
            id INTEGER PRIMARY KEY NOT NULL,
            content TEXT NOT NULL,
            author INTEGER NOT NULL,
            channel INTEGER NOT NULL,
            date DATETIME,
            guild INTEGER,
            FOREIGN KEY(author) REFERENCES user(id),
            FOREIGN KEY(channel) REFERENCES channel(id)
        )
    `).run();
    console.log('[SQLite] message table created');
} catch (error) {
    console.error(error.message);
}
try {
    db.prepare(`
        CREATE TABLE deleted_message(
            message_id INTEGER PRIMARY KEY NOT NULL,
            deleted_on DATETIME,
            FOREIGN KEY(message_id) REFERENCES message(id)
        )
    `).run();
    console.log('[SQLite] deleted_message table created');
} catch (error) {
    console.error(error.message);
}

db.close();