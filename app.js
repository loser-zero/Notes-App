const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Подключение к базе данных
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tasks',
    password: '12124181255',
    port: 5432,
});
client.connect();

// Middleware для обслуживания статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для добавления новой заметки
app.post('/add-note', async (req, res) => {
    const { noteText } = req.body;

    if (!noteText) {
        return res.status(400).json({ error: 'Поле ввода пустое' });
    } else {
        try {
            const result = await client.query('INSERT INTO notes (note_text) VALUES ($1) RETURNING *', [noteText]);
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
});

// Маршрут для обновления заметки по ID
app.put('/update-note/:noteId', async (req, res) => {
    const noteId = req.params.noteId;
    const { updatedNoteText } = req.body;
    try {
        const result = await client.query('UPDATE notes SET note_text = $1 WHERE note_id = $2 RETURNING *', [updatedNoteText, noteId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения всех заметок
app.get('/get-notes', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM notes');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для удаления заметки по ID
app.delete('/delete-note/:noteId', async (req, res) => {
    const noteId = req.params.noteId;
    try {
        const result = await client.query('DELETE FROM notes WHERE note_id = $1 RETURNING *', [noteId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});