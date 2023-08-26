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
} catch (error) {
    console.error(error.message);
}

db.close();


// const create_tables = `
// CREATE TABLE channel(
//     id INTEGER PRIMARY KEY NOT NULL,
//     name TEXT
// );
// CREATE TABLE user(
//     id INTEGER PRIMARY KEY NOT NULL,
//     name TEXT
// );
// CREATE TABLE message(
//     id INTEGER PRIMARY KEY NOT NULL,
//     content TEXT NOT NULL,
//     author INTEGER NOT NULL,
//     channel INTEGER NOT NULL,
//     date DATETIME,
//     guild INTEGER,
//     FOREIGN KEY(author) REFERENCES user(id),
//     FOREIGN KEY(channel) REFERENCES channel(id)
// );
// CREATE TABLE deleted_message(
//     message_id INTEGER PRIMARY KEY NOT NULL,
//     deleted_on DATETIME,
//     FOREIGN KEY(message_id) REFERENCES message(id)
// );
// `;

// db.exec(create_tables);

// db.exec(create_tables, (err, res) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log(`Successfully created tables in the ${config.database.name} database`);
// });


// db.close((err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log(`Closed the database connection with ${config.database.name}.`);
//   });