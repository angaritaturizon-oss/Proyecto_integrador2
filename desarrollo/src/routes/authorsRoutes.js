const express = require('express');
const pool = require('../db/pool');

const {
    isValidId,
    validateAuthor
} = require('../utils/validations');

const router = express.Router();

router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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

module.exports = router;