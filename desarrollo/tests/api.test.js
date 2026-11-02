require('dotenv').config();

const testDatabase = process.env.DB_TEST_NAME;

if (testDatabase !== 'proyecto_integrador2_test') {
    throw new Error('Debes configurar DB_TEST_NAME=proyecto_integrador2_test');
}

// Elegimos la base de pruebas antes de importar app y pool.
process.env.DB_NAME = testDatabase;

const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const request = require('supertest');

const app = require('../src/app');
const pool = require('../src/db/pool');

const createdAuthorIds = [];

before(async () => {
    const result = await pool.query('SELECT current_database() AS name');

    assert.equal(result.rows[0].name, testDatabase);
});

// Cada prueba crea sus propios autores.
async function createTestAuthor() {
    const response = await request(app)
        .post('/authors')
        .send({
            name: 'Autor de prueba',
            email: `test-${randomUUID()}@example.com`,
            bio: 'Registro creado por un test'
        });

    if (response.status === 201) {
        createdAuthorIds.push(response.body.id);
    }

    assert.equal(response.status, 201);

    return response.body;
}

// Eliminamos solamente los registros creados por las pruebas.
// ON DELETE CASCADE elimina sus publicaciones.
afterEach(async () => {
    for (const id of createdAuthorIds) {
        await pool.query('DELETE FROM authors WHERE id = $1', [id]);
    }

    createdAuthorIds.length = 0;
});

after(async () => {
    await pool.end();
});

test('Crear author devuelve 201 y guarda sus datos', async () => {
    const author = await createTestAuthor();

    assert.ok(Number.isInteger(author.id));
    assert.equal(author.name, 'Autor de prueba');
    assert.ok(author.created_at);

    const result = await pool.query(
        'SELECT email FROM authors WHERE id = $1',
        [author.id]
    );

    assert.equal(result.rows[0].email, author.email);
});

test('Obtener author devuelve el autor solicitado', async () => {
    const author = await createTestAuthor();

    const response = await request(app)
        .get(`/authors/${author.id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, author.id);
    assert.equal(response.body.email, author.email);
});

test('Crear post devuelve 201 y lo relaciona con su autor', async () => {
    const author = await createTestAuthor();

    const response = await request(app)
        .post('/posts')
        .send({
            title: 'Publicación de prueba',
            content: 'Contenido creado por un test.',
            author_id: author.id,
            published: false
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.author_id, author.id);
    assert.equal(response.body.published, false);

    const result = await pool.query(
        'SELECT title FROM posts WHERE id = $1',
        [response.body.id]
    );

    assert.equal(result.rows[0].title, 'Publicación de prueba');
});

test('Eliminar un recurso inexistente devuelve 404', async () => {
    const author = await createTestAuthor();

    const firstResponse = await request(app)
        .delete(`/authors/${author.id}`);

    assert.equal(firstResponse.status, 204);

    const secondResponse = await request(app)
        .delete(`/authors/${author.id}`);

    assert.equal(secondResponse.status, 404);
    assert.equal(secondResponse.body.message, 'Autor no encontrado');
});