const express = require('express');
const authorsService = require('../services/authorsService');

const {
    isValidId,
    validateAuthor
} = require('../utils/validations');

const router = express.Router();

// Listar autores
router.get('/', async (req, res, next) => {
    try {
        const authors = await authorsService.getAllAuthors();

        return res.json(authors);
    } catch (error) {
        return next(error);
    }
});

// Consultar un autor
router.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const author = await authorsService.getAuthorById(id);

        if (!author) {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        return res.json(author);
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

    try {
        const author = await authorsService.createAuthor(req.body);

        return res.status(201).json(author);
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

    try {
        const author = await authorsService.updateAuthor(id, req.body);

        if (!author) {
            return res.status(404).json({
                message: 'Autor no encontrado'
            });
        }

        return res.json(author);
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
        const author = await authorsService.deleteAuthor(id);

        if (!author) {
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