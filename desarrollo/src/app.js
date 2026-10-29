const express = require('express');

const pool = require('./db/pool');

const {
    isValidId,
    validateAuthor,
    validatePost
} = require('./utils/validations');

const authorsRoutes = require('./routes/authorsRoutes');

const app = express();

app.use(express.json());

app.use('/authors', authorsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API del Proyecto Integrador funcionando' });
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