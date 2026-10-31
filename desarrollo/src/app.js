const express = require('express');
const authorsRoutes = require('./routes/authorsRoutes');
const postsRoutes = require('./routes/postsRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/authors', authorsRoutes);
app.use('/posts', postsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API del Proyecto Integrador funcionando' });
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log('Servidor disponible en http://localhost:3000');
});