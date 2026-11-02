const pool = require('../db/pool');

async function getAllAuthors() {
    const result = await pool.query(
        'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
    );

    return result.rows;
}

async function getAuthorById(id) {
    const result = await pool.query(
        'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
        [id]
    );

    return result.rows[0];
}

async function createAuthor({ name, email, bio }) {
    const result = await pool.query(
        `INSERT INTO authors (name, email, bio)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, bio, created_at`,
        [
            name.trim(),
            email.trim().toLowerCase(),
            bio === undefined ? null : bio.trim()
        ]
    );

    return result.rows[0];
}

async function updateAuthor(id, { name, email, bio }) {
    const result = await pool.query(
        `UPDATE authors
         SET name = $1, email = $2, bio = $3
         WHERE id = $4
         RETURNING id, name, email, bio, created_at`,
        [
            name.trim(),
            email.trim().toLowerCase(),
            bio === undefined ? null : bio.trim(),
            id
        ]
    );

    return result.rows[0];
}

async function deleteAuthor(id) {
    const result = await pool.query(
        'DELETE FROM authors WHERE id = $1 RETURNING id',
        [id]
    );

    return result.rows[0];
}

module.exports = {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor
};