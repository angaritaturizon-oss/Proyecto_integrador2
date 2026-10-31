const express = require('express');
const pool = require('../db/pool');

const {
    isValidId,
    validatePost
} = require('../utils/validations');

const router = express.Router();

// Listar publicaciones
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, title, content, author_id, published, created_at
             FROM posts
             ORDER BY id`
        );

        return res.json(result.rows);
    } catch (error) {
        return next(error);
    }
});

// Consultar una publicación por ID
router.get('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

// Crear una publicación
router.post('/', async (req, res, next) => {
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
        return next(error);
    }
});

// Actualizar una publicación
router.put('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

// Eliminar una publicación
router.delete('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

module.exports = router;