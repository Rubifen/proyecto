const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            prompt_used TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creando la tabla games', err.message);
            } else {
                console.log('Tabla games lista.');
            }
        });
    }
});

module.exports = db;
