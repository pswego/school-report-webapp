const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./schools.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            latitude REAL,
            longitude REAL
        )
    `);
});

module.exports = db;
