const express = require('express');
const pool = require('../db/pool');

const {
    isValidId,
    validateAuthor
} = require('../utils/validations');

const router = express.Router();

// Listar autores
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
        );

        return res.json(result.rows);
    } catch (error) {
        return next(error);
    }
});

// Consultar un autor por ID
router.get('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

// Crear un autor
router.post('/', async (req, res, next) => {
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
        return next(error);
    }
});

// Actualizar un autor
router.put('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

// Eliminar un autor
router.delete('/:id', async (req, res, next) => {
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
        return next(error);
    }
});

module.exports = router;