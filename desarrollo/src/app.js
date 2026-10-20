const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API del Proyecto Integrador funcionando' });
});

const authors = [
    {
        id: 1,
        name: 'Ana García',
        email: 'ana@example.com',
        bio: 'Desarrolladora full-stack apasionada por Node.js'
    },
    {
        id: 2,
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        bio: 'Escritor técnico especializado en bases de datos'
    },
    {
        id: 3,
        name: 'María López',
        email: 'maria@example.com',
        bio: 'Ingeniera de software con foco en APIs REST'
    }
];

app.get('/authors', (req, res) => {
    res.json(authors);
});

app.get('/authors/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
        message: 'El ID debe ser un número entero positivo'
    });
}

    const author = authors.find((author) => author.id === id);

    if (!author) {
        return res.status(404).json({
            message: 'Autor no encontrado'
        });
    }

    res.json(author);
});

app.post('/authors', (req, res) => {
    const { name, email, bio } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            message: 'El nombre es obligatorio y debe ser texto'
        });
    }

    if (typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({
            message: 'El email es obligatorio y debe ser texto'
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingAuthor = authors.find(
        (author) => author.email.toLowerCase() === normalizedEmail
    );

    if (existingAuthor) {
        return res.status(409).json({
            message: 'Ya existe un autor con ese email'
        });
    }

    if (bio !== undefined && typeof bio !== 'string') {
        return res.status(400).json({
            message: 'La biografía debe ser texto'
        });
    }

    const newAuthor = {
        id: Math.max(0, ...authors.map((author) => author.id)) + 1,
        name: name.trim(),
        email: normalizedEmail,
        bio: bio === undefined ? null : bio.trim()
    };

    authors.push(newAuthor);

    return res.status(201).json(newAuthor);
});

app.listen(3000, () => {
    console.log('Servidor disponible en http://localhost:3000');
});