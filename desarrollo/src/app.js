const express = require('express');

const pool = require('./db/pool');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API del Proyecto Integrador funcionando' });
});

app.get('/authors', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
        );

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar autores:', error.message);

        return res.status(500).json({
            message: 'Error al consultar los autores'
        });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, content, author_id, published, created_at
             FROM posts
             ORDER BY id`
        );

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar publicaciones:', error.message);

        return res.status(500).json({
            message: 'Error al consultar las publicaciones'
        });
    }
});

app.get('/posts/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, title, content, author_id, published, created_at
             FROM posts
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Publicación no encontrada'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al consultar publicación:', error.message);

        return res.status(500).json({
            message: 'Error al consultar la publicación'
        });
    }
});

function isValidId(id) {
    return Number.isSafeInteger(id) && id > 0;
}

function validateAuthor(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'Debes enviar un objeto JSON con los datos del autor';
    }

    const { name, email, bio } = data;

    if (typeof name !== 'string' || name.trim() === '') {
        return 'El nombre es obligatorio y debe ser texto';
    }

    if (typeof email !== 'string' || email.trim() === '') {
        return 'El email es obligatorio y debe ser texto';
    }

    if (bio !== undefined && typeof bio !== 'string') {
        return 'La biografía debe ser texto';
    }

    return null;
}

function validatePost(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'Debes enviar un objeto JSON con los datos de la publicación';
    }

    const { title, content, author_id, published } = data;

    if (typeof title !== 'string' || title.trim() === '') {
        return 'El título es obligatorio y debe ser texto';
    }

    if (typeof content !== 'string' || content.trim() === '') {
        return 'El contenido es obligatorio y debe ser texto';
    }

    if (!isValidId(author_id)) {
        return 'El ID del autor debe ser un número entero positivo';
    }

    if (published !== undefined && typeof published !== 'boolean') {
        return 'El estado published debe ser true o false';
    }

    return null;
}

app.get('/authors/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al consultar autor:', error.message);

        return res.status(500).json({
            message: 'Error al consultar el autor'
        });
    }
});

app.put('/authors/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const validationError = validateAuthor(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { name, email, bio } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const result = await pool.query(
            `UPDATE authors
             SET name = $1, email = $2, bio = $3
             WHERE id = $4
             RETURNING id, name, email, bio, created_at`,
            [
                name.trim(),
                normalizedEmail,
                bio === undefined ? null : bio.trim(),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Ya existe un autor con ese email'
            });
        }

        console.error('Error al actualizar autor:', error.message);

        return res.status(500).json({
            message: 'Error al actualizar el autor'
        });
    }
});

app.delete('/authors/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const result = await pool.query(
            'DELETE FROM authors WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar autor:', error.message);

        return res.status(500).json({
            message: 'Error al eliminar el autor'
        });
    }
});

app.post('/authors', async (req, res) => {
    const validationError = validateAuthor(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { name, email, bio } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const result = await pool.query(
            `INSERT INTO authors (name, email, bio)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, bio, created_at`,
            [
                name.trim(),
                normalizedEmail,
                bio === undefined ? null : bio.trim()
            ]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Ya existe un autor con ese email'
            });
        }

        console.error('Error al crear autor:', error.message);

        return res.status(500).json({
            message: 'Error al crear el autor'
        });
    }
});

app.put('/posts/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const validationError = validatePost(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { title, content, author_id, published } = req.body;

    try {
        const result = await pool.query(
            `UPDATE posts
             SET title = $1, content = $2, author_id = $3, published = $4
             WHERE id = $5
             RETURNING id, title, content, author_id, published, created_at`,
            [
                title.trim(),
                content.trim(),
                author_id,
                published === undefined ? false : published,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Publicación no encontrada'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        console.error('Error al actualizar publicación:', error.message);

        return res.status(500).json({
            message: 'Error al actualizar la publicación'
        });
    }
});

app.delete('/posts/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Publicación no encontrada'
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar publicación:', error.message);

        return res.status(500).json({
            message: 'Error al eliminar la publicación'
        });
    }
});

app.post('/posts', async (req, res) => {
    const validationError = validatePost(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { title, content, author_id, published } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO posts (title, content, author_id, published)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, content, author_id, published, created_at`,
            [
                title.trim(),
                content.trim(),
                author_id,
                published === undefined ? false : published
            ]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        console.error('Error al crear publicación:', error.message);

        return res.status(500).json({
            message: 'Error al crear la publicación'
        });
    }
});

app.listen(3000, () => {
    console.log('Servidor disponible en http://localhost:3000');
});