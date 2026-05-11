const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const fs = require('fs');

// GET /api/games
app.get('/api/games', (req, res) => {
    db.all('SELECT * FROM games ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ games: rows });
    });
});

// POST /api/games (Stub)
app.post('/api/games', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const filename = `game_${Date.now()}.html`;
    const filepath = path.join(__dirname, '../public/games', filename);
    const fakeHtml = `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>Hola Mundo: ${title}</h1></body></html>`;

    fs.writeFile(filepath, fakeHtml, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating game file' });
        }

        const prompt_used = 'Stub prompt';
        db.run('INSERT INTO games (title, filename, prompt_used) VALUES (?, ?, ?)', [title, filename, prompt_used], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving to database' });
            }
            res.json({
                message: 'Game created successfully',
                game: {
                    id: this.lastID,
                    title,
                    filename,
                    prompt_used
                }
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
