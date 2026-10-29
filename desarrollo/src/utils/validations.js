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

module.exports = {
    isValidId,
    validateAuthor,
    validatePost
};