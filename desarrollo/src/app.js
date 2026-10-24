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

const posts = [
    {
        id: 1,
        title: 'Introducción a Node.js',
        content: 'Node.js es un runtime de JavaScript...',
        author_id: 1,
        published: true
    },
    {
        id: 2,
        title: 'PostgreSQL vs MySQL',
        content: 'Ambas bases de datos tienen ventajas...',
        author_id: 2,
        published: true
    },
    {
        id: 3,
        title: 'Manejo de errores en Express',
        content: 'El manejo apropiado de errores...',
        author_id: 3,
        published: false
    }
];

app.get('/authors', (req, res) => {
    res.json(authors);
});

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.get('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const post = posts.find((post) => post.id === id);

    if (!post) {
        return res.status(404).json({
            message: 'Publicación no encontrada'
        });
    }

    return res.json(post);
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

function emailExists(email, excludedId = null) {
    return authors.some((author) =>
        author.email.toLowerCase() === email &&
        author.id !== excludedId
    );
}

app.get('/authors/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
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
    const validationError = validateAuthor(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { name, email, bio } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    if (emailExists(normalizedEmail)) {
    return res.status(409).json({
        message: 'Ya existe un autor con ese email'
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

app.put('/authors/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
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

    const validationError = validateAuthor(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { name, email, bio } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (emailExists(normalizedEmail, id)) {
        return res.status(409).json({
            message: 'Ya existe un autor con ese email'
        });
    }

    author.name = name.trim();
    author.email = normalizedEmail;
    author.bio = bio === undefined ? null : bio.trim();

    return res.json(author);
});

app.delete('/authors/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const authorIndex = authors.findIndex(
        (author) => author.id === id
    );

    if (authorIndex === -1) {
        return res.status(404).json({
            message: 'Autor no encontrado'
        });
    }

    for (let i = posts.length - 1; i >= 0; i--) {
    if (posts[i].author_id === id) {
        posts.splice(i, 1);
    }
}

    authors.splice(authorIndex, 1);

    return res.status(204).send();
});

app.post('/posts', (req, res) => {
    const validationError = validatePost(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { title, content, author_id, published } = req.body;

    const author = authors.find((author) => author.id === author_id);

    if (!author) {
        return res.status(404).json({
            message: 'Autor no encontrado'
        });
    }

    const newPost = {
        id: Math.max(0, ...posts.map((post) => post.id)) + 1,
        title: title.trim(),
        content: content.trim(),
        author_id,
        published: published === undefined ? false : published
    };

    posts.push(newPost);

    return res.status(201).json(newPost);
});

app.put('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const post = posts.find((post) => post.id === id);

    if (!post) {
        return res.status(404).json({
            message: 'Publicación no encontrada'
        });
    }

    const validationError = validatePost(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const { title, content, author_id, published } = req.body;

    const author = authors.find((author) => author.id === author_id);

    if (!author) {
        return res.status(404).json({
            message: 'Autor no encontrado'
        });
    }

    post.title = title.trim();
    post.content = content.trim();
    post.author_id = author_id;
    post.published = published === undefined ? false : published;

    return res.json(post);
});

app.delete('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({
            message: 'El ID debe ser un número entero positivo'
        });
    }

    const postIndex = posts.findIndex(
        (post) => post.id === id
    );

    if (postIndex === -1) {
        return res.status(404).json({
            message: 'Publicación no encontrada'
        });
    }

    posts.splice(postIndex, 1);

    return res.status(204).send();
});

app.listen(3000, () => {
    console.log('Servidor disponible en http://localhost:3000');
});